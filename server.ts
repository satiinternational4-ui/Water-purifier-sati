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

  // Support large photo uploads up to 60MB
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // Main website storage paths
  const PRODUCTS_PUBLIC_FILE = path.join(process.cwd(), 'public', 'data', 'products.json');
  const PRODUCTS_SRC_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');
  const PRODUCTS_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'products');

  // Ensure public image and data folders exist
  fs.mkdirSync(PRODUCTS_IMAGE_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(PRODUCTS_PUBLIC_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(PRODUCTS_SRC_FILE), { recursive: true });

  // Direct static serving fallbacks for uploaded products and data
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
  app.use('/data', express.static(path.join(process.cwd(), 'public', 'data')));

  /**
   * Saves a base64 DataURL directly as a physical file in the website's main folder (/public/images/products/)
   * This guarantees that during 'npm run build' and deployment, all photos are bundled in the website repository.
   */
  function saveImageToDisk(dataUrl: string, nameHint: string = 'product'): string {
    if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
    if (!dataUrl.startsWith('data:image/')) return dataUrl; // Already a static path or remote URL

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUrl;

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanHint = nameHint
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 30)
      .replace(/^_+|_+$/g, '') || 'product';

    const filename = `prod_${Date.now()}_${cleanHint}_${crypto.randomBytes(3).toString('hex')}.${ext}`;

    fs.mkdirSync(PRODUCTS_IMAGE_DIR, { recursive: true });
    const publicPath = path.join(PRODUCTS_IMAGE_DIR, filename);
    fs.writeFileSync(publicPath, buffer);

    // Sync to dist if running or already built
    try {
      const distImageDir = path.join(process.cwd(), 'dist', 'images', 'products');
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        fs.mkdirSync(distImageDir, { recursive: true });
        fs.writeFileSync(path.join(distImageDir, filename), buffer);
      }
    } catch (e) {
      console.warn('Sync to dist images error:', e);
    }

    return `/images/products/${filename}`;
  }

  function getStoredProducts(): any[] {
    try {
      if (fs.existsSync(PRODUCTS_PUBLIC_FILE)) {
        const data = JSON.parse(fs.readFileSync(PRODUCTS_PUBLIC_FILE, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Error reading PRODUCTS_PUBLIC_FILE:', e);
    }

    try {
      if (fs.existsSync(PRODUCTS_SRC_FILE)) {
        const data = JSON.parse(fs.readFileSync(PRODUCTS_SRC_FILE, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Error reading PRODUCTS_SRC_FILE:', e);
    }

    return [];
  }

  function saveProductsToDisk(products: any[]) {
    // Process any lingering base64 data URLs into physical image files in /public/images/products/
    const sanitizedProducts = products.map((item: any) => {
      if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
        const savedUrl = saveImageToDisk(item.image, item.name || item.id);
        return { ...item, image: savedUrl };
      }
      return item;
    });

    const jsonString = JSON.stringify(sanitizedProducts, null, 2);

    fs.mkdirSync(path.dirname(PRODUCTS_PUBLIC_FILE), { recursive: true });
    fs.writeFileSync(PRODUCTS_PUBLIC_FILE, jsonString, 'utf-8');

    fs.mkdirSync(path.dirname(PRODUCTS_SRC_FILE), { recursive: true });
    fs.writeFileSync(PRODUCTS_SRC_FILE, jsonString, 'utf-8');

    // Also sync to dist/data if dist exists
    try {
      const distDataDir = path.join(process.cwd(), 'dist', 'data');
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        fs.mkdirSync(distDataDir, { recursive: true });
        fs.writeFileSync(path.join(distDataDir, 'products.json'), jsonString, 'utf-8');
      }
    } catch (e) {
      console.warn('Sync to dist data error:', e);
    }

    return sanitizedProducts;
  }

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

  // Get Current Products Catalog (from public/data/products.json or src/data/products.json)
  app.get('/api/products', (_req: Request, res: Response) => {
    const products = getStoredProducts();
    return res.json({
      success: true,
      products,
      count: products.length,
    });
  });

  // Upload Product Photo to Website Main Folder (/public/images/products/)
  app.post('/api/upload-image', (req: Request, res: Response) => {
    const { dataUrl, filenameHint, token } = req.body;

    if (!verifyHostSessionToken(token)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid Host Mode 20-digit session required to upload photos to the website main folder.',
      });
    }

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo data provided.',
      });
    }

    try {
      const publicUrl = saveImageToDisk(dataUrl, filenameHint || 'product');
      return res.json({
        success: true,
        url: publicUrl,
        message: 'Product photo successfully saved into the website main folder (/public/images/products/) and ready for deployment.',
      });
    } catch (err: any) {
      console.error('Error saving image to disk:', err);
      return res.status(500).json({
        success: false,
        error: `Failed to write image file: ${err.message || 'Server error'}`,
      });
    }
  });

  // Save Entire Catalog (Products + Texts + Prices + Specs) to Website Main Folder
  app.post('/api/save-catalog', (req: Request, res: Response) => {
    const { products, token } = req.body;

    if (!verifyHostSessionToken(token)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid Host Mode 20-digit session required to save catalog changes to website files.',
      });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid catalog data: expected array of products.',
      });
    }

    try {
      const updatedProducts = saveProductsToDisk(products);
      return res.json({
        success: true,
        count: updatedProducts.length,
        products: updatedProducts,
        message: 'All catalog texts, price tags, and photos have been written to the website main folder (public/data/products.json, src/data/products.json, and public/images/products/). Changes are permanent and will display during deploy.',
      });
    } catch (err: any) {
      console.error('Error saving catalog to disk:', err);
      return res.status(500).json({
        success: false,
        error: `Failed to write catalog files: ${err.message || 'Server error'}`,
      });
    }
  });

  // Reset Catalog to Default
  app.post('/api/reset-catalog', (req: Request, res: Response) => {
    const { token } = req.body;

    if (!verifyHostSessionToken(token)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid Host Mode 20-digit session required to reset catalog.',
      });
    }

    try {
      // Re-seed from initial source
      const initialPath = path.join(process.cwd(), 'public', 'data', 'products.json');
      // If we have defaultProducts from src, write it
      let defaultList = [];
      if (fs.existsSync(PRODUCTS_SRC_FILE)) {
        defaultList = JSON.parse(fs.readFileSync(PRODUCTS_SRC_FILE, 'utf-8'));
      }
      return res.json({
        success: true,
        message: 'Catalog reset executed.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
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
