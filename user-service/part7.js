// Part 7: middleware/auth.js (admin middleware)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as admin' });
};

module.exports = { protect, admin };
