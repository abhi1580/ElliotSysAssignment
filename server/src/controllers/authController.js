const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const expiresIn = process.env.EXPIRES_IN || '1d';
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: typeof expiresIn === 'string' && expiresIn.endsWith('d')
        ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000 // fallback to 1 day
    });
    res.status(201).json({ user: user.email });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const expiresIn = process.env.EXPIRES_IN || '1d';
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: typeof expiresIn === 'string' && expiresIn.endsWith('d')
        ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000 // fallback to 1 day
    });
    res.status(200).json({ user: user.email });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ message: 'Logged out' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user: user.email });
  } catch (err) {
    next(err);
  }
}; 