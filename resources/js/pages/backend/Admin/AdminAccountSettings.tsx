import { Head, useForm, usePage } from '@inertiajs/react';
import { Lock, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import {
    AdminPageHeader,
    AdminPanel,
    AdminPrimaryButton,
} from '@/components/admin-portal/ui';
import TwoFactorSettingsPanel from '@/components/two-factor-settings-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import AdminPortalLayout from '@/layouts/admin-portal-layout';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

const tabs = [
    {
        id: 'profile',
        labelKey: 'admin.account.tabs.profile',
        icon: UserRound,
    },
    {
        id: 'security',
        labelKey: 'admin.account.tabs.security',
        icon: Lock,
    },
] as const;

type TabId = (typeof tabs)[number]['id'];

function initialTabFromUrl(): TabId {
    if (typeof window === 'undefined') {
        return 'profile';
    }

    const tab = new URLSearchParams(window.location.search).get('tab');

    return tabs.some((item) => item.id === tab) ? (tab as TabId) : 'profile';
}

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        role_label: string;
    };
    mustVerifyEmail: boolean;
    two_factor_enabled: boolean;
    status?: string | null;
};

export default function AdminAccountSettings({
    user,
    mustVerifyEmail,
    two_factor_enabled,
    status,
}: Props) {
    const { auth, flash } = usePage<SharedData>().props;
    const { t } = useLocale();
    const [activeTab, setActiveTab] = useState<TabId>(initialTabFromUrl);

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const switchTab = (id: TabId): void => {
        setActiveTab(id);

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', id);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const submitProfile = (event: FormEvent): void => {
        event.preventDefault();
        profileForm.put('/admin/account', { preserveScroll: true });
    };

    const submitPassword = (event: FormEvent): void => {
        event.preventDefault();
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AdminPortalLayout>
            <Head title={t('admin.account.title')} />

            <div className="space-y-6 p-6">
                <AdminPageHeader title={t('admin.account.title')} />

                {flash.success && (
                    <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#15803d]">
                        {typeof flash.success === 'string'
                            ? flash.success
                            : t('common.saved')}
                    </div>
                )}

                {status === 'verification-link-sent' && (
                    <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#15803d]">
                        {t('settings.profile.verification_sent')}
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                    <AdminPanel className="h-fit space-y-1 p-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchTab(tab.id)}
                                    className={cn(
                                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                                        activeTab === tab.id
                                            ? 'bg-[#0057c8] text-white'
                                            : 'text-[#64748b] hover:bg-[#f8faff]',
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {t(tab.labelKey)}
                                </button>
                            );
                        })}
                    </AdminPanel>

                    <AdminPanel>
                        {activeTab === 'profile' && (
                            <form
                                className="max-w-xl space-y-5"
                                onSubmit={submitProfile}
                            >
                                <div>
                                    <h2 className="text-base font-bold text-[#101828]">
                                        {t('admin.account.profile_heading')}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#6a7282]">
                                        {t('admin.account.profile_description')}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="name"
                                        className="text-xs text-[#99a1af]"
                                    >
                                        {t('common.name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={profileForm.data.name}
                                        onChange={(event) =>
                                            profileForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className="rounded-xl border-[#e2e8f0]"
                                        autoComplete="name"
                                        required
                                    />
                                    {profileForm.errors.name ? (
                                        <p className="text-sm text-[#b91c1c]">
                                            {profileForm.errors.name}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="email"
                                        className="text-xs text-[#99a1af]"
                                    >
                                        {t('common.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(event) =>
                                            profileForm.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        className="rounded-xl border-[#e2e8f0]"
                                        autoComplete="username"
                                        required
                                    />
                                    {profileForm.errors.email ? (
                                        <p className="text-sm text-[#b91c1c]">
                                            {profileForm.errors.email}
                                        </p>
                                    ) : null}
                                </div>

                                {mustVerifyEmail &&
                                auth.user.email_verified_at === null ? (
                                    <p className="text-sm text-[#6a7282]">
                                        {t('settings.profile.unverified')}
                                    </p>
                                ) : null}

                                <AdminPrimaryButton
                                    type="submit"
                                    disabled={profileForm.processing}
                                >
                                    {t('common.save_changes')}
                                </AdminPrimaryButton>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="max-w-xl space-y-8">
                                <form
                                    className="space-y-5"
                                    onSubmit={submitPassword}
                                >
                                    <div>
                                        <h2 className="text-base font-bold text-[#101828]">
                                            {t(
                                                'admin.account.security_heading',
                                            )}
                                        </h2>
                                        <p className="mt-1 text-sm text-[#6a7282]">
                                            {t(
                                                'admin.account.security_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-[#99a1af]">
                                            {t(
                                                'admin.account.current_password',
                                            )}
                                        </Label>
                                        <Input
                                            type="password"
                                            value={
                                                passwordForm.data
                                                    .current_password
                                            }
                                            onChange={(event) =>
                                                passwordForm.setData(
                                                    'current_password',
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-xl border-[#e2e8f0]"
                                            autoComplete="current-password"
                                        />
                                        {passwordForm.errors
                                            .current_password ? (
                                            <p className="text-sm text-[#b91c1c]">
                                                {
                                                    passwordForm.errors
                                                        .current_password
                                                }
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-[#99a1af]">
                                            {t('admin.account.new_password')}
                                        </Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(event) =>
                                                passwordForm.setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-xl border-[#e2e8f0]"
                                            autoComplete="new-password"
                                        />
                                        {passwordForm.errors.password ? (
                                            <p className="text-sm text-[#b91c1c]">
                                                {passwordForm.errors.password}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-[#99a1af]">
                                            {t(
                                                'admin.account.confirm_password',
                                            )}
                                        </Label>
                                        <Input
                                            type="password"
                                            value={
                                                passwordForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(event) =>
                                                passwordForm.setData(
                                                    'password_confirmation',
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-xl border-[#e2e8f0]"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <AdminPrimaryButton
                                        type="submit"
                                        disabled={passwordForm.processing}
                                    >
                                        {t('admin.account.change_password')}
                                    </AdminPrimaryButton>
                                </form>

                                <TwoFactorSettingsPanel
                                    className="border-t border-[#e2e8f0] pt-6"
                                    twoFactorEnabled={two_factor_enabled}
                                />
                            </div>
                        )}
                    </AdminPanel>
                </div>
            </div>
        </AdminPortalLayout>
    );
}
