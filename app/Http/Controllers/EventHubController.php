<?php

namespace App\Http\Controllers;

use App\Models\AiToken;
use App\Models\Customer;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventHubController extends Controller
{
    /**
     * Helper: Ambil daftar event dari database atau inisialisasi otomatis jika masih kosong
     */
    private function getOrInitEvents($cafe): array
    {
        $settings = $cafe->settings ?? [];

        if (empty($settings['cafe_events'])) {
            $settings['cafe_events'] = [
                [
                    'id' => 'evt-1',
                    'title' => 'Latte Art & Basic Espresso Workshop',
                    'category' => 'Coffee Masterclass',
                    'event_date' => now()->addDays(3)->format('Y-m-d'),
                    'event_time' => '15:00 - 18:00 WITA',
                    'speaker' => 'Head Barista TechnoG',
                    'ticket_price' => 125000,
                    'quota' => 20,
                    'sold_count' => 4,
                    'ai_quota_bonus' => 30,
                    'perks' => 'Sertifikat Workshop + Beans 100g + Free 2 Cup Kopi + 30x AI Token',
                ],
                [
                    'id' => 'evt-2',
                    'title' => 'Tech & Startup Founders Networking Night',
                    'category' => 'Community Gathering',
                    'event_date' => now()->addDays(5)->format('Y-m-d'),
                    'event_time' => '19:00 - 22:00 WITA',
                    'speaker' => 'Co-Founders TechnoG Solutions',
                    'ticket_price' => 75000,
                    'quota' => 35,
                    'sold_count' => 8,
                    'ai_quota_bonus' => 25,
                    'perks' => 'Signature Mocktail/Coffee + Snack Platter + Akses VIP AI Co-Worker',
                ],
            ];

            $cafe->update(['settings' => $settings]);
        }

        return $settings['cafe_events'];
    }

    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;

        $events = $this->getOrInitEvents($cafe);
        $settings = $cafe->fresh()->settings ?? [];
        $tickets = $settings['event_tickets'] ?? [];

        return Inertia::render('Events/Index', [
            'cafe' => $cafe,
            'events' => $events,
            'tickets' => $tickets,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Buat Event / Workshop Kafe Baru
    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'event_date' => 'required|string',
            'event_time' => 'required|string|max:50',
            'speaker' => 'required|string|max:100',
            'ticket_price' => 'required|numeric|min:0',
            'quota' => 'required|integer|min:1',
            'perks' => 'required|string|max:255',
        ]);

        $cafe = $request->user()->cafe;
        $events = $this->getOrInitEvents($cafe);
        $settings = $cafe->fresh()->settings ?? [];

        array_unshift($events, [
            'id' => 'evt-' . time(),
            'title' => $validated['title'],
            'category' => $validated['category'],
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'],
            'speaker' => $validated['speaker'],
            'ticket_price' => (float) $validated['ticket_price'],
            'quota' => (int) $validated['quota'],
            'sold_count' => 0,
            'ai_quota_bonus' => 25,
            'perks' => $validated['perks'],
        ]);

        $settings['cafe_events'] = $events;
        $cafe->update(['settings' => $settings]);

        return back()->with('success', "Event/Workshop '{$validated['title']}' berhasil dipublikasikan!");
    }

    // 2. Registrasi Peserta Tiket Event & Catat Otomatis ke Omzet Kasir POS
    public function sellTicket(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|string',
            'participant_name' => 'required|string|max:150',
            'participant_phone' => 'required|string|max:30',
            'payment_method' => 'required|in:qris,cash,va',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;
        $cafeId = $cafe->id;

        // Pastikan daftar event bawaan sudah terinisialisasi sebelum dicari
        $currentEvents = $this->getOrInitEvents($cafe);
        $settings = $cafe->fresh()->settings ?? [];

        $selectedEvent = null;
        $events = collect($currentEvents)->map(function ($ev) use ($validated, &$selectedEvent) {
            if ((string) $ev['id'] === (string) $validated['event_id']) {
                $ev['sold_count'] = (int) ($ev['sold_count'] ?? 0) + 1;
                $selectedEvent = $ev;
            }
            return $ev;
        })->toArray();

        // Fallback ke event pertama jika state frontend belum memilih ID
        if (!$selectedEvent && count($events) > 0) {
            $events[0]['sold_count'] = (int) ($events[0]['sold_count'] ?? 0) + 1;
            $selectedEvent = $events[0];
        }

        if (!$selectedEvent) {
            return back()->with('error', 'Event tidak ditemukan!');
        }

        return DB::transaction(function () use ($validated, $user, $cafe, $cafeId, $settings, $events, $selectedEvent) {
            $todayCount = Order::where('cafe_id', $cafeId)->whereDate('created_at', today())->count();
            $queueNumber = $todayCount + 1;

            $customer = Customer::firstOrCreate(
                ['cafe_id' => $cafeId, 'phone' => $validated['participant_phone']],
                [
                    'name' => $validated['participant_name'],
                    'member_code' => 'EVT-' . strtoupper(Str::random(5)),
                ]
            );

            $ticketCode = 'TIX-' . strtoupper(Str::random(6));
            $price = (float) $selectedEvent['ticket_price'];

            $order = Order::create([
                'cafe_id' => $cafeId,
                'customer_id' => $customer->id,
                'cashier_id' => $user->id,
                'order_code' => $ticketCode,
                'queue_number' => $queueNumber,
                'customer_name' => $validated['participant_name'],
                'order_type' => 'dine_in',
                'order_status' => 'completed',
                'subtotal' => $price,
                'discount_total' => 0,
                'grand_total' => $price,
            ]);

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
                'amount_paid' => $price,
                'change_amount' => 0,
                'paid_at' => now(),
            ]);

            $aiToken = AiToken::create([
                'cafe_id' => $cafeId,
                'order_id' => $order->id,
                'token_code' => 'EVT-AI-' . strtoupper(Str::random(5)),
                'token_type' => 'customer_order',
                'quota_limit' => (int) ($selectedEvent['ai_quota_bonus'] ?? 25),
                'expires_at' => now()->addDays(7),
            ]);

            $tickets = $settings['event_tickets'] ?? [];
            array_unshift($tickets, [
                'id' => 'tix-' . time(),
                'ticket_code' => $ticketCode,
                'event_title' => $selectedEvent['title'],
                'event_date' => $selectedEvent['event_date'],
                'event_time' => $selectedEvent['event_time'],
                'participant_name' => $validated['participant_name'],
                'participant_phone' => $validated['participant_phone'],
                'price' => $price,
                'ai_token' => $aiToken->token_code,
                'created_at' => now()->format('d M Y H:i'),
            ]);

            $settings['cafe_events'] = $events;
            $settings['event_tickets'] = array_slice($tickets, 0, 50);
            $cafe->update(['settings' => $settings]);

            return back()->with([
                'success' => "Tiket {$ticketCode} ({$selectedEvent['title']}) untuk {$validated['participant_name']} berhasil diterbitkan!",
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }
}
