import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchPost,
  fetchComments,
  createComment,
  toggleLike,
  deleteComment,
  updateComment
} from "../api/api";
import { isLoggedIn } from "../api/auth";
import Comment from "../components/Comment";

import RichTextEditor from "../components/RichTextEditor";
import { useWebSocket } from "../context/WebSocketContext";

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // replyTo will now hold the full comment object or null
  const [replyTo, setReplyTo] = useState(null);

  const { connect, disconnect, lastMessage } = useWebSocket();

  useEffect(() => {
    fetchPost(id).then((res) => setPost(res.data));
    fetchComments(id).then((res) => setComments(res.data));

    connect(id);
    return () => disconnect();
  }, [id]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "new_comment") {
      const comment = lastMessage.data;
      setComments(prev => {
        // Avoid duplicates (if we are the author and already refetched)
        if (findComment(prev, comment.id)) return prev;
        return addCommentToTree(prev, comment);
      });
    } else if (lastMessage.type === "update_comment") {
      const comment = lastMessage.data;
      setComments(prev => updateCommentInTree(prev, comment));
    }
  }, [lastMessage]);

  // Helper to find comment
  function findComment(comments, id) {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.children) {
        const found = findComment(comment.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper to add comment to tree recursively
  function addCommentToTree(comments, newComment) {
    if (!newComment.parent_id) {
      return [newComment, ...comments];
    }
    return comments.map(comment => {
      if (comment.id === newComment.parent_id) {
        // Check if already added to children to be safe
        const exists = comment.children?.some(c => c.id === newComment.id);
        if (exists) return comment;

        return {
          ...comment,
          children: [newComment, ...(comment.children || [])]
        };
      }
      if (comment.children) {
        return {
          ...comment,
          children: addCommentToTree(comment.children, newComment)
        };
      }
      return comment;
    });
  }

  // Helper to update comment in tree
  function updateCommentInTree(comments, updatedComment) {
    return comments.map(comment => {
      if (comment.id === updatedComment.id) {
        // Preserve children, update content/likes/deleted status
        return { ...comment, ...updatedComment, children: comment.children };
      }
      if (comment.children) {
        return {
          ...comment,
          children: updateCommentInTree(comment.children, updatedComment)
        };
      }
      return comment;
    });
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    const parentId = replyTo ? replyTo.id : null;

    // Optimistic Update
    const tempId = Date.now();
    const optimisticComment = {
      id: tempId,
      content: newComment,
      username: "You", // Placeholder until real data
      created_at: new Date().toISOString(),
      likes_count: 0,
      parent_id: parentId,
      children: []
    };

    setComments(prev => addCommentToTree(prev, optimisticComment));
    setNewComment("");
    setReplyTo(null);

    try {
      await createComment(id, newComment, parentId);
      // We rely on WebSocket for the real update now? 
      // Or we still refetch to be safe and replace the temp ID?
      // If we refetch, we get the real ID.
      // If we wait for WS, we also get the real ID.
      // Let's refetch to ensure consistent state quickly.
      const res = await fetchComments(id);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Revert optimistic update (simple refetch or filter out tempId)
      const res = await fetchComments(id);
      setComments(res.data);
      alert("Failed to post comment. Please try again.");
    }
  }

  async function handleLike(commentId) {
    await toggleLike(commentId);
    // No need to refetch if WS handles it? 
    // Backend toggleLike doesn't broadcast yet. 
    // But we can optimistically update or refetch.
    // Let's refetch for now.
    const res = await fetchComments(id);
    setComments(res.data);
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      await deleteComment(commentId);
      // WS will handle the update
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  }

  async function handleEdit(commentId) {
    const newContent = prompt("Enter new comment content:");
    if (newContent) {
      try {
        await updateComment(commentId, newContent);
        // WS will handle the update
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      {post && (
        <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{post.title}</h2>
          <p className="text-slate-300 leading-relaxed text-lg">{post.content}</p>
        </div>
      )}

      {isLoggedIn() && (
        <form onSubmit={handleCommentSubmit} className="glass rounded-xl p-6 mb-10 animate-slide-up">
          <div className="relative mb-4">
            <RichTextEditor
              placeholder={replyTo ? `Replying to ${replyTo.username}...` : "What are your thoughts?"}
              value={newComment}
              onChange={setNewComment}
            />
            {replyTo && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-xs bg-surface/80 hover:bg-surface text-slate-400 px-2 py-1 rounded-md transition-colors"
                >
                  Cancel Reply
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-2.5 px-8 rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Post Comment
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Discussion ({comments.length})</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((c) => (
          <Comment
            key={c.id}
            comment={c}
            onReply={setReplyTo}
            onLike={handleLike}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}

export default PostDetail;

