const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin };
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as admin' });
};

const serviceAuth = (req, res, next) => {
  const token = req.headers['x-service-token'];
  if (!token || token !== process.env.SERVICE_TOKEN) {
    return res.status(403).json({ message: 'Invalid service token' });
  }
  next();
};

module.exports = { protect, admin, serviceAuth };
