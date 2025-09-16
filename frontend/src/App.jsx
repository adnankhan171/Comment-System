import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetail from "./pages/PostDetail";
import Post from "./pages/Post"
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn, logout } from "./api/auth";

function App() {
  return (
    <Router>
      <nav className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-white text-2xl font-bold">
            Comment System
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:underline transition-colors duration-200">
              Home
            </Link>
            {!isLoggedIn() ? (
              <>
                <Link to="/login" className="text-white hover:underline transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="text-white hover:underline transition-colors duration-200">
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="bg-transparent border border-white text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* All posts */}
          <Route path="/posts" element={<Post />} />
          {/* Protect PostDetail so comments/likes require login */}
          {/* Single post detail */}
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;