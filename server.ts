import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Server-side secret 20-digit passcode configuration
// The secret code is strictly stored and evaluated on the server. It is NEVER exposed to the client.
const DEFAULT_HOST_CODE = '98042357559304643614';
const HASH_STORAGE_FILE = path.join(process.cwd(), 'host_security_hash.json');

// Generate an ephemeral server session secret for signing host mode tokens
const SESSION_SECRET = process.env.HOST_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Rate limiting state for brute-force protection (IP -> { attempts, lockedUntil, lastAttempt })
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number; attemptsLeft?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0, lastAttempt: now };

  // Check if locked out
  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Reset window after 15 minutes of inactivity
  if (now - record.lastAttempt > 15 * 60 * 1000) {
    record.attempts = 0;
    record.lockedUntil = 0;
  }

  // Max 5 failed attempts allowed
  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minute lockout
    rateLimitMap.set(ip, record);
    return { allowed: false, waitSeconds: 15 * 60 };
  }

  const attemptsLeft = 5 - record.attempts;
  return { allowed: true, attemptsLeft };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;
  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }
  rateLimitMap.set(ip, record);
}

function resetFailedAttempts(ip: string) {
  rateLimitMap.delete(ip);
}

/**
 * Retrieves the current configured 20-digit code hash or plain code.
 */
function getActiveHostCode(): string {
  // 1. Check environment variable override
  if (process.env.HOST_SECURITY_CODE && /^\d{20}$/.test(process.env.HOST_SECURITY_CODE.trim())) {
    return process.env.HOST_SECURITY_CODE.trim();
  }

  // 2. Check if a custom code was saved on server
  try {
    if (fs.existsSync(HASH_STORAGE_FILE)) {
      const content = fs.readFileSync(HASH_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.customCode && /^\d{20}$/.test(parsed.customCode)) {
        return parsed.customCode;
      }
    }
  } catch (err) {
    console.error('Failed reading custom host code storage:', err);
  }

  // 3. Fallback to default 20-digit code
  return DEFAULT_HOST_CODE;
}

/**
 * Save updated 20-digit passcode securely on the server
 */
function saveUpdatedHostCode(newCode: string) {
  try {
    fs.writeFileSync(
      HASH_STORAGE_FILE,
      JSON.stringify({ customCode: newCode, updatedAt: new Date().toISOString() }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to persist host code:', err);
  }
}

/**
 * Constant-time comparison between candidate and active passcode using SHA-256
 */
function verifyCodeConstantTime(candidate: string, expected: string): boolean {
  const hashCandidate = crypto.createHash('sha256').update(candidate).digest();
  const hashExpected = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(hashCandidate, hashExpected);
}

/**
 * Generate a cryptographically signed session token for authenticated host sessions (12-hour validity)
 */
function createHostSessionToken(): string {
  const payload = JSON.stringify({
    role: 'host',
    iat: Date.now(),
    exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    nonce: crypto.randomBytes(8).toString('hex'),
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Validate a host session token
 */
function verifyHostSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedSigBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedSigBuf.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.role !== 'host' || !payload.exp) return false;
    if (Date.now() > payload.exp) return false; // Token expired
    return true;
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic security middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Verify Host Passcode Endpoint
  app.post('/api/verify-host-code', async (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const { code } = req.body;

    // Rate-limiting check
    const rateStatus = checkRateLimit(ip);
    if (!rateStatus.allowed) {
      return res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed passcode attempts. Please try again in ${rateStatus.waitSeconds} seconds.`,
        locked: true,
        waitSeconds: rateStatus.waitSeconds,
      });
    }

    // Artificial delay to prevent timing and high-speed automated attacks
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Input sanitization and format verification
    if (typeof code !== 'string') {
      recordFailedAttempt(ip);
      return res.status(400).json({
        success: false,
        error: 'Invalid request format.',
      });
    }

    const cleanCode = code.replace(/[\s-]/g, '');

    if (!/^\d{20}$/.test(cleanCode)) {
      recordFailedAttempt(ip);
      const remaining = rateStatus.attemptsLeft ? rateStatus.attemptsLeft - 1 : 0;
      return res.status(400).json({
        success: false,
        error: 'Passcode must be exactly 20 digits (numbers only).',
        attemptsLeft: Math.max(0, remaining),
      });
    }

    // Verify candidate code against active server-side code
    const activeCode = getActiveHostCode();
    const isValid = verifyCodeConstantTime(cleanCode, activeCode);

    if (!isValid) {
      recordFailedAttempt(ip);
      const remaining = rateStatus.attemptsLeft ? rateStatus.attemptsLeft - 1 : 0;
      return res.status(401).json({
        success: false,
        error: `Incorrect 20-digit security passcode.${remaining > 0 ? ` ${remaining} attempt(s) remaining before temporary lockout.` : ' You are now temporarily locked out.'}`,
        attemptsLeft: Math.max(0, remaining),
      });
    }

    // Success: Reset failed attempts and issue cryptographically signed session token
    resetFailedAttempts(ip);
    const token = createHostSessionToken();

    return res.json({
      success: true,
      token,
      message: 'Host Mode verified successfully! You now have owner administrative access.',
      expiresIn: 12 * 60 * 60, // 12 hours in seconds
    });
  });

  // Verify Active Host Session Endpoint
  app.post('/api/verify-host-session', (req: Request, res: Response) => {
    const { token } = req.body;
    const isValid = verifyHostSessionToken(token);
    return res.json({ valid: isValid });
  });

  // Update 20-digit Passcode Endpoint (Requires existing code verification)
  app.post('/api/change-host-code', async (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const { currentCode, newCode, sessionToken } = req.body;

    // Check rate limit
    const rateStatus = checkRateLimit(ip);
    if (!rateStatus.allowed) {
      return res.status(429).json({
        success: false,
        error: `Security Lockout: Please try again in ${rateStatus.waitSeconds} seconds.`,
      });
    }

    // Require active session or current code re-verification
    const isSessionValid = verifyHostSessionToken(sessionToken);
    const activeCode = getActiveHostCode();

    const cleanCurrent = typeof currentCode === 'string' ? currentCode.replace(/[\s-]/g, '') : '';
    const cleanNew = typeof newCode === 'string' ? newCode.replace(/[\s-]/g, '') : '';

    if (!isSessionValid && !verifyCodeConstantTime(cleanCurrent, activeCode)) {
      recordFailedAttempt(ip);
      return res.status(401).json({
        success: false,
        error: 'Current 20-digit passcode or active session authentication failed.',
      });
    }

    if (!/^\d{20}$/.test(cleanNew)) {
      return res.status(400).json({
        success: false,
        error: 'The new security passcode must be exactly 20 digits (numbers only).',
      });
    }

    // Persist new code securely on the server
    saveUpdatedHostCode(cleanNew);

    // Issue a refreshed session token
    const newToken = createHostSessionToken();

    return res.json({
      success: true,
      token: newToken,
      message: 'Your 20-digit security passcode has been successfully updated on the server.',
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
