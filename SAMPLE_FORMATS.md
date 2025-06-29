# Sample Input/Output Formats for API Integration

This document provides example JSON payloads for both sending requests to the API and receiving responses, demonstrating successful and error cases.

## Create Task Endpoint

### Successful Request Example

**Request:**
```json
POST /create_task
Content-Type: application/json

{
  "task_name": "Design user interface mockups",
  "project_id": "1205277605028763",
  "notes": "Create wireframes and high-fidelity mockups for the new dashboard. Include mobile responsive designs and accessibility considerations.",
  "due_on": "2025-07-15",
  "assignee_id": "1205277605028764",
  "tags": ["design", "ui/ux", "dashboard", "priority"]
}
```

**Successful Response (201 Created):**
```json
{
  "status": "success",
  "message": "Task created successfully",
  "task_id": "1205277605028765",
  "task_url": "https://app.asana.com/0/1205277605028763/1205277605028765",
  "task_details": {
    "name": "Design user interface mockups",
    "gid": "1205277605028765",
    "created_at": "2025-06-26T14:30:00.000Z",
    "permalink_url": "https://app.asana.com/0/1205277605028763/1205277605028765"
  }
}
```

### Error Response Examples

**Validation Error (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "task_name is required and must be a non-empty string",
    "due_on must be in YYYY-MM-DD format"
  ]
}
```

**Project Not Found (404 Not Found):**
```json
{
  "status": "error",
  "message": "Project not found. Please check the project_id.",
  "details": {
    "errors": [
      {
        "message": "Not Found",
        "help": "For more information on API status codes and how to handle them, read the docs on errors: https://asana.github.io/developer-docs/#errors"
      }
    ]
  }
}
```

**Authentication Required (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Authentication required. Please complete the OAuth flow first.",
  "instructions": "Visit /auth/login to begin authentication"
}
```

## Get Task Details Endpoint

### Successful Request Example

**Request:**
```json
GET /get_task_details?task_id=1205277605028765
```

**Successful Response (200 OK):**
```json
{
  "status": "success",
  "message": "Task details retrieved successfully",
  "task_details": {
    "name": "Design user interface mockups",
    "gid": "1205277605028765",
    "notes": "Create wireframes and high-fidelity mockups for the new dashboard. Include mobile responsive designs and accessibility considerations.",
    "due_on": "2025-07-15",
    "assignee": {
      "name": "Sarah Johnson",
      "gid": "1205277605028764"
    },
    "project": {
      "name": "Website Redesign Project",
      "gid": "1205277605028763"
    },
    "tags": [
      {
        "name": "design",
        "gid": "1205277605028766"
      },
      {
        "name": "ui/ux",
        "gid": "1205277605028767"
      },
      {
        "name": "dashboard",
        "gid": "1205277605028768"
      },
      {
        "name": "priority",
        "gid": "1205277605028769"
      }
    ],
    "permalink_url": "https://app.asana.com/0/1205277605028763/1205277605028765",
    "completed": false,
    "created_at": "2025-06-26T14:30:00.000Z",
    "modified_at": "2025-06-26T14:30:00.000Z",
    "completion_status": "incomplete"
  }
}
```

### Error Response Examples

**Task Not Found (404 Not Found):**
```json
{
  "status": "error",
  "message": "Task not found. Please check the task_id.",
  "details": {
    "errors": [
      {
        "message": "Not Found",
        "help": "For more information on API status codes and how to handle them, read the docs on errors: https://asana.github.io/developer-docs/#errors"
      }
    ]
  }
}
```

**Invalid Task ID (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "task_id is required and must be a non-empty string"
  ]
}
```

## Authentication Endpoints

### OAuth Login Response

**Request:**
```json
GET /auth/login
```

**Response:**
```json
{
  "status": "success",
  "message": "Please visit the authorization URL to grant access",
  "authorization_url": "https://app.asana.com/-/oauth_authorize?client_id=1205277605028766&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code&scope=default",
  "instructions": "Visit the URL above in your browser to authorize the application"
}
```

### OAuth Callback Success

**Response:**
```json
{
  "status": "success",
  "message": "Authorization successful! You can now use the API endpoints.",
  "token_expires_in": 3600
}
```

### Authentication Status

**Request:**
```json
GET /auth/status
```

**Authenticated Response:**
```json
{
  "status": "success",
  "authenticated": true,
  "token_info": {
    "has_token": true,
    "expires_at": "2025-06-26T15:30:00.000Z",
    "expires_in_seconds": 3456,
    "is_expired": false
  }
}
```

**Not Authenticated Response:**
```json
{
  "status": "success",
  "authenticated": false,
  "token_info": {
    "has_token": false
  }
}
```

## Helper Endpoints

### Projects List

**Request:**
```json
GET /projects
```

**Response:**
```json
{
  "status": "success",
  "message": "Projects retrieved successfully",
  "projects": [
    {
      "name": "Website Redesign Project",
      "gid": "1205277605028763",
      "permalink_url": "https://app.asana.com/0/1205277605028763"
    },
    {
      "name": "Mobile App Development",
      "gid": "1205277605028767",
      "permalink_url": "https://app.asana.com/0/1205277605028767"
    },
    {
      "name": "Marketing Campaign Q3",
      "gid": "1205277605028768",
      "permalink_url": "https://app.asana.com/0/1205277605028768"
    }
  ]
}
```

### Health Check

**Request:**
```json
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "Asana Task Management Service is running",
  "timestamp": "2025-06-26T14:30:00.000Z"
}
```

## Rate Limiting Response

**Response (429 Too Many Requests):**
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

## General Error Response Format

All error responses follow this consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "details": "Additional technical details (optional)",
  "errors": ["Array of specific validation errors (optional)"]
}
```

## API Integration Examples

### Function Definitions for Automated Systems

```json
{
  "functions": [
    {
      "name": "create_asana_task",
      "description": "Create a new task in Asana project",
      "parameters": {
        "type": "object",
        "properties": {
          "task_name": {
            "type": "string",
            "description": "Name of the task to create"
          },
          "project_id": {
            "type": "string",
            "description": "Asana project GID where task will be created"
          },
          "notes": {
            "type": "string",
            "description": "Optional detailed description of the task"
          },
          "due_on": {
            "type": "string",
            "description": "Optional due date in YYYY-MM-DD format"
          },
          "assignee_id": {
            "type": "string",
            "description": "Optional GID of user to assign task to"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Optional array of tag names to assign to the task"
          }
        },
        "required": ["task_name", "project_id"]
      }
    },
    {
      "name": "get_asana_task_details",
      "description": "Retrieve details of an existing Asana task",
      "parameters": {
        "type": "object",
        "properties": {
          "task_id": {
            "type": "string",
            "description": "GID of the Asana task to retrieve"
          }
        },
        "required": ["task_id"]
      }
    }
  ]
}
```

### Sample Function Calls

**Creating a Task:**
```json
{
  "function_call": {
    "name": "create_asana_task",
    "arguments": {
      "task_name": "Review quarterly sales report",
      "project_id": "1205277605028763",
      "notes": "Analyze Q2 performance metrics and prepare summary for stakeholders",
      "due_on": "2025-07-01",
      "tags": ["quarterly", "sales", "review", "high-priority"]
    }
  }
}
```

**Getting Task Details:**
```json
{
  "function_call": {
    "name": "get_asana_task_details",
    "arguments": {
      "task_id": "1205277605028765"
    }
  }
}
```
