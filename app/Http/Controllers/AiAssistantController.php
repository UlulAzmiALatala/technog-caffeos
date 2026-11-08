<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\Attendance;
use App\Models\CashierShift;
use App\Models\Customer;
use App\Models\CustomerFeedback;
use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiAssistantController extends Controller
{
    /**
     * Baca nilai dari .env secara langsung jika cache Laravel belum di-restart
     */
    private static function getEnvValue(string $key, string $default = ''): string
    {
        $val = env($key);
        if (!empty($val)) {
            return trim((string) $val, " \t\n\r\0\x0B\"'");
        }

        $envPath = base_path('.env');
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (str_starts_with(trim($line), '#')) {
                    continue;
                }
                if (str_starts_with(trim($line), $key . '=')) {
                    $parts = explode('=', $line, 2);
                    return trim($parts[1] ?? '', " \t\n\r\0\x0B\"'");
                }
            }
        }

        return $default;
    }

    /**
     * Mesin Pemanggil AI Multi-Gateway:
     * 1. 9Router (Jika diset)
     * 2. Google Gemini API (Mendukung AIzaSy... maupun OAuth/Vertex)
     * 3. Auto Cloud LLM Gateway (Agar pertanyaan bebas/umum 100% selalu dijawab cerdas!)
     */
    public static function callExternalAi(string $systemInstruction, string $userPrompt): ?string
    {
        // GATEWAY 1: 9Router / Custom OpenAI-Compatible Endpoint
        $routerUrl = self::getEnvValue('AI_ROUTER_URL');
        $routerKey = self::getEnvValue('AI_ROUTER_KEY');
        $routerModel = self::getEnvValue('AI_ROUTER_MODEL', 'gemini-2.5-flash');

        if (!empty($routerUrl)) {
            try {
                $req = Http::withoutVerifying()->timeout(15);
                if (!empty($routerKey)) {
                    $req = $req->withToken($routerKey);
                }
                $res = $req->post($routerUrl, [
                    'model' => $routerModel,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.7,
                ]);

                $content = $res->json('choices.0.message.content');
                if (!empty($content)) {
                    return $content;
                }
            } catch (\Exception $e) {
                // Lanjut ke Gateway berikutnya
            }
        }

        // GATEWAY 2: Google Gemini API Resmi
        $geminiKey = self::getEnvValue('GEMINI_API_KEY');
        if (!empty($geminiKey)) {
            $modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            foreach ($modelsToTry as $modelName) {
                try {
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$geminiKey}";
                    $response = Http::withoutVerifying()
                        ->timeout(12)
                        ->post($url, [
                            'contents' => [[
                                'parts' => [[
                                    'text' => $systemInstruction . "\n\nPERTANYAAN USER:\n" . $userPrompt,
                                ]],
                            ]],
                        ]);

                    if ($response->successful()) {
                        $geminiText = $response->json('candidates.0.content.parts.0.text');
                        if (!empty($geminiText)) {
                            return $geminiText;
                        }
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        // GATEWAY 3: Automatic Cloud LLM Fallback (Menjamin AI 100% selalu bisa menjawab topik bebas + database!)
        try {
            $fallbackRes = Http::withoutVerifying()
                ->timeout(20)
                ->post('https://text.pollinations.ai/openai', [
                    'model' => 'openai',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.7,
                ]);

            if ($fallbackRes->successful()) {
                $text = $fallbackRes->json('choices.0.message.content');
                if (!empty($text)) {
                    return $text;
                }
            }
        } catch (\Exception $e) {
            // Jika benar-benar tidak ada koneksi internet di laptop
        }

        return null;
    }

    public function askStaffAi(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;
        $cafeId = $cafe->id;
        $role = $user->role; // owner | cashier | barista
        $prompt = trim($request->prompt);
        $qLower = strtolower($prompt);

        // 1. KUMPULKAN DATA LIVE DARI SELURUH TABEL DATABASE KAFE
        $validOrders = Order::where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
        $totalRevenue = (float) (clone $validOrders)->sum('grand_total');
        $todayRevenue = (float) (clone $validOrders)->whereDate('created_at', today())->sum('grand_total');
        $totalOrdersCount = (clone $validOrders)->count();
        $todayOrdersCount = (clone $validOrders)->whereDate('created_at', today())->count();

        $totalExpenses = (float) Expense::where('cafe_id', $cafeId)->sum('amount');
        $netProfit = $totalRevenue - $totalExpenses;

        $activeKitchenOrders = Order::with('items.menu')
            ->where('cafe_id', $cafeId)
            ->whereIn('order_status', ['pending', 'paid', 'processing', 'ready'])
            ->get();

        $allStocks = Stock::where('cafe_id', $cafeId)->get();
        $lowStocks = $allStocks->filter(fn($s) => $s->current_qty <= $s->min_qty_alert);
        $menus = Menu::with('stocks')->where('cafe_id', $cafeId)->get();

        $topMenus = OrderItem::select('menu_id', DB::raw('SUM(qty) as sold_qty'))
            ->whereHas('order', fn($q) => $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled'))
            ->with('menu:id,name,price')
            ->groupBy('menu_id')
            ->orderByDesc('sold_qty')
            ->take(3)
            ->get();

        $activeShift = CashierShift::with('user')
            ->where('cafe_id', $cafeId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        $drawerCashSales = 0;
        if ($activeShift) {
            $drawerCashSales = (float) Order::where('cafe_id', $cafeId)
                ->where('created_at', '>=', $activeShift->opened_at)
                ->whereHas('payment', fn($q) => $q->where('payment_status', 'paid')->where('payment_method', 'cash'))
                ->sum('grand_total');
        }
        $expectedDrawerCash = $activeShift ? ((float) $activeShift->opening_cash + $drawerCashSales) : 0;

        $tables = DiningTable::where('cafe_id', $cafeId)->get();
        $availableTables = $tables->where('status', 'available')->pluck('table_number')->implode(', ');
        $activeVouchers = Voucher::where('cafe_id', $cafeId)->where('is_active', true)->get();
        $todayAttendances = Attendance::with('user')->where('cafe_id', $cafeId)->whereDate('work_date', today())->get();
        $topCustomers = Customer::withSum('orders', 'grand_total')->where('cafe_id', $cafeId)->orderByDesc('orders_sum_grand_total')->take(3)->get();
        $avgRating = round((float) CustomerFeedback::where('cafe_id', $cafeId)->whereNotNull('rating')->avg('rating'), 1) ?: 5.0;

        // 2. SUSUN SNAPSHOT KONTEKS DATABASE
        $stocksText = $allStocks->map(fn($s) => "{$s->name}: {$s->current_qty}{$s->unit}")->implode(', ');
        $lowStocksText = $lowStocks->count() > 0
            ? $lowStocks->map(fn($s) => "{$s->name} (Sisa {$s->current_qty}{$s->unit})")->implode(', ')
            : 'Semua stok aman';

        $menusSopText = $menus->map(function ($m) {
            $rcp = $m->stocks->map(fn($s) => "{$s->name} {$s->pivot->qty_needed}{$s->unit}")->implode(' + ');
            $sop = !empty($m->treatment) ? $m->treatment : 'Standar Barista';
            return "{$m->name} (Rp " . number_format($m->price, 0, ',', '.') . " | SOP: {$sop} | Resep: {$rcp})";
        })->implode('; ');

        $topMenusText = $topMenus->map(fn($t) => ($t->menu ? $t->menu->name : 'Menu') . " ({$t->sold_qty} cup)")->implode(', ');
        if (empty($topMenusText)) {
            $topMenusText = 'Belum ada penjualan';
        }

        $vouchersText = $activeVouchers->map(fn($v) => "{$v->code} ({$v->name})")->implode(', ');
        if (empty($vouchersText)) {
            $vouchersText = 'Tidak ada voucher aktif';
        }

        $presentStaffText = $todayAttendances->map(fn($a) => ($a->user ? $a->user->name : 'Staf') . " ({$a->face_confidence}% Match)")->implode(', ');
        if (empty($presentStaffText)) {
            $presentStaffText = 'Belum ada staf Clock-In hari ini';
        }

        $shiftInfoText = $activeShift
            ? "Aktif (" . ($activeShift->user ? $activeShift->user->name : 'Kasir') . "), Uang di Laci Seharusnya Rp " . number_format($expectedDrawerCash, 0, ',', '.')
            : "Belum dibuka";

        $systemInstruction = "Kamu adalah AI Super Assistant & Co-Worker cerdas di platform TechnoG CaffeOS untuk kafe '{$cafe->name}'.
Kamu sedang berbicara dengan {$user->name} (Jabatan: " . strtoupper($role) . ").

ATURAN PENTING (HYBRID INTELLIGENCE):
1. JIKA user bertanya tentang operasional kafe (omzet, laba rugi, stok gudang, resep kopi, laci kasir, meja kosong, voucher, atau absensi staf), jawablah dengan ANGKA AKURAT dari DATA LIVE DATABASE berikut:
   - Total Omzet Akumulasi: Rp " . number_format($totalRevenue, 0, ',', '.') . " ({$totalOrdersCount} transaksi)
   - Omzet Hari Ini: Rp " . number_format($todayRevenue, 0, ',', '.') . " ({$todayOrdersCount} transaksi)
   - Total Pengeluaran (Expenses): Rp " . number_format($totalExpenses, 0, ',', '.') . "
   - Laba Bersih (Net Profit): Rp " . number_format($netProfit, 0, ',', '.') . "
   - Menu Terlaris: {$topMenusText}
   - Laci Shift Kasir: {$shiftInfoText}
   - Antrean Dapur Aktif: {$activeKitchenOrders->count()} pesanan
   - Stok Menipis: {$lowStocksText}
   - Seluruh Stok Gudang: {$stocksText}
   - Daftar Menu & Resep: {$menusSopText}
   - Meja Kosong: Meja #{$availableTables}
   - Voucher Aktif: {$vouchersText}
   - Staf Hadir Hari Ini: {$presentStaffText}
   - Rating Kafe: {$avgRating}/5.0

2. JIKA user bertanya tentang PENGETAHUAN UMUM, ANALISIS POLITIK, BERITA, SEJARAH, SAINS, CODING, atau topik apa pun di luar kafe (contoh: pertanyaan tentang tokoh publik, presiden, teknologi, dll.), JANGAN menjawab dengan data menu kopi! Jawablah pertanyaan umum tersebut secara langsung, mendalam, analitis, objektif, dan informatif menggunakan pengetahuan luasmu dalam Bahasa Indonesia.";

        // 3. PANGGIL CLOUD AI (GEMINI / 9ROUTER / AUTO FALLBACK LLM)
        $aiResponse = self::callExternalAi($systemInstruction, $prompt);

        // 4. JIKA LAPTOP BENAR-BENAR OFFLINE TANPA INTERNET, GUNAKAN REGEX DATABASE ANALYZER (ANTI SALAH BACA "MENURUT")
        if (!$aiResponse) {
            $aiResponse = $this->generateDatabaseAwareReply(
                $qLower,
                $prompt,
                $user,
                $cafe,
                $totalRevenue,
                $todayRevenue,
                $totalExpenses,
                $netProfit,
                $totalOrdersCount,
                $todayOrdersCount,
                $topMenusText,
                $activeShift,
                $expectedDrawerCash,
                $activeKitchenOrders,
                $lowStocks,
                $lowStocksText,
                $allStocks,
                $menus,
                $availableTables,
                $vouchersText,
                $presentStaffText,
                $topCustomers,
                $avgRating
            );
        }

        $staffToken = AiToken::firstOrCreate(
            [
                'cafe_id' => $cafeId,
                'user_id' => $user->id,
                'token_type' => 'owner_assistant',
            ],
            [
                'token_code' => strtoupper($role) . '-AI-' . strtoupper(Str::random(5)),
                'quota_limit' => 9999,
                'expires_at' => now()->addYear(),
            ]
        );

        AiChatLog::create([
            'ai_token_id' => $staffToken->id,
            'prompt' => $prompt,
            'response' => $aiResponse,
        ]);

        $staffToken->increment('quota_used');

        return back()->with('success', 'AI Co-Worker berhasil merespons pertanyaan Anda!');
    }

    private function generateDatabaseAwareReply(
        string $q,
        string $rawPrompt,
        $user,
        $cafe,
        float $totalRevenue,
        float $todayRevenue,
        float $totalExpenses,
        float $netProfit,
        int $totalOrdersCount,
        int $todayOrdersCount,
        string $topMenusText,
        $activeShift,
        float $expectedDrawerCash,
        $activeKitchenOrders,
        $lowStocks,
        string $lowStocksText,
        $allStocks,
        $menus,
        string $availableTables,
        string $vouchersText,
        string $presentStaffText,
        $topCustomers,
        float $avgRating
    ): string {
        // Gunakan pencocokan kata utuh (\b) agar kata "menurut" TIDAK dianggap sebagai "menu"!
        if (preg_match('/\b(omzet|laba|untung|keuangan|pendapatan|pengeluaran|profit|penjualan)\b/i', $q)) {
            return "📊 **Laporan Keuangan Real-Time ({$cafe->name}):**\n" .
                "• **Omzet Hari Ini:** Rp " . number_format($todayRevenue, 0, ',', '.') . " ({$todayOrdersCount} transaksi)\n" .
                "• **Total Omzet Akumulasi:** Rp " . number_format($totalRevenue, 0, ',', '.') . " ({$totalOrdersCount} transaksi)\n" .
                "• **Total Kas Keluar (Expenses):** -Rp " . number_format($totalExpenses, 0, ',', '.') . "\n" .
                "• **Estimasi Laba Bersih (Net Profit):** **Rp " . number_format($netProfit, 0, ',', '.') . "**\n" .
                "• **Menu Terlaris:** {$topMenusText}.";
        }

        if (preg_match('/\b(stok|stock|gudang|bahan baku|habis|menipis|kritis|restock)\b/i', $q)) {
            $detailAll = $allStocks->map(fn($s) => "{$s->name}: **" . number_format($s->current_qty, 0, ',', '.') . " {$s->unit}**")->implode(' | ');
            return "📦 **Audit Stok Gudang Real-Time:**\n" .
                "• **Status Kritis ({$lowStocks->count()} item):** {$lowStocksText}\n" .
                "• **Rincian Saldo Gudang:** {$detailAll}";
        }

        if (preg_match('/\b(resep|sop|takaran|menu|racik|kopi|harga|laris)\b/i', $q)) {
            $menuLines = $menus->map(function ($m) {
                $ing = $m->stocks->map(fn($s) => "{$s->name} ({$s->pivot->qty_needed}{$s->unit})")->implode(' + ');
                $sopText = !empty($m->treatment) ? $m->treatment : 'Standar Barista';
                $ingText = !empty($ing) ? $ing : 'Tanpa resep khusus';
                return "• **{$m->name}** (Rp " . number_format($m->price, 0, ',', '.') . ") — SOP: *{$sopText}* | Bahan: [{$ingText}]";
            })->implode("\n");

            return "☕ **Data Katalog Menu & SOP Resep:**\n• **Top Terlaris:** {$topMenusText}\n{$menuLines}";
        }

        if (preg_match('/\b(laci|shift|kasir|modal|tunai|cash|petty)\b/i', $q)) {
            if (!$activeShift) {
                return "🔒 **Status Laci Kasir:** Belum ada Shift Kasir yang dibuka saat ini.";
            }
            $cashierName = $activeShift->user ? $activeShift->user->name : 'Kasir';
            return "💵 **Status Shift Laci Kasir Aktif ({$cashierName}):**\n" .
                "• **Modal Awal:** Rp " . number_format($activeShift->opening_cash, 0, ',', '.') . "\n" .
                "• **Total Uang Tunai Seharusnya di Laci:** **Rp " . number_format($expectedDrawerCash, 0, ',', '.') . "**";
        }

        if (preg_match('/\b(antrean|antrian|dapur|order|pesanan|kds)\b/i', $q)) {
            if ($activeKitchenOrders->isEmpty()) {
                return "✅ **Status Dapur KDS:** Semua antrean pesanan telah selesai disajikan!";
            }
            $list = $activeKitchenOrders->map(fn($o) => "#{$o->queue_number} {$o->customer_name} (" . strtoupper($o->order_status) . ")")->implode(', ');
            return "🔥 **Antrean Dapur Aktif ({$activeKitchenOrders->count()} Order):** {$list}";
        }

        if (preg_match('/\b(meja|reservasi|booking|promo|voucher|diskon|member|pelanggan|rating)\b/i', $q)) {
            return "🏷️ **Status Meja, Promo & Member:**\n" .
                "• **Meja Kosong:** #{$availableTables}\n" .
                "• **Voucher Aktif:** {$vouchersText}\n" .
                "• **Rating Kafe:** ⭐ {$avgRating} / 5.0";
        }

        if (preg_match('/\b(staf|karyawan|absen|hadir|wajah|gaji|hr)\b/i', $q)) {
            return "👥 **Kehadiran Biometrik Staf Hari Ini:** {$presentStaffText}";
        }

        return "🤖 **Halo {$user->name} (" . strtoupper($user->role) . ")!**\n" .
            "Pertanyaan Anda: *\"{$rawPrompt}\"*\n" .
            "*(Pastikan perangkat terhubung ke internet agar Cloud LLM dapat menjawab topik umum di luar database kafe)*.\n\n" .
            "**Ringkasan Database Live {$cafe->name}:**\n" .
            "• 💰 **Omzet Hari Ini:** Rp " . number_format($todayRevenue, 0, ',', '.') . " (Laba Bersih: **Rp " . number_format($netProfit, 0, ',', '.') . "**)\n" .
            "• 🏆 **Menu Terlaris:** {$topMenusText}\n" .
            "• 🔥 **Antrean Dapur Aktif:** {$activeKitchenOrders->count()} pesanan | **Meja Kosong:** #{$availableTables}";
    }
}
