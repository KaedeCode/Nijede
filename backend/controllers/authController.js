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
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }
    const user = await User.create({ username, password });
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error on register:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      console.log('Register success, session saved, userId:', req.session.userId);
      res.status(201).json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    const match = await User.comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error on login:', err);
        return res.status(500).json({ error: 'Ошибка сохранения сессии' });
      }
      console.log('Login success, session saved, userId:', req.session.userId);
      res.json({ id: user.id, username: user.username });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid');
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
      avatar_url: user.avatar_url
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};