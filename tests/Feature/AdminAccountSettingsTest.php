<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('admins can view personal account settings', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.account.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backend/Admin/AdminAccountSettings')
            ->where('user.id', $admin->id)
            ->where('user.email', $admin->email)
            ->where('two_factor_enabled', false));
});

test('admins can update their personal profile', function () {
    $admin = User::factory()->admin()->create([
        'name' => 'Old Name',
        'email' => 'old-admin@example.com',
    ]);

    $this->actingAs($admin)
        ->from(route('admin.account.index'))
        ->put(route('admin.account.update'), [
            'name' => 'New Admin Name',
            'email' => 'new-admin@example.com',
        ])
        ->assertRedirect();

    $admin->refresh();

    expect($admin->name)->toBe('New Admin Name')
        ->and($admin->email)->toBe('new-admin@example.com');
});

test('admins can update their password from personal settings', function () {
    $admin = User::factory()->admin()->create([
        'password' => Hash::make('current-password'),
    ]);

    $this->actingAs($admin)
        ->from(route('admin.account.index', ['tab' => 'security']))
        ->put(route('user-password.update'), [
            'current_password' => 'current-password',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])
        ->assertRedirect();

    expect(Hash::check('new-secure-password', $admin->fresh()->password))->toBeTrue();
});

test('job seekers cannot access admin account settings', function () {
    $seeker = User::factory()->jobSeeker()->create();

    $this->actingAs($seeker)
        ->get(route('admin.account.index'))
        ->assertRedirect(route($seeker->dashboardRoute()));
});

test('admin account settings exposes two factor status', function () {
    $admin = User::factory()->admin()->create([
        'two_factor_confirmed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.account.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backend/Admin/AdminAccountSettings')
            ->where('two_factor_enabled', true));
});

test('admin platform settings does not expose two factor status', function () {
    $admin = User::factory()->admin()->create([
        'two_factor_confirmed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backend/Admin/PlatformSettings')
            ->missing('two_factor_enabled'));
});
