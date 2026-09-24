import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserFinanceData, saveUserFinanceData } from './src/db/users.ts';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'cloudsql_postgresql' });
});

// Sync user profile to PostgreSQL
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, avatarInitials, preferredCurrency } = req.body;
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized: missing user UID' });
    }
    const user = await getOrCreateUser(uid, email, name, avatarInitials, preferredCurrency);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('API /api/auth/sync-user error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Retrieve user financial data from PostgreSQL
app.get('/api/finance/data', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await getUserFinanceData(uid);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('API /api/finance/data GET error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch financial data' });
  }
});

// Persist user financial data into PostgreSQL
app.post('/api/finance/data', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { period, activeCurrencyCode, income, categories, transactions, balanceSheet, consultations } = req.body;
    const saved = await saveUserFinanceData(uid, {
      period: period || 'monthly',
      activeCurrencyCode: activeCurrencyCode || 'QAR',
      income: income || [],
      categories: categories || [],
      transactions: transactions || [],
      balanceSheet: balanceSheet || {},
      consultations: consultations || [],
    });
    res.json({ success: true, saved });
  } catch (error: any) {
    console.error('API /api/finance/data POST error:', error);
    res.status(500).json({ error: error.message || 'Failed to save financial data' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
