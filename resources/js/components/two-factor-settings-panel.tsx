import { router } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import AlertError from '@/components/alert-error';
import ConfirmPasswordModal from '@/components/confirm-password-modal';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { cn } from '@/lib/utils';

type TwoFactorSettingsPanelProps = {
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
    className?: string;
};

export default function TwoFactorSettingsPanel({
    twoFactorEnabled = false,
    requiresConfirmation = true,
    className,
}: TwoFactorSettingsPanelProps) {
    const { t } = useLocale();
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const confirmPasswordResolver = useRef<
        ((confirmed: boolean) => void) | null
    >(null);

    const requestPasswordConfirmation = useCallback((): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            confirmPasswordResolver.current = resolve;
            setConfirmPasswordOpen(true);
        });
    }, []);

    const resolvePasswordConfirmation = useCallback((confirmed: boolean) => {
        confirmPasswordResolver.current?.(confirmed);
        confirmPasswordResolver.current = null;
    }, []);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        enableTwoFactor,
        disableTwoFactor,
        regenerateCodes,
        errors,
    } = useTwoFactorAuth(requestPasswordConfirmation);

    const handleEnable = useCallback(async () => {
        setProcessing(true);
        const enabled = await enableTwoFactor();
        setProcessing(false);

        if (enabled) {
            setShowSetupModal(true);
        }
    }, [enableTwoFactor]);

    const handleDisable = useCallback(async () => {
        setProcessing(true);
        const disabled = await disableTwoFactor();
        setProcessing(false);

        if (disabled) {
            router.reload({ preserveScroll: true });
        }
    }, [disableTwoFactor]);

    return (
        <div className={cn('space-y-4', className)}>
            <div>
                <h3 className="text-base font-bold text-[#101828]">
                    {t('settings.two_factor.title')}
                </h3>
                <p className="mt-1 text-sm text-[#6a7282]">
                    {t('settings.two_factor.description')}
                </p>
            </div>

            {errors.length > 0 ? <AlertError errors={errors} /> : null}

            {twoFactorEnabled ? (
                <div className="flex flex-col items-start gap-4">
                    <span className="inline-flex rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                        {t('settings.two_factor.enabled')}
                    </span>
                    <p className="text-sm text-[#6a7282]">
                        {t('settings.two_factor.enabled_description')}
                    </p>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        regenerateCodes={regenerateCodes}
                    />

                    <Button
                        variant="destructive"
                        type="button"
                        disabled={processing}
                        className="rounded-xl"
                        onClick={handleDisable}
                    >
                        <ShieldBan /> {t('settings.two_factor.disable')}
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-start gap-4">
                    <span className="inline-flex rounded-full bg-[#fef3f2] px-3 py-1 text-xs font-semibold text-[#b42318]">
                        {t('settings.two_factor.disabled')}
                    </span>
                    <p className="text-sm text-[#6a7282]">
                        {t('settings.two_factor.disabled_description')}
                    </p>

                    {hasSetupData ? (
                        <Button
                            type="button"
                            onClick={() => setShowSetupModal(true)}
                            className="rounded-xl bg-[#0057c8] text-white hover:bg-[#0046a3]"
                        >
                            <ShieldCheck />
                            {t('settings.two_factor.continue_setup')}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled={processing}
                            onClick={handleEnable}
                            className="rounded-xl bg-[#0057c8] text-white hover:bg-[#0046a3]"
                        >
                            <ShieldCheck />
                            {t('settings.two_factor.enable')}
                        </Button>
                    )}
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />

            <ConfirmPasswordModal
                open={confirmPasswordOpen}
                onOpenChange={setConfirmPasswordOpen}
                onConfirmed={() => resolvePasswordConfirmation(true)}
                onCancelled={() => resolvePasswordConfirmation(false)}
            />
        </div>
    );
}
