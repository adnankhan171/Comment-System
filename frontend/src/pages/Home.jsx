import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { isLoggedIn } from "../api/auth";

const API_URL = "http://localhost:8000";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/posts`)
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">All Posts</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">No posts yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <li key={post.id} className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <Link to={`/posts/${post.id}`} className="block">
                <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-2 hover:underline transition-colors duration-300">{post.title}</h3>
              </Link>
              <p className="text-gray-600 leading-relaxed text-base">{post.content.slice(0, 100)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}