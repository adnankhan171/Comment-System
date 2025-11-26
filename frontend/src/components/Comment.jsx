import React, { useState } from 'react';
import CommentActions from './CommentActions';
import { isLoggedIn } from '../api/auth';

function Comment({ comment, onReply, onLike, onDelete, onEdit, depth = 0 }) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Deleted comment state
    if (comment.deleted) {
        return (
            <div className={`mb-4 ${depth > 0 ? "ml-4 md:ml-8" : ""}`}>
                <div className="p-4 rounded-lg bg-surface/30 border border-white/5 text-secondary italic text-sm">
                    [This comment has been deleted]
                </div>
                {comment.children && comment.children.length > 0 && (
                    <div className="border-l-2 border-white/10 ml-4 pl-4 mt-2">
                        {comment.children.map((child) => (
                            <Comment
                                key={child.id}
                                comment={child}
                                onReply={onReply}
                                onLike={onLike}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`mb-4 transition-all duration-300 ease-in-out ${depth > 0 ? "ml-4 md:ml-8" : ""}`}>
            <div className="glass glass-hover rounded-xl p-5 relative group">
                {/* Header: Author & Time */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {comment.username[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-200">{comment.username}</p>
                            <p className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {isLoggedIn() && (
                        <CommentActions comment={comment} onDelete={onDelete} onEdit={onEdit} />
                    )}
                </div>

                {/* Content */}
                <div
                    className="text-slate-300 text-sm leading-relaxed mb-4 pl-11 prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                />

                {/* Actions Footer */}
                <div className="flex items-center gap-4 pl-11">
                    <button
                        onClick={() => onLike(comment.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {comment.likes_count} Likes
                    </button>

                    <button
                        onClick={() => onReply(comment)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-accent transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reply
                    </button>
                </div>
            </div>

            {/* Nested Comments */}
            {comment.children && comment.children.length > 0 && (
                <div className="border-l-2 border-white/5 ml-4 pl-4 mt-3">
                    {/* Collapse/Expand Toggle could go here */}
                    {comment.children.map((child) => (
                        <Comment
                            key={child.id}
                            comment={child}
                            onReply={onReply}
                            onLike={onLike}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Comment;
