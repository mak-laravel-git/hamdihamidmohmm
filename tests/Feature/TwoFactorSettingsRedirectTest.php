<?php

use App\Models\User;
use Laravel\Fortify\Features;

test('two factor settings redirects job seekers to portal security settings', function () {
    if (! Features::enabled(Features::twoFactorAuthentication())) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $seeker = User::factory()->jobSeeker()->create();

    $this->actingAs($seeker)
        ->get(route('two-factor.show'))
        ->assertRedirect(route('job-seeker.settings', ['tab' => 'security']));
});

test('two factor settings redirects employers to portal account settings', function () {
    if (! Features::enabled(Features::twoFactorAuthentication())) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $employer = User::factory()->employer()->create();

    $this->actingAs($employer)
        ->get(route('two-factor.show'))
        ->assertRedirect(route('employer.settings', ['tab' => 'account']));
});

test('two factor settings redirects admins to platform security settings', function () {
    if (! Features::enabled(Features::twoFactorAuthentication())) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('two-factor.show'))
        ->assertRedirect(route('admin.settings.index', ['tab' => 'security']));
});

test('employer settings exposes two factor status', function () {
    $employer = User::factory()->employer()->create([
        'two_factor_confirmed_at' => now(),
    ]);

    $this->actingAs($employer)
        ->get(route('employer.settings'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backend/User/EmployerSettings')
            ->where('two_factor_enabled', true));
});

test('admin platform settings exposes two factor status', function () {
    $admin = User::factory()->admin()->create([
        'two_factor_confirmed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backend/Admin/PlatformSettings')
            ->where('two_factor_enabled', true));
});
