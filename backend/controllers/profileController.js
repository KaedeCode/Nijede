const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const { username, pronouns, bio, birthdate } = req.body;
  const userId = req.session.userId;
  const updateData = {};

  if (username !== undefined && username !== null) {
    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Имя должно содержать минимум 3 символа' });
    }
    updateData.username = username.trim();
  }

  if (pronouns !== undefined && pronouns !== null) {
    updateData.pronouns = pronouns.trim() || null;
  }

  if (bio !== undefined && bio !== null) {
    updateData.bio = bio.trim() || null;
  }

  if (birthdate !== undefined && birthdate !== null) {
    // Если пришла пустая строка или null – сохраняем NULL, иначе дату
    updateData.birthdate = (birthdate && birthdate !== '') ? birthdate : null;
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
      pronouns: updated.pronouns,
      bio: updated.bio,
      birthdate: updated.birthdate,
      created_at: updated.created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};