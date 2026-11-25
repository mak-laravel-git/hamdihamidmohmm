import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

import InputError from '@/components/input-error';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/hooks/use-locale';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useLocale();

    return (
        <AuthLayout title={t('auth.confirm_password_title')}>
            <Head title={t('auth.confirm_password')} />

            <div className="mb-4 flex justify-end">
                <div className="rounded-lg bg-[#0057c8]">
                    <LanguageSwitcher variant="header" />
                </div>
            </div>

            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#eff6ff]">
                    <ShieldCheck className="size-6 text-[#0057c8]" />
                </div>
                <h1 className="text-2xl font-extrabold leading-8 text-[#050315]">
                    {t('auth.confirm_password_title')}
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-5 text-[#6a7282]">
                    {t('auth.confirm_password_description')}
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="mt-7 space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="password"
                                className="text-sm font-semibold text-[#364153]"
                            >
                                {t('auth.password')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoFocus
                                autoComplete="current-password"
                                placeholder={t(
                                    'auth.confirm_password_placeholder',
                                )}
                                className="h-[46px] rounded-xl border-[#e2e8f0] bg-[#f9fafb] px-4 text-sm text-[#374151] placeholder:text-[rgba(55,65,81,0.5)] focus-visible:border-[#0057c8] focus-visible:ring-[#0057c8]/30"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            data-test="confirm-password-button"
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0057c8] text-base font-medium tracking-[-0.18px] text-white transition hover:brightness-110 disabled:opacity-70"
                        >
                            {processing ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                t('auth.confirm_password_button')
                            )}
                        </button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
