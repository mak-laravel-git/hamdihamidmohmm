<?php

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    if (! Features::enabled(Features::twoFactorAuthentication())) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }
});

test('recovery codes require password confirmation without recent confirmation', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->getJson(route('two-factor.recovery-codes'))
        ->assertStatus(423);
});

test('recovery codes are returned after password is confirmed', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('two-factor.recovery-codes'))
        ->assertOk()
        ->assertJson(['recovery-code-1']);
});

test('employers can fetch recovery codes after password confirmation', function () {
    $employer = User::factory()->employer()->withTwoFactor()->create();

    $this->actingAs($employer)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('two-factor.recovery-codes'))
        ->assertOk()
        ->assertJson(['recovery-code-1']);
});

test('admins can fetch recovery codes after password confirmation', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('two-factor.recovery-codes'))
        ->assertOk()
        ->assertJson(['recovery-code-1']);
});

test('password can be confirmed over json for two factor actions', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->postJson(route('password.confirm.store'), [
            'password' => 'password',
        ])
        ->assertCreated();

    $this->getJson(route('two-factor.recovery-codes'))
        ->assertOk()
        ->assertJson(['recovery-code-1']);
});

test('job seekers can fetch recovery codes after password confirmation', function () {
    $seeker = User::factory()->jobSeeker()->withTwoFactor()->create();

    $this->actingAs($seeker)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('two-factor.recovery-codes'))
        ->assertOk()
        ->assertJson(['recovery-code-1']);
});

test('json enable requires password confirmation then succeeds', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('two-factor.enable'))
        ->assertStatus(423);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson(route('two-factor.enable'))
        ->assertOk();

    expect($user->fresh()->two_factor_secret)->not->toBeNull();
});

test('json disable requires password confirmation then succeeds', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->deleteJson(route('two-factor.disable'))
        ->assertStatus(423);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->deleteJson(route('two-factor.disable'))
        ->assertOk();

    expect($user->fresh()->two_factor_secret)->toBeNull();
});

test('json regenerate recovery codes requires password confirmation then succeeds', function () {
    $user = User::factory()->withTwoFactor()->create();
    $original = $user->two_factor_recovery_codes;

    $this->actingAs($user)
        ->postJson(route('two-factor.regenerate-recovery-codes'))
        ->assertStatus(423);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson(route('two-factor.regenerate-recovery-codes'))
        ->assertOk();

    expect($user->fresh()->two_factor_recovery_codes)->not->toBe($original);
});
