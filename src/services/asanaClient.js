const axios = require('axios');
const { TokenManager } = require('./tokenManager');

/**
 * AsanaClient handles all interactions with the Asana API
 */
class AsanaClient {
  constructor() {
    this.tokenManager = new TokenManager();
    this.baseURL = 'https://app.asana.com/api/1.0';
  }

  /**
   * Get headers for Asana API requests
   */
  async getHeaders() {
    // Ensure we have a valid token
    await this.tokenManager.refreshTokenIfNeeded();
    const accessToken = this.tokenManager.getAccessToken();

    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated request to Asana API
   */
  async makeRequest(method, endpoint, data = null) {
    const headers = await this.getHeaders();
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method,
      url,
      headers
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data.data;
    } catch (error) {
      // Log the error for debugging
      console.error(`Asana API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new task in Asana
   */
  async createTask(taskData) {
    const payload = {
      data: taskData
    };

    return await this.makeRequest('POST', '/tasks', payload);
  }

  /**
   * Get task details by ID
   */
  async getTask(taskId) {
    const fields = [
      'name',
      'notes',
      'due_on',
      'assignee',
      'assignee.name',
      'projects',
      'projects.name',
      'tags',
      'tags.name',
      'permalink_url',
      'completed',
      'created_at',
      'modified_at'
    ].join(',');

    return await this.makeRequest('GET', `/tasks/${taskId}?opt_fields=${fields}`);
  }

  /**
   * Get user's projects
   */
  async getProjects() {
    const fields = 'name,permalink_url';
    return await this.makeRequest('GET', `/projects?opt_fields=${fields}&limit=50`);
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return await this.makeRequest('GET', '/users/me');
  }

  /**
   * Update a task
   */
  async updateTask(taskId, updates) {
    const payload = {
      data: updates
    };

    return await this.makeRequest('PUT', `/tasks/${taskId}`, payload);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    return await this.makeRequest('DELETE', `/tasks/${taskId}`);
  }

  /**
   * Get tasks from a project
   */
  async getProjectTasks(projectId, limit = 20) {
    const fields = 'name,completed,due_on,assignee,assignee.name,permalink_url';
    return await this.makeRequest('GET', `/projects/${projectId}/tasks?opt_fields=${fields}&limit=${limit}`);
  }
}

module.exports = { AsanaClient };
