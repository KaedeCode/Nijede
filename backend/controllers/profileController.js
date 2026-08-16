const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const { username } = req.body;
  const userId = req.session.userId;
  const updateData = {};

  if (username) {
    updateData.username = username;
  }

  if (req.file) {
    updateData.avatar_url = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'Нет данных для обновления' });
  }

  try {
    await User.update(userId, updateData);
    const updated = await User.findById(userId);
    res.json({
      id: updated.id,
      username: updated.username,
      avatar_url: updated.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};