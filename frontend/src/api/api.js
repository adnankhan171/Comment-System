import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // FastAPI backend

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (username, password) =>
  api.post("/auth/login", { username, password });

export const registerUser = (username, email, password) =>
  api.post("/auth/register", { username, email, password });

// Posts
export const fetchPosts = () => api.get("/posts/");
export const fetchPost = (id) => api.get(`/posts/${id}`);
export const createPost = (title, content) =>
  api.post("/posts/", { title, content });

// Comments
export const fetchComments = (postId) =>
  api.get(`/posts/${postId}/comments`);
export const createComment = (postId, content, parentId = null) =>
  api.post(`/posts/${postId}/comments`, { content, parent_id: parentId });
export const toggleLike = (commentId) =>
  api.post(`/comments/${commentId}/like`);
