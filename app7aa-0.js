const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS and images from the publics folder
app.use(express.static(path.join(__dirname, 'publics')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'college'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
        return;
    }

    console.log('Connected to MySQL database!');
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'publics', 'index.html'));
});

// 1. Get all events
app.get('/events', (req, res) => {
    const sql = 'SELECT * FROM events ORDER BY event_id';

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to retrieve events'
            });
        }

        res.json(results);
    });
});

// 2. Get one event by ID
app.get('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = 'SELECT * FROM events WHERE event_id = ?';

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to retrieve event'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        res.json(results[0]);
    });
});

// 3. Insert a new event
app.post('/events', (req, res) => {
    const { event_name, event_date, venue, description } = req.body;

    if (!event_name || !event_date || !venue) {
        return res.status(400).json({
            message: 'Event name, date and venue are required'
        });
    }

    const sql = `
        INSERT INTO events (event_name, event_date, venue, description)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [event_name, event_date, venue, description || null],
        (err, result) => {
            
if (err) {
    console.error('MYSQL INSERT ERROR:', err);
    return res.status(500).json({
        message: 'Failed to insert event',
        error: err.message
    });
}

            res.status(201).json({
                message: 'Event added successfully',
                event_id: result.insertId
            });
        }
    );
});

// 4. Update an existing event
app.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { event_name, event_date, venue, description } = req.body;

    if (!event_name || !event_date || !venue) {
        return res.status(400).json({
            message: 'Event name, date and venue are required'
        });
    }

    const sql = `
        UPDATE events
        SET event_name = ?, event_date = ?, venue = ?, description = ?
        WHERE event_id = ?
    `;

    db.query(
        sql,
        [event_name, event_date, venue, description || null, eventId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Failed to update event'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Event not found'
                });
            }

            res.json({
                message: 'Event updated successfully'
            });
        }
    );
});

// 5. Delete an event
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = 'DELETE FROM events WHERE event_id = ?';

    db.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to delete event'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        res.json({
            message: 'Event deleted successfully'
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});