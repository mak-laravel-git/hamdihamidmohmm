export function xsrfToken(): string | null {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');

    return raw ? decodeURIComponent(raw) : null;
}

export function jsonRequestHeaders(
    extras: Record<string, string> = {},
): Record<string, string> {
    const token = xsrfToken();

    return {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        ...extras,
    };
}
