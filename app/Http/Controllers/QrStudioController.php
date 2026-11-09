<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QrStudioController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;

        return Inertia::render('QrStudio/Index', [
            'cafe' => $cafe,
            'tables' => DiningTable::where('cafe_id', $cafeId)->orderBy('table_number')->get(),
            'templates' => Template::where('is_active', true)->get(),
            'baseUrl' => url('/'),
        ]);
    }

    // Regenerasi Kode Unik QR Meja (Jika QR Lama Bocor / Perlu Di-reset)
    public function regenerateQr(Request $request, DiningTable $table)
    {
        $newQr = 'CAFEOS-TBL-' . strtoupper(Str::random(4)) . '-' . $table->table_number;
        $table->update(['qr_code' => $newQr]);

        return back()->with(
            'success',
            "Kode keamanan QR untuk Meja #{$table->table_number} berhasil diperbarui menjadi {$newQr}!"
        );
    }
}
