/**
 * Error handling middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = err.message;
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service unavailable - cannot connect to external service';
  } else if (err.response) {
    // Axios error with response
    status = err.response.status || 500;
    message = err.response.data?.message || 'External API error';
    details = err.response.data;
  }

  res.status(status).json({
    status: 'error',
    message: message,
    ...(details && { details })
  });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'GET /auth/login',
      'GET /auth/callback',
      'GET /auth/status',
      'POST /auth/refresh',
      'POST /create_task',
      'GET /get_task_details',
      'GET /projects'
    ]
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
