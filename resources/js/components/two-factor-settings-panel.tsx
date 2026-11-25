import { Form } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { cn } from '@/lib/utils';
import { disable, enable } from '@/routes/two-factor';

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
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState(false);

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
                        errors={errors}
                    />

                    <Form {...disable.form()}>
                        {({ processing }) => (
                            <Button
                                variant="destructive"
                                type="submit"
                                disabled={processing}
                                className="rounded-xl"
                            >
                                <ShieldBan /> {t('settings.two_factor.disable')}
                            </Button>
                        )}
                    </Form>
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
                            onClick={() => setShowSetupModal(true)}
                            className="rounded-xl bg-[#0057c8] text-white hover:bg-[#0046a3]"
                        >
                            <ShieldCheck />
                            {t('settings.two_factor.continue_setup')}
                        </Button>
                    ) : (
                        <Form
                            {...enable.form()}
                            onSuccess={() => setShowSetupModal(true)}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-[#0057c8] text-white hover:bg-[#0046a3]"
                                >
                                    <ShieldCheck />
                                    {t('settings.two_factor.enable')}
                                </Button>
                            )}
                        </Form>
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
        </div>
    );
}
