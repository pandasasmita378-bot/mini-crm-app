const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');


const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || '124356';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists.' });
    }

    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user.id, role: user.role, name: user.name } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'No account found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect password.' });
    }
    
    const payload = { user: { id: user.id, role: user.role, name: user.name } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/admin/login', async (req, res) => {
  const { adminName, adminKey } = req.body;
  if (!adminName || !adminKey) {
    return res.status(400).json({ msg: 'Admin name and key are required.' });
  }
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ msg: 'Invalid admin key.' });
  }

  try {

    const payload = {
      user: {
        id: `admin_session_${Date.now()}`, 
        role: 'admin',
        name: adminName,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).send('Server Error');
  }
});


router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied.' });
  }
  try {
    
    const users = await User.find({ role: 'user' }).select('name');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

