const http = require('http');

/**
 * Simple test script to verify API endpoints
 * Run after setting up OAuth and environment variables
 */

const API_BASE = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.body);
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

async function testAuthStatus() {
  console.log('\n🔐 Testing auth status...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/status',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.body);
    return response.body.authenticated;
  } catch (error) {
    console.error('Auth status check failed:', error.message);
    return false;
  }
}

async function testCreateTask() {
  console.log('\n📝 Testing task creation...');
  try {
    const taskData = {
      task_name: 'Test Task from API',
      project_id: 'YOUR_PROJECT_ID_HERE', // Replace with actual project ID
      notes: 'This is a test task created via the API',
      due_on: '2025-07-01'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/create_task',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
      }
    }, taskData);
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.body);
    
    if (response.status === 201 && response.body.task_id) {
      console.log('✅ Task created successfully!');
      return response.body.task_id;
    }
    return null;
  } catch (error) {
    console.error('Task creation failed:', error.message);
    return null;
  }
}

async function testGetTaskDetails(taskId) {
  console.log('\n🔍 Testing task retrieval...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/get_task_details?task_id=${taskId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.body);
    return response.status === 200;
  } catch (error) {
    console.error('Task retrieval failed:', error.message);
    return false;
  }
}

async function testGetProjects() {
  console.log('\n📋 Testing projects retrieval...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/projects',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.body);
    
    if (response.status === 200 && response.body.projects) {
      console.log(`Found ${response.body.projects.length} projects`);
      if (response.body.projects.length > 0) {
        console.log('First project:', response.body.projects[0]);
      }
    }
    return response.status === 200;
  } catch (error) {
    console.error('Projects retrieval failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API tests...');
  console.log('Make sure the server is running on port 3000');
  
  // Test health endpoint
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('❌ Server is not running or not responding');
    return;
  }

  // Check authentication status
  const isAuthenticated = await testAuthStatus();
  if (!isAuthenticated) {
    console.log('⚠️  Not authenticated. Please complete OAuth flow first:');
    console.log('   1. Visit http://localhost:3000/auth/login');
    console.log('   2. Follow the authorization URL');
    console.log('   3. Complete the OAuth flow');
    console.log('   4. Run this test again');
    return;
  }

  console.log('✅ Authentication verified');

  // Test projects endpoint
  await testGetProjects();

  // Test task creation (you'll need to update the project ID)
  console.log('\n⚠️  To test task creation and retrieval:');
  console.log('1. Update the project_id in testCreateTask() function');
  console.log('2. Uncomment the task creation test below');
  
  // Uncomment these lines after updating the project ID:
  // const taskId = await testCreateTask();
  // if (taskId) {
  //   await testGetTaskDetails(taskId);
  // }

  console.log('\n🎉 Basic tests completed!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthEndpoint,
  testAuthStatus,
  testCreateTask,
  testGetTaskDetails,
  testGetProjects,
  runTests
};
