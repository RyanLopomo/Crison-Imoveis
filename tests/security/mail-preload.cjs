// Test-only transport boundary: all application logic runs against real local PostgreSQL.
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
 const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
 const parsed = new URL(url);
 if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) throw new Error('External requests blocked by security test harness');
 return nativeFetch(input, options);
};
