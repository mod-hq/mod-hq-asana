const express = require('express');
const axios = require('axios');
const { TokenManager } = require('../services/tokenManager');
const { validateOAuthConfig } = require('../middleware/validation');

const router = express.Router();
const tokenManager = new TokenManager();

// Validate OAuth configuration on startup
validateOAuthConfig();

/**
 * Initiates the OAuth 2.0 authorization flow
 * GET /auth/login
 */
router.get('/login', (req, res) => {
  try {
    const authUrl = `https://app.asana.com/-/oauth_authorize?` +
      `client_id=${process.env.ASANA_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.ASANA_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=default`;

    res.json({
      status: 'success',
      message: 'Please visit the authorization URL to grant access',
      authorization_url: authUrl,
      instructions: 'Visit the URL above in your browser to authorize the application'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate authorization URL'
    });
  }
});

/**
 * Handles the OAuth callback and exchanges code for tokens
 * GET /auth/callback
 */
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: `OAuth authorization failed: ${error}`
    });
  }

  if (!code) {
    return res.status(400).json({
      status: 'error',
      message: 'Authorization code not provided'
    });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://app.asana.com/-/oauth_token', {
      grant_type: 'authorization_code',
      client_id: process.env.ASANA_CLIENT_ID,
      client_secret: process.env.ASANA_CLIENT_SECRET,
      redirect_uri: process.env.ASANA_REDIRECT_URI,
      code: code
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens
    tokenManager.storeTokens({
      access_token,
      refresh_token,
      expires_in,
      expires_at: Date.now() + (expires_in * 1000)
    });

    console.log('✅ OAuth flow completed successfully');

    res.json({
      status: 'success',
      message: 'Authorization successful! You can now use the API endpoints.',
      token_expires_in: expires_in
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to exchange authorization code for access token',
      details: error.response?.data?.error_description || error.message
    });
  }
});

/**
 * Check current authentication status
 * GET /auth/status
 */
router.get('/status', (req, res) => {
  try {
    const isAuthenticated = tokenManager.hasValidToken();
    const tokenInfo = tokenManager.getTokenInfo();

    res.json({
      status: 'success',
      authenticated: isAuthenticated,
      token_info: tokenInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check authentication status'
    });
  }
});

/**
 * Manually refresh access token
 * POST /auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshed = await tokenManager.refreshTokenIfNeeded();
    
    if (refreshed) {
      res.json({
        status: 'success',
        message: 'Token refreshed successfully'
      });
    } else {
      res.json({
        status: 'success',
        message: 'Token is still valid, no refresh needed'
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token',
      details: error.message
    });
  }
});

module.exports = router;
