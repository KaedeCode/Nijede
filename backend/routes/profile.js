const express = require('express');
const { updateProfile } = require('../controllers/profileController');
const isAuth = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

const router = express.Router();

router.put('/profile', isAuth, upload.single('avatar'), updateProfile);

module.exports = router;