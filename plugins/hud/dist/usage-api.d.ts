import type { UsageData } from './types.js';
export type { UsageData } from './types.js';
interface UsageApiResponse {
    five_hour?: {
        utilization?: number;
        resets_at?: string;
    };
    seven_day?: {
        utilization?: number;
        resets_at?: string;
    };
}
interface UsageApiResult {
    data: UsageApiResponse | null;
    error?: string;
}
/**
 * Claude Code namespaces per-profile keychain entries by an 8-hex-char sha256
 * of the config dir (CLAUDE_SECURESTORAGE_CONFIG_DIR overrides
 * CLAUDE_CONFIG_DIR; empty string forces the default profile). Without this
 * suffix an alternate-profile session reads the default profile's token and
 * shows the wrong account's usage.
 */
export declare function profileSuffix(env?: NodeJS.ProcessEnv): string;
export type UsageApiDeps = {
    homeDir: () => string;
    fetchApi: (accessToken: string) => Promise<UsageApiResult>;
    now: () => number;
    readKeychain: (now: number, homeDir: string) => {
        accessToken: string;
        subscriptionType: string;
    } | null;
};
/**
 * Get OAuth usage data from Anthropic API.
 * Returns null if user is an API user (no OAuth credentials) or credentials are expired.
 * Returns { apiUnavailable: true, ... } if API call fails (to show warning in HUD).
 *
 * Uses file-based cache since HUD runs as a new process each render (~300ms).
 * Cache TTL: 60s for success, 15s for failures.
 */
export declare function getUsage(overrides?: Partial<UsageApiDeps>): Promise<UsageData | null>;
export declare function clearCache(homeDir?: string): void;
//# sourceMappingURL=usage-api.d.ts.map