const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error.message);
    return [];
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error.message);
    return false;
  }
}

// Routes

// GET /courses - Retrieve all courses
app.get('/courses', (req, res) => {
  try {
    const courses = readDatabase();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
});

// POST /courses - Create a new course
app.post('/courses', (req, res) => {
  try {
    const courses = readDatabase();
    const newCourse = {
      id: Date.now().toString(),
      ...req.body,
      posts: []
    };
    courses.unshift(newCourse);
    
    if (writeDatabase(courses)) {
      res.status(201).json(newCourse);
    } else {
      res.status(500).json({ error: 'Failed to save course' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PUT /courses/:id - Update a course by id
app.put('/courses/:id', (req, res) => {
  try {
    const courses = readDatabase();
    const courseIndex = courses.findIndex(course => course.id === req.params.id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    courses[courseIndex] = {
      ...courses[courseIndex],
      ...req.body,
      id: req.params.id,
      posts: courses[courseIndex].posts // Preserve posts
    };
    
    if (writeDatabase(courses)) {
      res.json(courses[courseIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update course' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /courses/:id - Delete a course by id
app.delete('/courses/:id', (req, res) => {
  try {
    const courses = readDatabase();
    const courseIndex = courses.findIndex(course => course.id === req.params.id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const deletedCourse = courses.splice(courseIndex, 1)[0];
    
    if (writeDatabase(courses)) {
      res.json({ message: 'Course deleted successfully', course: deletedCourse });
    } else {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// POST /courses/:id/posts - Add a post to a course
app.post('/courses/:id/posts', (req, res) => {
  try {
    const courses = readDatabase();
    const courseIndex = courses.findIndex(course => course.id === req.params.id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const newPost = {
      id: (Date.now() + Math.random()).toString(),
      ...req.body
    };
    
    courses[courseIndex].posts.unshift(newPost);
    
    if (writeDatabase(courses)) {
      res.status(201).json(newPost);
    } else {
      res.status(500).json({ error: 'Failed to save post' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /courses/:courseId/posts/:postId - Update a post
app.put('/courses/:courseId/posts/:postId', (req, res) => {
  try {
    const courses = readDatabase();
    const courseIndex = courses.findIndex(course => course.id === req.params.courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const postIndex = courses[courseIndex].posts.findIndex(post => post.id === req.params.postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    courses[courseIndex].posts[postIndex] = {
      ...courses[courseIndex].posts[postIndex],
      ...req.body,
      id: req.params.postId
    };
    
    if (writeDatabase(courses)) {
      res.json(courses[courseIndex].posts[postIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update post' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /courses/:courseId/posts/:postId - Delete a post
app.delete('/courses/:courseId/posts/:postId', (req, res) => {
  try {
    const courses = readDatabase();
    const courseIndex = courses.findIndex(course => course.id === req.params.courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const postIndex = courses[courseIndex].posts.findIndex(post => post.id === req.params.postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const deletedPost = courses[courseIndex].posts.splice(postIndex, 1)[0];
    
    if (writeDatabase(courses)) {
      res.json({ message: 'Post deleted successfully', post: deletedPost });
    } else {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
