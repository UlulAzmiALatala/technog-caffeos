<?php

namespace App\Http\Middleware;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\CustomerFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user()?->load('cafe.template');

        $staffAiLogs = [];
        $activeWaiterCalls = [];

        if ($user) {
            // 1. Bagikan Riwayat Chat AI Database Assistant
            $token = AiToken::where('cafe_id', $user->cafe_id)
                ->where('user_id', $user->id)
                ->where('token_type', 'owner_assistant')
                ->first();

            if ($token) {
                $staffAiLogs = AiChatLog::where('ai_token_id', $token->id)
                    ->latest()
                    ->take(15)
                    ->get()
                    ->reverse()
                    ->values();
            }

            // 2. Bagikan Panggilan Pelayan (Smart Waiter Call) Aktif ke Seluruh Halaman Admin
            if (Schema::hasTable('customer_feedbacks')) {
                $activeWaiterCalls = CustomerFeedback::with('order')
                    ->where('cafe_id', $user->cafe_id)
                    ->whereNotNull('waiter_call_type')
                    ->where('is_resolved', false)
                    ->latest()
                    ->get();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'cafe' => $user?->cafe,
                'activeTemplate' => $user?->cafe?->template?->slug ?? 'cyber-dark',
            ],
            'staffAiLogs' => $staffAiLogs,
            'activeWaiterCalls' => $activeWaiterCalls,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'ai_token' => fn() => $request->session()->get('ai_token'),
            ],
        ];
    }
}
