const UserService = require('../../services/userService.js');
const jwt = require('jsonwebtoken');

const requireUser = async (req, res, next) => {
  console.log('Auth middleware - checking authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('Auth middleware - No token found, returning 401');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Auth middleware - Token found, length:', token.length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully, user ID:', decoded.sub);
    
    const user = await UserService.get(decoded.sub);
    if (!user) {
      console.log('Auth middleware - User not found in database for ID:', decoded.sub);
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('Auth middleware - User found, proceeding to route handler');
    req.user = user;

    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  requireUser,
};