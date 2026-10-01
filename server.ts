import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Pastikan direktori data ada untuk persistensi cloud/server
const DATA_DIR = path.join(__dirname, 'data');
const TENANTS_DIR = path.join(DATA_DIR, 'tenants');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TENANTS_DIR)) fs.mkdirSync(TENANTS_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

app.use(express.json({ limit: '20mb' }));

// Sajikan aset statis publik (manifest, sw, icon) untuk PWA & PWABuilder
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(PUBLIC_DIR, 'sw.js'));
});

// Helper baca tulis database file server
function readUsers(): any[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getTenantFilePath(tenantId: string) {
  const safeId = tenantId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(TENANTS_DIR, `${safeId}.json`);
}

// ================= API ENDPOINTS PERSISTENSI ONLINE =================

// Register User Baru
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !name || !password) {
    return res.status(400).json({ error: 'Data registrasi tidak lengkap.' });
  }

  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
  }

  const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const tenantId = 'tenant_' + uid;

  const newUser = {
    uid,
    name: name.trim(),
    email: cleanEmail,
    tenantId,
    passwordHash: Buffer.from(password).toString('base64'),
    createdAt: Date.now(),
  };

  users.push(newUser);
  writeUsers(users);

  // Inisialisasi data tenant bersih di cloud
  const tenantData = {
    tenantId,
    profile: {
      name: '',
      address: '',
      phone: '',
      email: cleanEmail,
      website: '',
      npwp: '',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      signerName: name.trim().toUpperCase(),
      signerTitle: 'Hormat Kami,',
      logoUrl: '',
      stampUrl: '',
      signatureUrl: '',
      invoicePrefix: 'INV',
    },
    customers: [],
    products: [],
    invoices: [],
    updatedAt: Date.now(),
  };
  fs.writeFileSync(getTenantFilePath(tenantId), JSON.stringify(tenantData, null, 2));

  const { passwordHash, ...userSession } = newUser;
  res.json({ success: true, user: userSession });
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  const users = readUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail &&
      u.passwordHash === Buffer.from(password || '').toString('base64')
  );

  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah.' });
  }

  const { passwordHash, ...userSession } = user;
  res.json({ success: true, user: userSession });
});

// Ambil Data Tenant Online (Sinkronisasi Cloud)
app.get('/api/tenant/data', (req, res) => {
  const tenantId = req.query.tenantId as string;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID diperlukan.' });
  }

  const filePath = getTenantFilePath(tenantId);
  if (!fs.existsSync(filePath)) {
    return res.json({
      tenantId,
      profile: null,
      customers: [],
      products: [],
      invoices: [],
    });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membaca data server.' });
  }
});

// Simpan / Sinkronkan Data Tenant ke Cloud
app.post('/api/tenant/sync', (req, res) => {
  const { tenantId, profile, customers, products, invoices } = req.body;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID diperlukan.' });
  }

  const filePath = getTenantFilePath(tenantId);
  const payload = {
    tenantId,
    profile,
    customers,
    products,
    invoices,
    updatedAt: Date.now(),
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    res.json({ success: true, syncedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan ke server cloud.' });
  }
});

// Status Server
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', time: Date.now() });
});

// ================= VITE DEV / PROD MIDDLEWARE =================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mode dev menggunakan vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server online berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
