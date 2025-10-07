import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { isLoggedIn } from "../api/auth";
import  {fetchPosts, deletePost} from "../api/api";
const API_URL = "http://localhost:8000";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts()
      .then((res)=> setPosts(res.data))
      .catch((err)=> console.error("Failed to fetch posts:",err));  
    },[]);

  // delete post handler
  const handleDeletePost = (id) => {
    if(!window.confirm("Are you sure you want to delete this post")) {
      return;
    }
    deletePost(id)
      .then(()=> {
        setPosts(posts.filter((post) => post.id !== id));
      })
      .catch((err) => {
        // The interceptor handles auth, so this error is likely a server or network issue
        console.error("Error deleting post:",err);
      });
  }
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">All Posts</h1>

      {isLoggedIn() && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/create-post")}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            + Create Post
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">No posts yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <div>
              <Link to={`/posts/${post.id}`} className="block">
                <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-2 hover:underline transition-colors duration-300">{post.title}</h3>
              </Link>
              <p className="text-gray-600 leading-relaxed text-base">{post.content.slice(0, 100)}...</p>
              </div>

            <div className="mt-auto text-right">
              <button onClick={()=> handleDeletePost(post.id)}
                className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm">
                  Delete
                </button>
            </div>
            </li>

          ))}
        </ul>
      )}
    </div>
  );
}