import { useState, useEffect } from 'react';
import { Plus, Trash, Save, Edit, X } from 'lucide-react';
import './App.css';
import axios from 'axios';

// Improved API URL handling
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Note colors for styling
const NOTE_COLORS = [
    "bg-yellow-100",
    "bg-emerald-100",
    "bg-rose-100"
];

// Main Notes App Component
export default function NotesApp() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');

    // Test API connection first
    useEffect(() => {
        const testConnection = async () => {
            try {
                const testEndpoint = `${API_URL}api/test`;
                console.log("Testing API connection at:", testEndpoint);
                await axios.get(testEndpoint, { timeout: 5000 });
                setConnectionStatus('connected');
                console.log("API connection successful");
            } catch (err) {
                console.error("API connection test failed:", err);
                setConnectionStatus('failed');
                setError(`Connection failed: ${err.message}. Check if the server is running and CORS is configured correctly.`);
            }
        };

        testConnection();
    }, []);

    // Fetch notes from MongoDB only if connection is established
    useEffect(() => {
        const fetchNotes = async () => {
            if (connectionStatus !== 'connected') return;

            try {
                setIsLoading(true);
                const endpoint = `${API_URL}api/notes`;
                console.log("Fetching notes from:", endpoint);
                const response = await axios.get(endpoint);
                console.log("Notes fetched:", response.data);
                setNotes(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching notes:", err);
                setError(`Failed to fetch notes: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [connectionStatus]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) return;

        try {
            if (editingId) {
                // Update existing note
                const response = await axios.put(`${API_URL}api/notes/${editingId}`, {
                    title,
                    content
                });

                const updatedNote = response.data;
                setNotes(notes.map(note =>
                    note._id === editingId ? updatedNote : note
                ));
                setEditingId(null);
            } else {
                // Create new note
                const response = await axios.post(`${API_URL}api/notes`, {
                    title,
                    content
                });
                const newNote = response.data;
                setNotes([newNote, ...notes]);
            }

            setTitle('');
            setContent('');
            setError(null);
        } catch (err) {
            console.error("Error saving note:", err);
            setError(`Failed to save note: ${err.message}`);
        }
    };

    // Start editing a note
    const handleEdit = (note) => {
        setEditingId(note._id);
        setTitle(note.title);
        setContent(note.content);

        // Scroll to form
        document.getElementById('note-form').scrollIntoView({ behavior: 'smooth' });
    };

    // Delete a note
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}api/notes/${id}`);
            const updatedNotes = notes.filter(note => note._id !== id);
            setNotes(updatedNotes);
            setError(null);
        } catch (err) {
            console.error("Error deleting note:", err);
            setError(`Failed to delete note: ${err.message}`);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render connection status
    if (connectionStatus === 'checking') {
        return <div className="flex items-center justify-center h-screen">Connecting to server...</div>;
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading notes...</div>;
    }

    return (
        <div className="min-h-screen bg-wavy text-gray-900">
            <header className="text-amber-500 p-4">
                <div className="container mx-auto flex flex-col items-center justify-center">
                    <img
                        src="/logo.png" // Change this path to your logo file or use a URL
                        alt="MomentScape Logo"
                        className="h-12 w-12 mb-2"
                    />
                    <h1 className="text-2xl font-bold">
                        <span className="inline-block">MomentScape</span>
                    </h1>
                </div>
            </header>

            {error && (
                <div className="container mx-auto mb-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold mr-1">Error:</strong>
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4"
                            onClick={() => setError(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-4">
                {/* Note Form */}
                <form
                    id="note-form"
                    onSubmit={handleSubmit}
                    className="relative mb-8"
                >
                    {/* Main form box */}
                    <div className="bg-slate-100 bg-opacity-30 backdrop-blur-md backdrop-contrast-100 text-blue-100 rounded-md p-6 relative z-10">
                        <h2 className="text-3xl font-bold mb-4">
                            {editingId ? 'Edit Note' : 'Hi, Parth Nilamkumar Patil'}
                        </h2>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-lg text-blue-200 mb-2">Whats on your mind today?</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-800"
                                placeholder="start typing..."
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="content" className="block text-lg text-blue-100 mb-2">Elaborate</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-3 py-2 border bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 h-32 placeholder-neutral-800"
                                placeholder="...its your space."
                                required
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center"
                            >
                                <Save size={18} className="mr-1" />
                                {editingId ? 'Update Note' : 'Save Note'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-blue-100 text-black px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
                                ><X size={18} className="mr-1" />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Notes Grid */}
                {notes.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-500">
                            {'No notes yet. Create your first note!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notes.map((note, idx) => (
                            <div
                                key={note._id}
                                className={`${NOTE_COLORS[idx % NOTE_COLORS.length]} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
                            >
                                <h3 className="text-xl font-bold mb-2 text-blue-600">{note.title}</h3>
                                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{note.content}</p>
                                <div className="text-xs text-gray-500 mb-4">
                                    {formatDate(note.createdAt)}
                                    {note.updatedAt && ` (Updated: ${formatDate(note.updatedAt)})`}
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEdit(note)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                        aria-label="Edit note"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note._id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        aria-label="Delete note"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Action Button for Mobile */}
                <button
                    onClick={() => {
                        if (!editingId) {
                            document.getElementById('note-form').scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden hover:bg-blue-700 flex items-center justify-center"
                    aria-label="Add new note"
                >
                    <Plus size={24} />
                </button>
            </main>

            <footer className="bg-neutral-800 text-white text-center p-4 mt-8">
                <p>For you. By you. Gift from you</p>
            </footer>
        </div>
    );
}