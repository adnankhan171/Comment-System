// src/components/CommentActions.jsx
import React, { useState } from 'react';

function CommentActions({comment, onEdit, onDelete}) {
    const [menuOpen, setMenuOpen] = useState(false)

    const handleEdit = () => {
        setMenuOpen(false);
        onEdit(comment.id);

    };

    const handleDelete = () => {
        setMenuOpen(false);
        onDelete(comment.id);
    };

    return (
        <div className='relative'>
            <button 
                onClick={()=>setMenuOpen(!menuOpen)}
                className='text-gray-500 hover:text-grey-700 focus:outline-none'>
                    {/* A simple three-dots SVG or character */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 100-4 2 2 0 000 4zM10 12a2 2 0 100-4 2 2 0 000 4zM10 18a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                </button>
                {menuOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
                        <button
                            onClick={handleEdit}
                            className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            >
                            Edit
                        </button>

                       <button
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                            Delete
                    </button>
                    </div>
                )}
             </div>
    )
}
export default CommentActions;