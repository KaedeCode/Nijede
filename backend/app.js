require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const feedbackRoutes = require('./routes/feedback');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5500', 'https://kaedecode.github.io', 'http://127.0.0.1:5500', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
};
app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let sessionStore;
try {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    sessionStore = new MySQLStore({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    sessionStore = new MySQLStore({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
} catch (err) {
  console.error('[APP] MySQLStore init error:', err);
  sessionStore = undefined;
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  },
  proxy: true,
};

if (sessionStore) {
  sessionConfig.store = sessionStore;
}

app.use(session(sessionConfig));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', feedbackRoutes);

app.use((err, req, res, next) => {
  console.error('[APP] Global error:', err.stack);
  res.status(500).json({ error: 'Что-то пошло не так' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[APP] Server running on port ${PORT}`);
});