const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      name: decoded.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
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
