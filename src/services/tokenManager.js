const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * TokenManager handles OAuth token storage and refresh logic
 * For production, this should be replaced with a proper database
 */
class TokenManager {
  constructor() {
    this.tokenFile = path.join(__dirname, '../../tokens.json');
    this.tokens = this.loadTokens();
  }

  /**
   * Load tokens from file storage
   */
  loadTokens() {
    try {
      if (fs.existsSync(this.tokenFile)) {
        const data = fs.readFileSync(this.tokenFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Warning: Could not load tokens from file:', error.message);
    }
    return null;
  }

  /**
   * Save tokens to file storage
   */
  saveTokens() {
    try {
      fs.writeFileSync(this.tokenFile, JSON.stringify(this.tokens, null, 2));
    } catch (error) {
      console.error('Error saving tokens to file:', error.message);
    }
  }

  /**
   * Store new tokens
   */
  storeTokens(tokenData) {
    this.tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      expires_at: tokenData.expires_at,
      stored_at: Date.now()
    };
    this.saveTokens();
    console.log('✅ Tokens stored successfully');
  }

  /**
   * Get current access token
   */
  getAccessToken() {
    if (!this.tokens) {
      throw new Error('No tokens available. Please complete OAuth flow first.');
    }
    return this.tokens.access_token;
  }

  /**
   * Check if we have a valid token
   */
  hasValidToken() {
    if (!this.tokens) return false;
    
    // Check if token is expired (with 5-minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() < (this.tokens.expires_at - bufferTime);
  }

  /**
   * Get token info for status checks
   */
  getTokenInfo() {
    if (!this.tokens) {
      return { has_token: false };
    }

    return {
      has_token: true,
      expires_at: new Date(this.tokens.expires_at).toISOString(),
      expires_in_seconds: Math.max(0, Math.floor((this.tokens.expires_at - Date.now()) / 1000)),
      is_expired: Date.now() >= this.tokens.expires_at
    };
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    if (!this.tokens) {
      throw new Error('No tokens available for refresh');
    }

    if (this.hasValidToken()) {
      return false; // No refresh needed
    }

    return await this.refreshToken();
  }

  /**
   * Force refresh token
   */
  async refreshToken() {
    if (!this.tokens || !this.tokens.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 Refreshing access token...');

      const response = await axios.post('https://app.asana.com/-/oauth_token', {
        grant_type: 'refresh_token',
        client_id: process.env.ASANA_CLIENT_ID,
        client_secret: process.env.ASANA_CLIENT_SECRET,
        refresh_token: this.tokens.refresh_token
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // Update stored tokens
      this.tokens.access_token = access_token;
      if (refresh_token) {
        this.tokens.refresh_token = refresh_token;
      }
      this.tokens.expires_in = expires_in;
      this.tokens.expires_at = Date.now() + (expires_in * 1000);

      this.saveTokens();
      console.log('✅ Token refreshed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens() {
    this.tokens = null;
    try {
      if (fs.existsSync(this.tokenFile)) {
        fs.unlinkSync(this.tokenFile);
      }
    } catch (error) {
      console.warn('Warning: Could not delete token file:', error.message);
    }
    console.log('🗑️ Tokens cleared');
  }
}

module.exports = { TokenManager };
