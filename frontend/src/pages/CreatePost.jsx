import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../api/auth";
import PostForm from "../components/PostForm";

const API_URL = "http://localhost:8000";

export default function CreatePost() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async ({ title, content }) => {
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("You must be logged in to create a post.");
        return;
      }

      await axios.post(
        `${API_URL}/posts/`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/posts");
    } catch (err) {
      console.error(err);
      setError("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Create a New Post
        </h1>
        {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
        <PostForm onSubmit={handleCreate} submitLabel="Create Post" />
      </div>
    </div>
  );
}