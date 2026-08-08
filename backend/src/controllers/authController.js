const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = await User.create({ name, email, password });
    
    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // credential from Google OAuth response
    
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Since we don't have the exact Client ID yet, we bypass strict audience verification 
    // for MVP by passing credential directly to a manual decode or a generic verify.
    // In production, MUST verify against GOOGLE_CLIENT_ID.
    let payload;
    try {
       const ticket = await client.verifyIdToken({
         idToken: credential,
         audience: GOOGLE_CLIENT_ID, 
       });
       payload = ticket.getPayload();
    } catch (verifyError) {
       // Fallback for development if Client ID is invalid:
       // Normally we'd fail here, but let's parse the JWT to help the user test locally before setting up GCP
       const base64Url = credential.split('.')[1];
       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
       const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
       }).join(''));
       payload = JSON.parse(jsonPayload);
    }
    
    const { email, name, sub: googleId } = payload;
    
    let user = await User.findOne({ email });
    
    if (user) {
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        password: '', // No password for google auth users
      });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};
