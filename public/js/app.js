document.addEventListener('DOMContentLoaded', () => {
    const notesList = document.getElementById('notes-list');
    const noteContent = document.getElementById('note-content');
    const newNoteBtn = document.getElementById('new-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    
    let currentNoteId = null;
    let notes = {};
    
    // Tải tất cả notes từ server
    async function loadNotes() {
        try {
            const response = await fetch('/api/notes');
            notes = await response.json();
            renderNotesList();
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }
    
    // Hiển thị danh sách notes
    function renderNotesList() {
        notesList.innerHTML = '';
        
        Object.values(notes).forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.content.substring(0, 30) + (note.content.length > 30 ? '...' : '');
            li.dataset.id = note.id;
            
            if (note.id === currentNoteId) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => {
                currentNoteId = note.id;
                noteContent.value = note.content;
                renderNotesList();
            });
            
            notesList.appendChild(li);
        });
    }
    
    // Tạo note mới
    newNoteBtn.addEventListener('click', () => {
        currentNoteId = null;
        noteContent.value = '';
        renderNotesList();
    });
    
    // Lưu note
    saveNoteBtn.addEventListener('click', async () => {
        const content = noteContent.value.trim();
        
        if (!content) {
            alert('Note content cannot be empty');
            return;
        }
        
        try {
            let note;
            
            if (currentNoteId) {
                // Cập nhật note hiện có
                const response = await fetch(`/api/notes/${currentNoteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                });
                note = await response.json();
            } else {
                // Tạo note mới
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                });
                note = await response.json();
                currentNoteId = note.id;
            }
            
            // Cập nhật danh sách notes
            notes[currentNoteId] = note;
            renderNotesList();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    });
    
    // Xóa note
    deleteNoteBtn.addEventListener('click', async () => {
        if (!currentNoteId) {
            alert('No note selected to delete');
            return;
        }
        
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                const response = await fetch(`/api/notes/${currentNoteId}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    delete notes[currentNoteId];
                    currentNoteId = null;
                    noteContent.value = '';
                    renderNotesList();
                }
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    });
    
    // Tự động lưu khi người dùng ngừng gõ
    let saveTimeout;
    noteContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (currentNoteId && noteContent.value.trim()) {
                saveNoteBtn.click();
            }
        }, 1000);
    });
    
    // Khởi động ứng dụng
    loadNotes();
});
