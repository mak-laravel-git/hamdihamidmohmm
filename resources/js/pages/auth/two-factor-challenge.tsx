import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/hooks/use-locale';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const { t } = useLocale();
    const [showRecoveryInput, setShowRecoveryInput] = useState(false);
    const [code, setCode] = useState('');

    const content = useMemo(
        () => ({
            title: showRecoveryInput
                ? t('auth.recovery_code')
                : t('auth.authentication_code'),
            description: showRecoveryInput
                ? t('auth.recovery_code_description')
                : t('auth.authentication_code_description'),
            toggle: showRecoveryInput
                ? t('auth.use_authenticator_code')
                : t('auth.use_recovery_code'),
            label: showRecoveryInput
                ? t('auth.recovery_code')
                : t('auth.authenticator_app_code'),
        }),
        [showRecoveryInput, t],
    );

    return (
        <AuthLayout title={t('auth.two_factor')}>
            <Head title={t('auth.two_factor')} />

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
                    {content.title}
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-5 text-[#6a7282]">
                    {content.description}
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnError
                resetOnSuccess={!showRecoveryInput}
                className="mt-7 space-y-5"
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="recovery_code"
                                    className="text-sm font-semibold text-[#364153]"
                                >
                                    {content.label}
                                </Label>
                                <Input
                                    id="recovery_code"
                                    name="recovery_code"
                                    placeholder="XXXXX-XXXXX"
                                    autoFocus
                                    autoComplete="one-time-code"
                                    className="h-[46px] rounded-xl border-[#e2e8f0] bg-[#f9fafb] px-4 text-center font-mono text-sm uppercase tracking-widest text-[#374151] placeholder:text-[rgba(55,65,81,0.5)] focus-visible:border-[#0057c8] focus-visible:ring-[#0057c8]/30"
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label className="block text-center text-sm font-semibold text-[#364153]">
                                    {content.label}
                                </Label>
                                <div className="flex flex-col items-center gap-3">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={setCode}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {Array.from({
                                                length: OTP_MAX_LENGTH,
                                            }).map((_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="h-12 w-11 rounded-xl border-[#e2e8f0] bg-[#f9fafb] text-base font-semibold text-[#050315]"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                    <p className="text-xs text-[#99a1af]">
                                        {t('auth.authenticator_hint')}
                                    </p>
                                    <InputError message={errors.code} />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                (!showRecoveryInput &&
                                    code.length < OTP_MAX_LENGTH)
                            }
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0057c8] text-base font-medium tracking-[-0.18px] text-white transition hover:brightness-110 disabled:opacity-70"
                        >
                            {processing ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                t('auth.verify_identity')
                            )}
                        </button>

                        <button
                            type="button"
                            className="w-full text-center text-sm font-semibold text-[#0057c8] transition hover:underline"
                            onClick={() => {
                                setShowRecoveryInput(!showRecoveryInput);
                                clearErrors();
                                setCode('');
                            }}
                        >
                            {content.toggle}
                        </button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
