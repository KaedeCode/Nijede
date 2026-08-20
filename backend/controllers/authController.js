const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const existing = await User.findByUsername(username);
    if (existing) {
      console.log(`[REGISTER] Attempt with existing username: ${username}`);
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }
    const user = await User.create({ username, password });
    console.log(`[REGISTER] New user created: ${user.username} (id: ${user.id})`);

    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('[REGISTER] Session save error:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      res.status(201).json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error('[REGISTER] Server error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      console.log(`[LOGIN] Failed: user not found - ${username}`);
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    const match = await User.comparePassword(password, user.password_hash);
    if (!match) {
      console.log(`[LOGIN] Failed: wrong password for ${username}`);
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      console.log(`[LOGIN] Successful: ${username} (id: ${user.id})`);
      res.json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error('[LOGIN] Server error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.logout = (req, res) => {
  const userId = req.session.userId;
  req.session.destroy(err => {
    if (err) {
      console.error('[LOGOUT] Destroy error:', err);
      return res.status(500).json({ error: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid');
    console.log(`[LOGOUT] User ${userId} logged out`);
    res.json({ message: 'Выход выполнен' });
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      pronouns: user.pronouns,
      bio: user.bio,
      birthdate: user.birthdate ? user.birthdate.toISOString().split('T')[0] : null,
      created_at: user.created_at
    });
  } catch (err) {
    console.error('[GET_PROFILE] Error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};