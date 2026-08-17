const express = require('express');
const { body } = require('express-validator');
const { submitFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post('/feedback',
  [
    body('message').isLength({ min: 5 }).withMessage('Сообщение должно содержать минимум 5 символов'),
    body('type').optional().isIn(['general', 'bug', 'suggestion']).withMessage('Недопустимый тип'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Некорректный email')
  ],
  submitFeedback
);

module.exports = router;