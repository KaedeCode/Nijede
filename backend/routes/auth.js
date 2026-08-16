const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getProfile } = require('../controllers/authController');
const isAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Имя должно быть не менее 3 символов'),
    body('password').isLength({ min: 6 }).withMessage('Пароль не менее 6 символов')
  ],
  register
);

router.post('/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  login
);

router.post('/logout', logout);
router.get('/profile', isAuth, getProfile);

module.exports = router;