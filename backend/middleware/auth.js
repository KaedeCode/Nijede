function isAuthenticated(req, res, next) {
  console.log('[AUTH] Checking session, userId:', req.session.userId, 'sessionID:', req.sessionID);
  if (req.session && req.session.userId) {
    console.log('[AUTH] Authenticated, proceeding');
    return next();
  }
  console.log('[AUTH] Not authenticated, sending 401');
  res.status(401).json({ error: 'Не авторизован' });
}

module.exports = isAuthenticated;