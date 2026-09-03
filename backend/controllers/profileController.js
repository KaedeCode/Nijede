const User = require('../models/User');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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
    updateData.birthdate = (birthdate && birthdate !== '') ? birthdate : null;
  }

  if (req.file) {
    try {
      const uploadDir = path.join(__dirname, '../uploads/avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webp';
      const isGif = req.file.mimetype === 'image/gif';

      const buffer = await sharp(req.file.buffer, { animated: isGif })
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 90 })
        .toBuffer();

      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      updateData.avatar_url = '/uploads/avatars/' + fileName;
    } catch (err) {
      console.error('[PROFILE] Image processing error:', err);
      return res.status(500).json({ error: 'Не удалось обработать изображение' });
    }
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