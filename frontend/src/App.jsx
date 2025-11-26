import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetail from "./pages/PostDetail";
import Post from "./pages/Post"
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn, logout } from "./api/auth";
import { WebSocketProvider } from "./context/WebSocketContext";

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <nav className="glass sticky top-0 z-50 shadow-lg border-b border-white/5">
          <div className="container mx-auto flex items-center justify-between p-4">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hover:opacity-80 transition-opacity">
              Comment System
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
                Home
              </Link>
              {!isLoggedIn() ? (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg shadow-primary/20">
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="text-slate-300 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="bg-background min-h-screen pt-8">
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
    </WebSocketProvider>
  );
}

export default App;