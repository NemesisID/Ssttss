import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;

  const current = await redis.incr(windowKey);
  if (current === 1) {
    await redis.expire(windowKey, windowSeconds);
  }

  const allowed = current <= maxRequests;
  const remaining = Math.max(0, maxRequests - current);
  const resetIn = windowSeconds - (now % windowSeconds);

  return { allowed, remaining, resetIn };
}

export async function rateLimitByIP(
  ip: string,
  endpoint: string,
  maxRequests: number = 5,
  windowSeconds: number = 3600
): Promise<RateLimitResult> {
  return rateLimit(`${endpoint}:${ip}`, maxRequests, windowSeconds);
}
