<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Redirect to the role-specific portal settings page for 2FA management.
     */
    public function show(TwoFactorAuthenticationRequest $request): RedirectResponse
    {
        $request->ensureStateIsValid();

        $user = $request->user();

        if ($user?->isAdmin()) {
            return redirect()->route('admin.settings.index', ['tab' => 'security']);
        }

        if ($user?->isEmployer()) {
            return redirect()->route('employer.settings', ['tab' => 'account']);
        }

        return redirect()->route('job-seeker.settings', ['tab' => 'security']);
    }
}
