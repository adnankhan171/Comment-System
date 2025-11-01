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
import CommentActions from "../components/CommentActions";

function Comment({ comment, onReply, onLike, onDelete, onEdit }) {
  // Check if the comment is deleted and render accordingly
  if (comment.deleted) {
    return (
      <div className={`bg-gray-200 rounded-lg p-4 mb-4 ${comment.parent_id ? "ml-6 md:ml-10" : ""}`}>
        <p className="italic text-gray-500">[This comment has been deleted]</p>
        {comment.children &&
          comment.children.map((child) => (
            <Comment
              key={child.id}
              comment={child}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete} 
              onEdit={onEdit}
            />
          ))}
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 mb-4 ${comment.parent_id ? "ml-6 md:ml-10" : ""}`}>
      <div className="flex justify-between items-center mb-2">
        <div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            <p className="text-gray-500 text-sm mt-1">
                — by {comment.username}
                <span className="font-bold ml-4">Likes: {comment.likes_count}</span>
            </p>
        </div>
        {isLoggedIn() && ( // Conditionally render actions
            <CommentActions comment={comment} onDelete={onDelete} onEdit={onEdit} />
        )}
      </div>
      {/* --- FIXED: Pass the entire comment object to onReply --- */}
      <button
        onClick={() => onReply(comment)}
        className="text-blue-600 font-semibold text-sm px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors duration-200 mr-2"
      >
        Reply
      </button>
      <button
        onClick={() => onLike(comment.id)}
        className="text-blue-600 font-semibold text-sm px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
      >
        Like
      </button>
      {comment.children &&
        comment.children.map((child) => (
          <Comment
            key={child.id}
            comment={child}
            onReply={onReply}
            onLike={onLike}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
    </div>
  );
}


function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // replyTo will now hold the full comment object or null
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchPost(id).then((res) => setPost(res.data));
    fetchComments(id).then((res) => setComments(res.data));
  }, [id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    // --- FIXED: Pass the comment ID (replyTo.id) instead of the object/username ---
    const parentId = replyTo ? replyTo.id : null;
    await createComment(id, newComment, parentId);
    setNewComment("");
    setReplyTo(null);
    const res = await fetchComments(id);
    setComments(res.data);
  }

  async function handleLike(commentId) {
    await toggleLike(commentId);
    const res = await fetchComments(id);
    setComments(res.data);
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
    }
    try {
      await deleteComment(commentId);
      const res = await fetchComments(id);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  }

  async function handleEdit(commentId) {
    console.log(`Edit functionality triggered for comment ID: ${commentId}`);
    const newContent = prompt("Enter new comment content:");
    if (newContent) {
      try {
        await updateComment(commentId, newContent);
        const res = await fetchComments(id);
        setComments(res.data);
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {post && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{post.content}</p>
        </div>
      )}
      {isLoggedIn() && (
        <form onSubmit={handleCommentSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <textarea
            // --- FIXED: Use replyTo.username for the placeholder text ---
            placeholder={replyTo ? `Replying to ${replyTo.username}` : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 mb-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            rows="4"
          />
          <div className="flex items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </button>
            {/* --- ADDED: A cancel button for better UX --- */}
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-4 text-gray-600 hover:text-gray-800 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>
      <div className="space-y-4">
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

