import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPost, fetchComments, createComment, toggleLike } from "../api/api";
import { isLoggedIn } from "../api/auth";

function Comment({ comment, onReply, onLike }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 mb-4 ${comment.parent_id ? "ml-6 md:ml-10" : ""}`}>
      <p className="text-gray-700 leading-relaxed mb-2">
        {comment.content} — Likes: <span className="font-bold">{comment.likes_count}</span>
      </p>
      <button
        onClick={() => onReply(comment.id)}
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
          <Comment key={child.id} comment={child} onReply={onReply} onLike={onLike} />
        ))}
    </div>
  );
}

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchPost(id).then((res) => setPost(res.data));
    fetchComments(id).then((res) => setComments(res.data));
  }, [id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    await createComment(id, newComment, replyTo);
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
            placeholder={replyTo ? `Replying to ${replyTo}` : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 mb-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            rows="4"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Submit
          </button>
        </form>
      )}

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>
      <div className="space-y-4">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} onReply={setReplyTo} onLike={handleLike} />
        ))}
      </div>
    </div>
  );
}

export default PostDetail;