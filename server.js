const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Lưu trữ ghi chú trong bộ nhớ
let notes = {};

// API: Lấy danh sách UUID ghi chú
app.get('/api/notes', (req, res) => {
    res.json(Object.keys(notes));
});

// API: Tạo ghi chú mới
app.post('/api/notes', (req, res) => {
    const { content, encoding } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const id = uuidv4();
    notes[id] = {
        content,
        encoding: encoding || 'utf-8',
        createdAt: new Date().toLocaleString('vi-VN'),
        updatedAt: new Date().toLocaleString('vi-VN')
    };
    res.json({ id, url: `/raw/${id}` });
});

// API: Lấy nội dung ghi chú
app.get('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    if (!notes[id]) return res.status(404).json({ error: 'Note not found' });
    res.json(notes[id]);
});

// API: Cập nhật ghi chú
app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { content, encoding } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    if (!notes[id]) return res.status(404).json({ error: 'Note not found' });

    notes[id].content = content;
    notes[id].encoding = encoding || notes[id].encoding;
    notes[id].updatedAt = new Date().toLocaleString('vi-VN');
    res.json(notes[id]);
});

// API: Xóa ghi chú
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    if (!notes[id]) return res.status(404).json({ error: 'Note not found' });
    delete notes[id];
    res.json({ message: 'Note deleted' });
});

// Route: Hiển thị nội dung raw
app.get('/raw/:id', (req, res) => {
    const { id } = req.params;
    if (!notes[id]) return res.status(404).send('Note not found');
    res.set('Content-Type', 'text/plain; charset=' + notes[id].encoding);
    res.send(notes[id].content);
});

// Route: Hiển thị giao diện chỉnh sửa
app.get('/edit/:id', (req, res) => {
    res.sendFile(__dirname + '/public/edit.html');
});

// Route: Hiển thị giao diện chính
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
