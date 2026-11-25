<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Backend\Admin\UpdateAdminAccountProfileRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccountSettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user?->isAdmin() === true, 403);

        return Inertia::render('backend/Admin/AdminAccountSettings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_label' => $user->role_label,
            ],
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(UpdateAdminAccountProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user?->isAdmin() === true, 403);

        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Profile updated.');
    }
}
