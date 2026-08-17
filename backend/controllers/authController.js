const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  console.log('[REGISTER] Request body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[REGISTER] Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const existing = await User.findByUsername(username);
    if (existing) {
      console.log('[REGISTER] Username already exists:', username);
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }
    const user = await User.create({ username, password });
    console.log('[REGISTER] User created:', user.id, user.username);

    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('[REGISTER] Session save error:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      console.log('[REGISTER] Session saved, userId:', req.session.userId, 'sessionID:', req.sessionID);
      res.status(201).json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error('[REGISTER] Server error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  console.log('[LOGIN] Request body:', req.body);
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      console.log('[LOGIN] User not found:', username);
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    const match = await User.comparePassword(password, user.password_hash);
    if (!match) {
      console.log('[LOGIN] Password mismatch for user:', username);
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      console.log('[LOGIN] Session saved, userId:', req.session.userId, 'sessionID:', req.sessionID);
      res.json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error('[LOGIN] Server error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.logout = (req, res) => {
  console.log('[LOGOUT] userId before destroy:', req.session.userId, 'sessionID:', req.sessionID);
  req.session.destroy(err => {
    if (err) {
      console.error('[LOGOUT] Destroy error:', err);
      return res.status(500).json({ error: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid');
    console.log('[LOGOUT] Session destroyed, cookie cleared');
    res.json({ message: 'Выход выполнен' });
  });
};

exports.getProfile = async (req, res) => {
  console.log('[GET_PROFILE] userId from session:', req.session.userId, 'sessionID:', req.sessionID);
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('[GET_PROFILE] User not found for userId:', req.session.userId);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    console.log('[GET_PROFILE] Profile fetched for user:', user.username);
    res.json({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    });
  } catch (err) {
    console.error('[GET_PROFILE] Server error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};