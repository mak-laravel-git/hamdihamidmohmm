import { useRef, useState, type FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useLocale } from '@/hooks/use-locale';
import { jsonRequestHeaders } from '@/lib/csrf';
import { store as confirmPassword } from '@/routes/password/confirm';

type ConfirmPasswordModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmed: () => void;
    onCancelled?: () => void;
};

export default function ConfirmPasswordModal({
    open,
    onOpenChange,
    onConfirmed,
    onCancelled,
}: ConfirmPasswordModalProps) {
    const { t } = useLocale();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const confirmedRef = useRef(false);

    const resetState = (): void => {
        setPassword('');
        setError(null);
        setProcessing(false);
    };

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!nextOpen) {
            const wasConfirmed = confirmedRef.current;
            confirmedRef.current = false;
            resetState();

            if (!wasConfirmed) {
                onCancelled?.();
            }
        }

        onOpenChange(nextOpen);
    };

    const submit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            const response = await fetch(confirmPassword.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: jsonRequestHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ password }),
            });

            if (response.status === 201 || response.ok) {
                confirmedRef.current = true;
                resetState();
                onOpenChange(false);
                onConfirmed();

                return;
            }

            const payload = (await response.json().catch(() => null)) as {
                message?: string;
                errors?: { password?: string[] };
            } | null;

            setError(
                payload?.errors?.password?.[0] ??
                    payload?.message ??
                    t('auth.confirm_password'),
            );
        } catch {
            setError(t('auth.confirm_password'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t('auth.confirm_password_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('auth.confirm_password_description')}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password-modal-password">
                            {t('auth.password')}
                        </Label>
                        <PasswordInput
                            id="confirm-password-modal-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                            autoFocus
                            autoComplete="current-password"
                            placeholder={t(
                                'auth.confirm_password_placeholder',
                            )}
                        />
                        <InputError message={error ?? undefined} />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || password === ''}
                        className="w-full rounded-xl bg-[#0057c8] text-white hover:bg-[#0046a3]"
                    >
                        {t('auth.confirm_password_button')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
