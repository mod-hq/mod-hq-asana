/**
 * Validation middleware for API endpoints
 */

/**
 * Validate OAuth configuration
 */
const validateOAuthConfig = () => {
  const requiredEnvVars = ['ASANA_CLIENT_ID', 'ASANA_CLIENT_SECRET', 'ASANA_REDIRECT_URI'];
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set');
    process.exit(1);
  }
};

/**
 * Validate task creation request
 */
const validateTaskCreation = (req, res, next) => {
  const { task_name, project_id } = req.body;
  const errors = [];

  // Required fields
  if (!task_name || typeof task_name !== 'string' || task_name.trim() === '') {
    errors.push('task_name is required and must be a non-empty string');
  }

  if (!project_id || typeof project_id !== 'string' || project_id.trim() === '') {
    errors.push('project_id is required and must be a non-empty string');
  }

  // Optional field validation
  if (req.body.notes && typeof req.body.notes !== 'string') {
    errors.push('notes must be a string');
  }

  if (req.body.due_on) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.body.due_on)) {
      errors.push('due_on must be in YYYY-MM-DD format');
    } else {
      // Validate it's a real date
      const date = new Date(req.body.due_on);
      if (isNaN(date.getTime())) {
        errors.push('due_on must be a valid date');
      }
    }
  }

  if (req.body.assignee_id && typeof req.body.assignee_id !== 'string') {
    errors.push('assignee_id must be a string');
  }

  if (req.body.tags) {
    if (!Array.isArray(req.body.tags)) {
      errors.push('tags must be an array of strings');
    } else {
      const invalidTags = req.body.tags.filter(tag => typeof tag !== 'string');
      if (invalidTags.length > 0) {
        errors.push('all tags must be strings');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

/**
 * Validate task retrieval request
 */
const validateTaskRetrieval = (req, res, next) => {
  const { task_id } = req.query;
  const errors = [];

  if (!task_id || typeof task_id !== 'string' || task_id.trim() === '') {
    errors.push('task_id is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

/**
 * Validate request body size
 */
const validateRequestSize = (req, res, next) => {
  const maxSize = 1024 * 1024; // 1MB
  const contentLength = parseInt(req.get('Content-Length') || '0');
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      status: 'error',
      message: 'Request body too large'
    });
  }
  
  next();
};

module.exports = {
  validateOAuthConfig,
  validateTaskCreation,
  validateTaskRetrieval,
  validateRequestSize
};
