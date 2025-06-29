# Quick Start Guide

This guide will help you get the Asana ChatGPT Integration up and running quickly.

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] Asana account with developer access
- [ ] Basic understanding of OAuth 2.0

## Step-by-Step Setup

### 1. Create Asana App (5 minutes)

1. Visit [Asana Developer Console](https://app.asana.com/0/developer-console)
2. Click "Create new app"
3. Fill in app details:
   - **App name**: `ChatGPT Integration` (or your preferred name)
   - **Organization**: Select your organization
4. Set **Redirect URI**: `http://localhost:3000/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment (2 minutes)

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your credentials:
   ```env
   ASANA_CLIENT_ID=your_client_id_here
   ASANA_CLIENT_SECRET=your_client_secret_here
   ASANA_REDIRECT_URI=http://localhost:3000/auth/callback
   PORT=3000
   NODE_ENV=development
   ```

### 3. Install and Start (2 minutes)

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

You should see:
```
🚀 Asana ChatGPT Integration Server running on port 3000
📋 Health check: http://localhost:3000/health
🔐 OAuth flow: http://localhost:3000/auth/login
```

### 4. Complete Authentication (3 minutes)

1. **Check server status**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Start OAuth flow**:
   ```bash
   curl http://localhost:3000/auth/login
   ```

3. **Copy the authorization URL** from the response and visit it in your browser

4. **Grant permissions** to your app in Asana

5. **Verify authentication**:
   ```bash
   curl http://localhost:3000/auth/status
   ```

### 5. Test the API (3 minutes)

1. **Get your projects**:
   ```bash
   curl http://localhost:3000/projects
   ```

2. **Copy a project GID** from the response

3. **Create a test task**:
   ```bash
   curl -X POST http://localhost:3000/create_task \
     -H "Content-Type: application/json" \
     -d '{
       "task_name": "Test Task from API",
       "project_id": "YOUR_PROJECT_GID_HERE",
       "notes": "This is a test task"
     }'
   ```

4. **Get task details** (use task_id from previous response):
   ```bash
   curl "http://localhost:3000/get_task_details?task_id=YOUR_TASK_ID_HERE"
   ```

## Verification Checklist

- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] OAuth flow completes successfully
- [ ] Authentication status shows authenticated: true
- [ ] Projects endpoint returns your projects
- [ ] Task creation works
- [ ] Task retrieval works

## Common Issues & Solutions

### "Missing required environment variables"
- Double-check your `.env` file
- Ensure no extra spaces in variable names
- Restart the server after changing `.env`

### "Authentication required"
- Complete the OAuth flow at `/auth/login`
- Check `/auth/status` to verify authentication

### "Project not found"
- Use `/projects` endpoint to get valid project IDs
- Ensure you have access to the project in Asana

### OAuth callback fails
- Verify redirect URI matches exactly in Asana app settings
- Check that client ID and secret are correct

## 🚨 **Troubleshooting OAuth Setup**

### If you encounter errors during OAuth setup:

**"App not available to workspace"**:
- In Asana Developer Console → App Settings → Distribution
- Select "Internal use only" or "This organization only"  
- Save and wait 2-3 minutes

**"redirect_uri does not match"**:
- Ensure redirect URI is exactly: `http://localhost:3000/auth/callback`
- Use `http` (not `https`) and `localhost` (not `127.0.0.1`)

**"No scopes registered"**:
- In Developer Console → OAuth section
- Enable: `default`, `tasks:read`, `tasks:write`, `projects:read`
- Or select "Full permissions" for testing

### 📋 **Getting Project IDs**

**Method 1: From Asana URL**
1. Go to your Asana workspace
2. Open any project  
3. Copy project ID from URL: `https://app.asana.com/0/workspace/project/[PROJECT_ID]/list`
4. Use that PROJECT_ID number

**Method 2: Create Test Project**
1. In Asana: Click "+ Create Project"
2. Name: "API Test Project"
3. Get project ID from the URL when you open it

### ⚠️ **Known API Behaviors (Normal, Not Bugs)**

**Tags Issue**: "Not a recognized ID"
- **Why**: Asana requires tag IDs, not names
- **Solution**: Omit tags in testing: `"tags": []` or remove tags field entirely
- **Production**: Create tags in Asana first, then use their IDs

**Projects Endpoint**: "Need to specify workspace"  
- **Why**: Standard Asana API pagination requirement
- **Impact**: Main endpoints (create_task, get_task_details) work perfectly
- **Solution**: Get project IDs from Asana web interface instead

## Next Steps

1. **Integrate with ChatGPT**: Use the function definitions in `SAMPLE_FORMATS.md`
2. **Production Setup**: Implement proper database for token storage
3. **Security**: Add HTTPS and secure token encryption
4. **Monitoring**: Add logging and health monitoring

## Need Help?

- Check the comprehensive `README.md` for detailed documentation
- Review `SAMPLE_FORMATS.md` for API examples
- Run the test suite with `npm test`
- Check server logs for detailed error messages

## Production Considerations

⚠️ **Before deploying to production:**

1. **Replace file-based token storage** with a secure database
2. **Add HTTPS** for secure communication
3. **Implement user management** if supporting multiple users
4. **Add comprehensive logging** and monitoring
5. **Set up environment-specific configurations**
6. **Implement proper error tracking**

Happy coding! 🚀
