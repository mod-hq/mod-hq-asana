const express = require('express');
const { AsanaClient } = require('../services/asanaClient');
const { validateTaskCreation, validateTaskRetrieval } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const asanaClient = new AsanaClient();

/**
 * Create a new task in Asana
 * POST /create_task
 */
router.post('/create_task', requireAuth, validateTaskCreation, async (req, res) => {
  try {
    const { task_name, project_id, notes, due_on, assignee_id, tags } = req.body;

    console.log(`📝 Creating task: "${task_name}" in project ${project_id}`);

    const taskData = {
      name: task_name,
      projects: [project_id]
    };

    // Add optional fields if provided
    if (notes) taskData.notes = notes;
    if (due_on) taskData.due_on = due_on;
    if (assignee_id) taskData.assignee = assignee_id;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      taskData.tags = tags;
    }

    const result = await asanaClient.createTask(taskData);

    console.log(`✅ Task created successfully: ${result.gid}`);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      task_id: result.gid,
      task_url: result.permalink_url,
      task_details: {
        name: result.name,
        gid: result.gid,
        created_at: result.created_at,
        permalink_url: result.permalink_url
      }
    });

  } catch (error) {
    console.error('Task creation error:', error.response?.data || error.message);
    
    // Handle specific Asana API errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found. Please check the project_id.',
        details: error.response.data
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Please check your permissions for this project.',
        details: error.response.data
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create task',
      details: error.response?.data?.errors?.[0]?.message || error.message
    });
  }
});

/**
 * Get details of an existing task
 * GET /get_task_details
 */
router.get('/get_task_details', requireAuth, validateTaskRetrieval, async (req, res) => {
  try {
    const { task_id } = req.query;

    console.log(`🔍 Retrieving task details for: ${task_id}`);

    const task = await asanaClient.getTask(task_id);

    console.log(`✅ Task details retrieved: ${task.name}`);

    res.json({
      status: 'success',
      message: 'Task details retrieved successfully',
      task_details: {
        name: task.name,
        gid: task.gid,
        notes: task.notes || '',
        due_on: task.due_on || null,
        assignee: task.assignee ? {
          name: task.assignee.name,
          gid: task.assignee.gid
        } : null,
        project: task.projects && task.projects.length > 0 ? {
          name: task.projects[0].name,
          gid: task.projects[0].gid
        } : null,
        tags: task.tags && task.tags.length > 0 ? task.tags.map(tag => ({
          name: tag.name,
          gid: tag.gid
        })) : [],
        permalink_url: task.permalink_url,
        completed: task.completed,
        created_at: task.created_at,
        modified_at: task.modified_at,
        completion_status: task.completed ? 'completed' : 'incomplete'
      }
    });

  } catch (error) {
    console.error('Task retrieval error:', error.response?.data || error.message);

    // Handle specific Asana API errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found. Please check the task_id.',
        details: error.response.data
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You may not have permission to view this task.',
        details: error.response.data
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve task details',
      details: error.response?.data?.errors?.[0]?.message || error.message
    });
  }
});

/**
 * Get user's projects (helper endpoint for finding project IDs)
 * GET /projects
 */
router.get('/projects', requireAuth, async (req, res) => {
  try {
    console.log('📋 Retrieving user projects');

    const projects = await asanaClient.getProjects();

    res.json({
      status: 'success',
      message: 'Projects retrieved successfully',
      projects: projects.map(project => ({
        name: project.name,
        gid: project.gid,
        permalink_url: project.permalink_url
      }))
    });

  } catch (error) {
    console.error('Projects retrieval error:', error.response?.data || error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve projects',
      details: error.response?.data?.errors?.[0]?.message || error.message
    });
  }
});

module.exports = router;
