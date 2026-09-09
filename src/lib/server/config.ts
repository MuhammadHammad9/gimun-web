/**
 * Server-only deployment configuration.
 *
 * Keep provider credentials in this module boundary. Client components must
 * use the public content/site configuration instead of reading process.env.
 */
export type ServerConfig = {
  backend: string;
  siteUrl?: string;
  supabaseUrl?: string;
  supabaseSecretKey?: string;
  resendApiKey?: string;
  emailFrom?: string;
  notificationEmail?: string;
  upstashUrl?: string;
  upstashToken?: string;
  rateLimitHmacSecret?: string;
  cronSecret?: string;
};

export function getServerConfig(): ServerConfig {
  return {
    backend: process.env.SUBMISSIONS_BACKEND || (process.env.NODE_ENV === 'production' ? 'supabase' : 'memory'),
    siteUrl: process.env.SITE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    rateLimitHmacSecret: process.env.RATE_LIMIT_HMAC_SECRET,
    cronSecret: process.env.CRON_SECRET,
  };
}

export function getMissingProductionConfig(options: { emailDelivery?: boolean } = {}) {
  if (process.env.NODE_ENV !== 'production') return [];

  const config = getServerConfig();
  if (config.backend === 'memory' && process.env.ALLOW_IN_MEMORY_SUBMISSIONS === '1') return [];

  const required: Array<[string, string | undefined]> = [
    ['SITE_URL', config.siteUrl],
    ['SUPABASE_URL', config.supabaseUrl],
    ['SUPABASE_SECRET_KEY', config.supabaseSecretKey],
    ['UPSTASH_REDIS_REST_URL', config.upstashUrl],
    ['UPSTASH_REDIS_REST_TOKEN', config.upstashToken],
    ['RATE_LIMIT_HMAC_SECRET', config.rateLimitHmacSecret],
    ['NOTIFICATION_EMAIL', config.notificationEmail],
  ];

  if (options.emailDelivery) {
    required.push(['RESEND_API_KEY', config.resendApiKey], ['EMAIL_FROM', config.emailFrom]);
  }

  return required.filter(([, value]) => !value?.trim()).map(([name]) => name);
}
