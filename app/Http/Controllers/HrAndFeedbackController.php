<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CustomerFeedback;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HrAndFeedbackController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $user = $request->user();

        $todayAttendance = Attendance::where('cafe_id', $cafeId)
            ->where('user_id', $user->id)
            ->whereDate('work_date', today())
            ->first();

        $attendances = Attendance::with('user')
            ->where('cafe_id', $cafeId)
            ->latest('work_date')
            ->latest()
            ->take(30)
            ->get();

        $feedbacks = CustomerFeedback::with('order')
            ->where('cafe_id', $cafeId)
            ->latest()
            ->take(30)
            ->get();

        $avgRating = CustomerFeedback::where('cafe_id', $cafeId)
            ->whereNotNull('rating')
            ->avg('rating');

        $settings = $cafe->settings ?? [];
        $cafeGps = [
            'lat' => (float) ($settings['cafe_lat'] ?? -0.891700),
            'lng' => (float) ($settings['cafe_lng'] ?? 119.870700),
            'max_radius' => (int) ($settings['max_radius_meters'] ?? 150),
        ];

        // Ambil Data Master Wajah Biometrik milik User yang sedang login (Owner / Cashier / Barista)
        $faceProfiles = $settings['face_profiles'] ?? [];
        $myFaceProfile = $faceProfiles[$user->id] ?? null;

        return Inertia::render('Hr/Index', [
            'todayAttendance' => $todayAttendance,
            'attendances' => $attendances,
            'feedbacks' => $feedbacks,
            'avgRating' => round((float) $avgRating, 1),
            'activeCallsCount' => $feedbacks->whereNotNull('waiter_call_type')->where('is_resolved', false)->count(),
            'cafeGps' => $cafeGps,
            'myFaceProfile' => $myFaceProfile,
            'staffs' => User::where('cafe_id', $cafeId)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    private function saveFacePhoto(?string $base64Image, string $prefix): ?string
    {
        if (!$base64Image || !str_contains($base64Image, 'base64,')) {
            return null;
        }

        $imageParts = explode(';base64,', $base64Image);
        $imageDecoded = base64_decode($imageParts[1]);
        $fileName = 'attendances/' . $prefix . '_' . time() . '_' . Str::random(5) . '.jpg';

        Storage::disk('public')->put($fileName, $imageDecoded);

        return '/storage/' . $fileName;
    }

    // 1. Registrasi Wajah Master User (Agar Sistem Mengenali Wajah Owner/Staf Tersebut)
    public function enrollMasterFace(Request $request)
    {
        $validated = $request->validate([
            'photo_base64' => 'required|string',
            'descriptor' => 'required|array',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;

        $photoUrl = $this->saveFacePhoto($validated['photo_base64'], 'master_face_user_' . $user->id);

        $settings = $cafe->settings ?? [];
        $faceProfiles = $settings['face_profiles'] ?? [];

        $faceProfiles[$user->id] = [
            'user_id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'photo_url' => $photoUrl,
            'descriptor' => $validated['descriptor'], // Vektor 64-titik pencahayaan & kontur wajah
            'enrolled_at' => now()->format('d M Y H:i'),
        ];

        $settings['face_profiles'] = $faceProfiles;
        $cafe->update(['settings' => $settings]);

        return back()->with(
            'success',
            "Wajah Master untuk {$user->name} (" . strtoupper($user->role) . ") berhasil didaftarkan ke Biometric Engine!"
        );
    }

    // 2. Absen Masuk Kerja (Clock-In) dengan Pencocokan Wajah Master & GPS
    public function clockIn(Request $request)
    {
        $validated = $request->validate([
            'photo_base64' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'distance_meters' => 'required|numeric',
            'face_confidence' => 'required|numeric',
            'notes' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;
        $maxRadius = (int) ($cafe->settings['max_radius_meters'] ?? 150);

        $photoPath = $this->saveFacePhoto($validated['photo_base64'], 'in_' . $user->id);

        $distance = (int) round($validated['distance_meters']);
        $status = 'present';
        if ($distance > $maxRadius) {
            $status = 'outside_radius';
        } elseif (now()->format('H:i') > '09:00') {
            $status = 'late';
        }

        Attendance::updateOrCreate(
            [
                'cafe_id' => $user->cafe_id,
                'user_id' => $user->id,
                'work_date' => today(),
            ],
            [
                'clock_in' => now(),
                'photo_in' => $photoPath,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'distance_meters' => $distance,
                'face_confidence' => $validated['face_confidence'],
                'status' => $status,
                'notes' => $validated['notes'] ?? "Terverifikasi sbg {$user->name} ({$validated['face_confidence']}%) • {$distance}m",
            ]
        );

        return back()->with(
            'success',
            "Identitas Wajah Cocok ({$validated['face_confidence']}%)! Clock-In {$user->name} (" . strtoupper($user->role) . ") tercatat."
        );
    }

    // 3. Absen Pulang Kerja (Clock-Out)
    public function clockOut(Request $request)
    {
        $user = $request->user();

        $attendance = Attendance::where('cafe_id', $user->cafe_id)
            ->where('user_id', $user->id)
            ->whereDate('work_date', today())
            ->firstOrFail();

        $photoOutPath = $this->saveFacePhoto($request->input('photo_base64'), 'out_' . $user->id);

        $attendance->update([
            'clock_out' => now(),
            'photo_out' => $photoOutPath ?? $attendance->photo_out,
        ]);

        return back()->with('success', "Absen Pulang (Clock-Out) untuk {$user->name} berhasil disimpan!");
    }

    // 4. Kalibrasi Titik Koordinat GPS Kafe ke Lokasi Saat Ini
    public function setCafeLocation(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'max_radius' => 'required|integer|min:10|max:5000',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $settings['cafe_lat'] = (float) $validated['latitude'];
        $settings['cafe_lng'] = (float) $validated['longitude'];
        $settings['max_radius_meters'] = (int) $validated['max_radius'];

        $cafe->update(['settings' => $settings]);

        return back()->with(
            'success',
            "Titik Koordinat GPS Kafe berhasil dikalibrasi ke lokasi Anda saat ini (Radius: {$validated['max_radius']}m)!"
        );
    }

    public function resolveCall(CustomerFeedback $feedback)
    {
        $feedback->update(['is_resolved' => true]);
        return back()->with('success', "Permintaan meja {$feedback->table_number} ({$feedback->waiter_call_type}) telah diselesaikan!");
    }

    public function submitCustomerAction(Request $request, $orderCode)
    {
        $order = Order::with('table')->where('order_code', $orderCode)->firstOrFail();

        $validated = $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:300',
            'waiter_call_type' => 'nullable|string|max:100',
        ]);

        CustomerFeedback::create([
            'cafe_id' => $order->cafe_id,
            'order_id' => $order->id,
            'customer_name' => $order->customer_name,
            'table_number' => $order->table?->table_number ?? 'Takeaway',
            'rating' => $validated['rating'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'waiter_call_type' => $validated['waiter_call_type'] ?? null,
            'is_resolved' => empty($validated['waiter_call_type']),
        ]);

        $msg = !empty($validated['waiter_call_type'])
            ? "Panggilan '{$validated['waiter_call_type']}' telah dikirim ke Barista/Pelayan!"
            : 'Terima kasih atas rating & ulasan Anda!';

        return back()->with('success', $msg);
    }
}
