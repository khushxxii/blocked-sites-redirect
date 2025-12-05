const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./exam_focus.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration INTEGER NOT NULL,
    task_name TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    exam_date TEXT NOT NULL,
    exam_name TEXT,
    total_study_time INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_config (
    id INTEGER PRIMARY KEY,
    user_name TEXT,
    study_field TEXT,
    goal_description TEXT,
    motivations TEXT,
    quotes TEXT,
    setup_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default settings if not exists
  db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
    if (!row) {
      db.run(`INSERT INTO settings (id, exam_date, exam_name) VALUES (1, ?, ?)`,
        [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), 'Final Exams']);
    }
  });
}

// ==================== API ROUTES ====================

// User Configuration endpoints
app.get('/api/user-config', (req, res) => {
  db.get('SELECT * FROM user_config WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      // Parse JSON strings back to objects
      const config = {
        ...row,
        motivations: JSON.parse(row.motivations || '[]'),
        quotes: JSON.parse(row.quotes || '[]')
      };
      res.json(config);
    } else {
      res.json({ setup_completed: false });
    }
  });
});

app.post('/api/user-config', (req, res) => {
  const { userName, studyField, goalDescription, motivations, quotes, examName, examDate } = req.body;
  
  // Convert arrays to JSON strings for storage
  const motivationsJSON = JSON.stringify(motivations);
  const quotesJSON = JSON.stringify(quotes);
  
  db.get('SELECT * FROM user_config WHERE id = 1', (err, row) => {
    if (row) {
      // Update existing config
      db.run(`UPDATE user_config SET 
        user_name = ?, 
        study_field = ?, 
        goal_description = ?, 
        motivations = ?, 
        quotes = ?,
        setup_completed = 1,
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1`,
        [userName, studyField, goalDescription, motivationsJSON, quotesJSON],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            // Also update settings with exam info
            db.run(`UPDATE settings SET exam_date = ?, exam_name = ? WHERE id = 1`,
              [examDate, examName],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                } else {
                  res.json({ success: true });
                }
              });
          }
        });
    } else {
      // Insert new config
      db.run(`INSERT INTO user_config (id, user_name, study_field, goal_description, motivations, quotes, setup_completed) 
        VALUES (1, ?, ?, ?, ?, ?, 1)`,
        [userName, studyField, goalDescription, motivationsJSON, quotesJSON],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            // Also update settings with exam info
            db.run(`UPDATE settings SET exam_date = ?, exam_name = ? WHERE id = 1`,
              [examDate, examName],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                } else {
                  res.json({ success: true });
                }
              });
          }
        });
    }
  });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row || {});
    }
  });
});

app.put('/api/settings', (req, res) => {
  const { exam_date, exam_name } = req.body;
  db.run(`UPDATE settings SET exam_date = ?, exam_name = ? WHERE id = 1`,
    [exam_date, exam_name],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    });
});

// Task endpoints
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY completed, priority DESC, created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  db.run(`INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)`,
    [title, description, priority || 'medium'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, success: true });
      }
    });
});

app.put('/api/tasks/:id', (req, res) => {
  const { completed, title, description, priority } = req.body;
  const updates = [];
  const values = [];
  
  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (completed !== undefined) {
    updates.push('completed = ?');
    values.push(completed ? 1 : 0);
    if (completed) {
      updates.push('completed_at = ?');
      values.push(new Date().toISOString());
    }
  }
  
  values.push(req.params.id);
  
  db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    values,
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Study session endpoints
app.get('/api/study-sessions', (req, res) => {
  db.all('SELECT * FROM study_sessions ORDER BY started_at DESC LIMIT 50', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/study-sessions', (req, res) => {
  const { duration, task_name, notes } = req.body;
  db.run(`INSERT INTO study_sessions (duration, task_name, notes) VALUES (?, ?, ?)`,
    [duration, task_name, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Update total study time
        db.run('UPDATE settings SET total_study_time = total_study_time + ? WHERE id = 1',
          [duration]);
        res.json({ id: this.lastID, success: true });
      }
    });
});

app.get('/api/stats', (req, res) => {
  const stats = {};
  
  // Get total study time
  db.get('SELECT total_study_time FROM settings WHERE id = 1', (err, row) => {
    stats.totalStudyTime = row ? row.total_study_time : 0;
    
    // Get completed tasks count
    db.get('SELECT COUNT(*) as count FROM tasks WHERE completed = 1', (err, row) => {
      stats.completedTasks = row ? row.count : 0;
      
      // Get total tasks count
      db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
        stats.totalTasks = row ? row.count : 0;
        
        // Get today's study time (in local timezone)
        // Calculate local midnight and convert to UTC for comparison with SQLite's UTC timestamps
        const now = new Date();
        const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const localNextMidnight = new Date(localMidnight.getTime() + 24 * 60 * 60 * 1000);
        
        // Convert to UTC timestamps in SQLite format (YYYY-MM-DD HH:MM:SS)
        const utcMidnight = localMidnight.toISOString().replace('T', ' ').substring(0, 19);
        const utcNextMidnight = localNextMidnight.toISOString().replace('T', ' ').substring(0, 19);
        
        // Compare UTC timestamps stored in SQLite with the UTC range for "today" in local time
        db.get(`SELECT SUM(duration) as time FROM study_sessions 
                WHERE started_at >= ? AND started_at < ?`, 
                [utcMidnight, utcNextMidnight], (err, row) => {
          stats.todayStudyTime = row && row.time ? row.time : 0;
          
          res.json(stats);
        });
      });
    });
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  // Check if setup is completed
  db.get('SELECT setup_completed FROM user_config WHERE id = 1', (err, row) => {
    if (err || !row || !row.setup_completed) {
      res.redirect('/setup');
    } else {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
  });
});

app.get('/setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'setup.html'));
});

app.get('/blocked', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blocked.html'));
});

app.get('/tasks', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

app.get('/tracker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tracker.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(` Exam Focus App running on http://localhost:${PORT}`);
  console.log(`📚 Stay focused and crush those exams!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

