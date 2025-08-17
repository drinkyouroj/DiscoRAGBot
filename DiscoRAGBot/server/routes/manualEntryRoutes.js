const express = require('express');
const ManualEntryService = require('../services/manualEntryService');
const { authenticateToken } = require('./middleware/auth');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Manual Entry routes - ${req.method} ${req.originalUrl} - User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// All routes require authentication
router.use(authenticateToken);

// GET /api/manual-entries - Get all manual entries for authenticated user
router.get('/', async (req, res) => {
  try {
    console.log(`GET /api/manual-entries - User: ${req.user._id}`);

    const entries = await ManualEntryService.getByUserId(req.user._id);

    res.json({
      entries: entries
    });
  } catch (error) {
    console.error('Error in GET /api/manual-entries:', error);
    res.status(500).json({ 
      error: error.message,
      message: error.message 
    });
  }
});

// POST /api/manual-entries - Create a new manual entry
router.post('/', async (req, res) => {
  try {
    console.log(`POST /api/manual-entries - User: ${req.user._id}`);

    const { title, content, category, tags } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Title, content, and category are required',
        message: 'Title, content, and category are required'
      });
    }

    // Validate field lengths
    if (title.length > 200) {
      return res.status(400).json({ 
        error: 'Title must be 200 characters or less',
        message: 'Title must be 200 characters or less'
      });
    }

    if (category.length > 50) {
      return res.status(400).json({ 
        error: 'Category must be 50 characters or less',
        message: 'Category must be 50 characters or less'
      });
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag.length > 30) {
          return res.status(400).json({ 
            error: 'Each tag must be 30 characters or less',
            message: 'Each tag must be 30 characters or less'
          });
        }
      }
    }

    const entryData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      tags: tags || []
    };

    const entry = await ManualEntryService.create(entryData, req.user._id);

    res.json({
      success: true,
      message: 'Manual entry created successfully',
      entryId: entry._id
    });
  } catch (error) {
    console.error('Error in POST /api/manual-entries:', error);
    res.status(400).json({ 
      error: error.message,
      message: error.message 
    });
  }
});

// PUT /api/manual-entries/:id - Update a manual entry
router.put('/:id', async (req, res) => {
  try {
    console.log(`PUT /api/manual-entries/${req.params.id} - User: ${req.user._id}`);

    const { title, content, category, tags } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Title, content, and category are required',
        message: 'Title, content, and category are required'
      });
    }

    // Validate field lengths
    if (title.length > 200) {
      return res.status(400).json({ 
        error: 'Title must be 200 characters or less',
        message: 'Title must be 200 characters or less'
      });
    }

    if (category.length > 50) {
      return res.status(400).json({ 
        error: 'Category must be 50 characters or less',
        message: 'Category must be 50 characters or less'
      });
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag.length > 30) {
          return res.status(400).json({ 
            error: 'Each tag must be 30 characters or less',
            message: 'Each tag must be 30 characters or less'
          });
        }
      }
    }

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      tags: tags || []
    };

    await ManualEntryService.update(req.params.id, updateData, req.user._id);

    res.json({
      success: true,
      message: 'Manual entry updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/manual-entries/:id:', error);

    if (error.message === 'Manual entry not found') {
      return res.status(404).json({ 
        error: error.message,
        message: error.message 
      });
    }

    res.status(400).json({ 
      error: error.message,
      message: error.message 
    });
  }
});

// DELETE /api/manual-entries/:id - Delete a manual entry
router.delete('/:id', async (req, res) => {
  try {
    console.log(`DELETE /api/manual-entries/${req.params.id} - User: ${req.user._id}`);

    await ManualEntryService.delete(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'Manual entry deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/manual-entries/:id:', error);

    if (error.message === 'Manual entry not found') {
      return res.status(404).json({ 
        error: error.message,
        message: error.message 
      });
    }

    res.status(500).json({ 
      error: error.message,
      message: error.message 
    });
  }
});

module.exports = router;