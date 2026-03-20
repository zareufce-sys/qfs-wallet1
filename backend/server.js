const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'qfs-wallet-secret-key-2024';
const DB_FILE = path.join(__dirname, 'data.json');
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_ALL_CORS = CORS_ORIGINS.includes('*');

function isDevLanOrigin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOW_ALL_CORS || CORS_ORIGINS.includes(origin) || isDevLanOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

// If frontend is built in this repo, serve it from the same origin in production.
if (process.env.NODE_ENV === 'production' && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// ─── Simple JSON-file data store (no native deps needed) ─────────────────────

function readDB() {
  if (!fs.existsSync(DB_FILE)) return { users: [], transactions: [] };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [], transactions: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

function nowISO() {
  return new Date().toISOString();
}

function parseDepositValue(value, fallback) {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

function withDepositDefaults(user) {
  return {
    deposit_btc: parseDepositValue(user?.deposit_btc, 100),
    deposit_eth: parseDepositValue(user?.deposit_eth, 100),
    deposit_usdt: parseDepositValue(user?.deposit_usdt, 100),
  };
}

function withActivationDefaults(user) {
  return {
    activation_status: user?.activation_status === 'active' ? 'active' : 'inactive',
  };
}

// ─── Seed default admin on first run ─────────────────────────────────────────
{
  const db = readDB();
  if (!db.users.find((u) => u.username === 'admin')) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.users.push({
      id: 1,
      username: 'admin',
      password_hash: hash,
      full_name: 'Administrator',
      role: 'admin',
      balance: 0,
      saved: 0,
      savings_goal: 10000,
      ...withDepositDefaults({}),
      ...withActivationDefaults({}),
      card_number: '**** **** **** 0000',
      card_expiry: '01/2030',
      created_at: nowISO(),
    });
    writeDB(db);
    console.log('Default admin created — username: admin  password: admin123');
  }
}

// ─── Safe user object (no password_hash) ─────────────────────────────────────
function safeUser(u) {
  const { password_hash, ...rest } = u;
  return {
    ...rest,
    ...withDepositDefaults(rest),
    ...withActivationDefaults(rest),
  };
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const db = readDB();
  const normalizedUsername = String(username).trim().toLowerCase();
  const user = db.users.find((u) => String(u.username || '').toLowerCase() === normalizedUsername);
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: safeUser(user) });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

// ─── User Routes (Admin) ──────────────────────────────────────────────────────
app.get('/api/users', authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  res.json([...db.users].reverse().map(safeUser));
});

app.post('/api/users', authenticate, requireAdmin, (req, res) => {
  const {
    username,
    password,
    full_name,
    role = 'user',
    balance = 0,
    savings_goal = 10000,
    deposit_btc = 100,
    deposit_eth = 100,
    deposit_usdt = 100,
    activation_status = 'inactive',
  } = req.body;
  if (!username || !password || !full_name) return res.status(400).json({ error: 'Username, password, and full name are required' });
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Role must be user or admin' });
  if (!['active', 'inactive'].includes(String(activation_status))) {
    return res.status(400).json({ error: 'Activation status must be active or inactive' });
  }
  if ([deposit_btc, deposit_eth, deposit_usdt].some((v) => Number.isNaN(parseFloat(v)) || parseFloat(v) < 0)) {
    return res.status(400).json({ error: 'Deposit amounts must be valid non-negative numbers' });
  }

  const db = readDB();
  if (db.users.find((u) => u.username === String(username).trim())) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const lastFour = String(Math.floor(1000 + Math.random() * 9000));
  const newUser = {
    id: nextId(db.users),
    username: String(username).trim(),
    password_hash: bcrypt.hashSync(String(password), 12),
    full_name: String(full_name).trim(),
    role,
    balance: parseFloat(balance) || 0,
    saved: 0,
    savings_goal: parseFloat(savings_goal) || 10000,
    deposit_btc: parseFloat(deposit_btc),
    deposit_eth: parseFloat(deposit_eth),
    deposit_usdt: parseFloat(deposit_usdt),
    activation_status: String(activation_status),
    card_number: `**** **** **** ${lastFour}`,
    card_expiry: '08/2028',
    created_at: nowISO(),
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(safeUser(newUser));
});

app.put('/api/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const user = { ...db.users[idx] };
  const prevBalance = user.balance;
  const {
    full_name,
    balance,
    saved,
    savings_goal,
    role,
    password,
    card_number,
    card_expiry,
    deposit_btc,
    deposit_eth,
    deposit_usdt,
    activation_status,
  } = req.body;

  if (full_name !== undefined) user.full_name = String(full_name).trim();
  if (balance !== undefined) user.balance = parseFloat(balance);
  if (saved !== undefined) user.saved = parseFloat(saved);
  if (savings_goal !== undefined) user.savings_goal = parseFloat(savings_goal);
  if (role !== undefined && ['user', 'admin'].includes(role)) user.role = role;
  if (card_number !== undefined) user.card_number = String(card_number);
  if (card_expiry !== undefined) user.card_expiry = String(card_expiry);
  if (activation_status !== undefined) {
    if (!['active', 'inactive'].includes(String(activation_status))) {
      return res.status(400).json({ error: 'Activation status must be active or inactive' });
    }
    user.activation_status = String(activation_status);
  }
  if (deposit_btc !== undefined) {
    const value = parseFloat(deposit_btc);
    if (Number.isNaN(value) || value < 0) return res.status(400).json({ error: 'BTC deposit amount must be a non-negative number' });
    user.deposit_btc = value;
  }
  if (deposit_eth !== undefined) {
    const value = parseFloat(deposit_eth);
    if (Number.isNaN(value) || value < 0) return res.status(400).json({ error: 'ETH deposit amount must be a non-negative number' });
    user.deposit_eth = value;
  }
  if (deposit_usdt !== undefined) {
    const value = parseFloat(deposit_usdt);
    if (Number.isNaN(value) || value < 0) return res.status(400).json({ error: 'USDT deposit amount must be a non-negative number' });
    user.deposit_usdt = value;
  }
  if (password) {
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    user.password_hash = bcrypt.hashSync(String(password), 12);
  }

  // Record balance change as a transaction
  if (balance !== undefined && parseFloat(balance) !== prevBalance) {
    const diff = parseFloat(balance) - prevBalance;
    db.transactions.push({
      id: nextId(db.transactions),
      user_id: userId,
      type: diff > 0 ? 'credit' : 'debit',
      amount: Math.abs(diff),
      description: 'Balance adjustment by admin',
      created_at: nowISO(),
    });
  }

  db.users[idx] = user;
  writeDB(db);
  res.json(safeUser(user));
});

app.delete('/api/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (db.users[idx].username === 'admin') return res.status(403).json({ error: 'Cannot delete the default admin account' });

  db.users.splice(idx, 1);
  db.transactions = db.transactions.filter((t) => t.user_id !== userId);
  writeDB(db);
  res.json({ message: 'User deleted successfully' });
});

// ─── Transaction Routes ───────────────────────────────────────────────────────
app.get('/api/transactions', authenticate, (req, res) => {
  const db = readDB();
  let txs;
  if (req.user.role === 'admin') {
    txs = [...db.transactions]
      .reverse()
      .slice(0, 100)
      .map((t) => {
        const u = db.users.find((u) => u.id === t.user_id);
        return { ...t, full_name: u?.full_name, username: u?.username };
      });
  } else {
    txs = db.transactions
      .filter((t) => t.user_id === req.user.id)
      .reverse()
      .slice(0, 50);
  }
  res.json(txs);
});

app.post('/api/transactions', authenticate, requireAdmin, (req, res) => {
  const { user_id, type, amount, description = '' } = req.body;
  if (!user_id || !type || !amount) return res.status(400).json({ error: 'user_id, type, and amount are required' });
  if (!['credit', 'debit'].includes(type)) return res.status(400).json({ error: 'type must be credit or debit' });

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === parseInt(user_id, 10));
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  const newBalance = type === 'credit'
    ? db.users[userIdx].balance + parsedAmount
    : db.users[userIdx].balance - parsedAmount;

  db.users[userIdx].balance = newBalance;

  const transaction = {
    id: nextId(db.transactions),
    user_id: db.users[userIdx].id,
    type,
    amount: parsedAmount,
    description: String(description).trim() || (type === 'credit' ? 'Deposit' : 'Withdrawal'),
    created_at: nowISO(),
  };
  db.transactions.push(transaction);
  writeDB(db);

  res.status(201).json({ transaction, newBalance });
});

// Health endpoint for deployment platforms.
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

if (process.env.NODE_ENV === 'production' && fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`QFS Wallet API running on http://localhost:${PORT}`);
});
