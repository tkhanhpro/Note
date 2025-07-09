const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File để lưu notes
const NOTES_FILE = 'notes.json';

// Khởi tạo file notes nếu chưa tồn tại
if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, '{}');
}

// Lấy tất cả notes
app.get('/api/notes', (req, res) => {
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
    res.json(notes);
});

// Tạo note mới
app.post('/api/notes', (req, res) => {
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
    const id = uuidv4();
    const newNote = {
        id,
        content: req.body.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    notes[id] = newNote;
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    res.json(newNote);
});

// Cập nhật note
app.put('/api/notes/:id', (req, res) => {
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
    const id = req.params.id;
    
    if (notes[id]) {
        notes[id] = {
            ...notes[id],
            content: req.body.content || notes[id].content,
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
        res.json(notes[id]);
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

// Xóa note
app.delete('/api/notes/:id', (req, res) => {
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
    const id = req.params.id;
    
    if (notes[id]) {
        delete notes[id];
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

// Route cho trang chủ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
