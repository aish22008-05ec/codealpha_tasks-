const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { storage } = require('./cloudinary');

const upload = multer({ storage });

// 👤 Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 🔑 Login user
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const query = emailOrUsername.includes('@')
      ? { email: emailOrUsername }
      : { username: emailOrUsername };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

// 🧑 Get user info by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email profilePic bio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 📸 Update Profile Picture
router.put('/profile-pic/:userId', upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.profilePic = req.file.path;
    await user.save();

    res.json({ message: "Profile picture updated!", url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// 📝 Update profile info (username, email, bio)
router.put('/update/:userId', async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
