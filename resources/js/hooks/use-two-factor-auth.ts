import { useCallback, useMemo, useRef, useState } from 'react';

import { jsonRequestHeaders } from '@/lib/csrf';
import {
    disable,
    enable,
    qrCode,
    recoveryCodes,
    regenerateRecoveryCodes,
    secretKey,
} from '@/routes/two-factor';

interface TwoFactorSetupData {
    svg: string;
    url: string;
}

interface TwoFactorSecretKey {
    secretKey: string;
}

export const OTP_MAX_LENGTH = 6;

type ConfirmPasswordFn = () => Promise<boolean>;

class PasswordConfirmationRequiredError extends Error {
    constructor() {
        super('Password confirmation required');
        this.name = 'PasswordConfirmationRequiredError';
    }
}

const request = async (
    url: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>,
): Promise<Response> => {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: jsonRequestHeaders(
            body ? { 'Content-Type': 'application/json' } : {},
        ),
        body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 423) {
        throw new PasswordConfirmationRequiredError();
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    return response;
};

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await request(url, 'GET');

    return response.json();
};

export const useTwoFactorAuth = (confirmPassword?: ConfirmPasswordFn) => {
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const confirmPasswordRef = useRef(confirmPassword);
    const pendingConfirmRef = useRef<Promise<boolean> | null>(null);

    confirmPasswordRef.current = confirmPassword;

    const requestPasswordConfirmation =
        useCallback(async (): Promise<boolean> => {
            if (!confirmPasswordRef.current) {
                return false;
            }

            if (!pendingConfirmRef.current) {
                pendingConfirmRef.current = confirmPasswordRef
                    .current()
                    .finally(() => {
                        pendingConfirmRef.current = null;
                    });
            }

            return pendingConfirmRef.current;
        }, []);

    const withPasswordConfirmation = useCallback(
        async <T>(action: () => Promise<T>): Promise<T> => {
            try {
                return await action();
            } catch (error) {
                if (!(error instanceof PasswordConfirmationRequiredError)) {
                    throw error;
                }

                const confirmed = await requestPasswordConfirmation();

                if (!confirmed) {
                    throw error;
                }

                return action();
            }
        },
        [requestPasswordConfirmation],
    );

    const hasSetupData = useMemo<boolean>(
        () => qrCodeSvg !== null && manualSetupKey !== null,
        [qrCodeSvg, manualSetupKey],
    );

    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const { svg } = await withPasswordConfirmation(() =>
                fetchJson<TwoFactorSetupData>(qrCode.url()),
            );
            setQrCodeSvg(svg);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch QR code']);
            setQrCodeSvg(null);
        }
    }, [withPasswordConfirmation]);

    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = await withPasswordConfirmation(() =>
                fetchJson<TwoFactorSecretKey>(secretKey.url()),
            );
            setManualSetupKey(key);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch a setup key']);
            setManualSetupKey(null);
        }
    }, [withPasswordConfirmation]);

    const clearErrors = useCallback((): void => {
        setErrors([]);
    }, []);

    const clearSetupData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        clearErrors();
    }, [clearErrors]);

    const fetchRecoveryCodes = useCallback(async (): Promise<boolean> => {
        try {
            clearErrors();
            const codes = await withPasswordConfirmation(() =>
                fetchJson<string[]>(recoveryCodes.url()),
            );
            setRecoveryCodesList(codes);

            return true;
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch recovery codes']);
            setRecoveryCodesList([]);

            return false;
        }
    }, [clearErrors, withPasswordConfirmation]);

    const fetchSetupData = useCallback(async (): Promise<void> => {
        try {
            clearErrors();
            await Promise.all([fetchQrCode(), fetchSetupKey()]);
        } catch {
            setQrCodeSvg(null);
            setManualSetupKey(null);
        }
    }, [clearErrors, fetchQrCode, fetchSetupKey]);

    const enableTwoFactor = useCallback(async (): Promise<boolean> => {
        try {
            clearErrors();
            await withPasswordConfirmation(() =>
                request(enable.url(), 'POST'),
            );

            return true;
        } catch {
            setErrors((prev) => [
                ...prev,
                'Failed to enable two-factor authentication',
            ]);

            return false;
        }
    }, [clearErrors, withPasswordConfirmation]);

    const disableTwoFactor = useCallback(async (): Promise<boolean> => {
        try {
            clearErrors();
            await withPasswordConfirmation(() =>
                request(disable.url(), 'DELETE'),
            );
            setRecoveryCodesList([]);
            clearSetupData();

            return true;
        } catch {
            setErrors((prev) => [
                ...prev,
                'Failed to disable two-factor authentication',
            ]);

            return false;
        }
    }, [clearErrors, clearSetupData, withPasswordConfirmation]);

    const regenerateCodes = useCallback(async (): Promise<boolean> => {
        try {
            clearErrors();
            await withPasswordConfirmation(() =>
                request(regenerateRecoveryCodes.url(), 'POST'),
            );

            return fetchRecoveryCodes();
        } catch {
            setErrors((prev) => [
                ...prev,
                'Failed to regenerate recovery codes',
            ]);

            return false;
        }
    }, [clearErrors, fetchRecoveryCodes, withPasswordConfirmation]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,
        clearErrors,
        clearSetupData,
        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
        enableTwoFactor,
        disableTwoFactor,
        regenerateCodes,
    };
};
