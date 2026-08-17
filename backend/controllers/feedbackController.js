const Feedback = require('../models/Feedback');
const { validationResult } = require('express-validator');

exports.submitFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { message, type, email } = req.body;
  const userId = req.session.userId || null;

  try {
    const feedback = await Feedback.create({
      userId,
      email: email || null,
      message,
      type: type || 'general'
    });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('[FEEDBACK] Error:', err);
    res.status(500).json({ error: 'Не удалось отправить отзыв' });
  }
};