const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- Configuration ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

module.exports = function (req, res, next) {
  // Get token from the Authorization header (e.g., "Bearer <token>")
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token or invalid format, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // { id, role, name }

   
    req.user.isTemporary = !mongoose.Types.ObjectId.isValid(req.user.id);

    next(); 
  } catch (err) {

    res.status(401).json({ msg: 'Token is not valid' });
  }
};




