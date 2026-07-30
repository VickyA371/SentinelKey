/**
 * Dev-only logging.
 *
 * In release builds React Native sets the global `__DEV__` to false. These
 * helpers return early in that case, so debug output — which can include
 * sensitive data such as form values (passwords), tokens, or keys — never
 * reaches device logs (Android logcat / iOS Console) in production.
 *
 * Use these instead of calling `console.*` directly anywhere that might touch
 * user data.
 */

export const logDev = (...args: unknown[]): void => {
    if (!__DEV__) return;
    console.log(...args);
};

export const warnDev = (...args: unknown[]): void => {
    if (!__DEV__) return;
    console.warn(...args);
};

export const errorDev = (...args: unknown[]): void => {
    if (!__DEV__) return;
    console.error(...args);
};
