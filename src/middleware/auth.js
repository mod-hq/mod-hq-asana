const { TokenManager } = require('../services/tokenManager');

/**
 * Authentication middleware
 */
const requireAuth = async (req, res, next) => {
  try {
    const tokenManager = new TokenManager();
    
    if (!tokenManager.hasValidToken()) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please complete the OAuth flow first.',
        instructions: 'Visit /auth/login to begin authentication'
      });
    }

    // Try to refresh token if needed
    await tokenManager.refreshTokenIfNeeded();
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
      details: error.message,
      instructions: 'Please complete the OAuth flow again at /auth/login'
    });
  }
};

module.exports = { requireAuth };
