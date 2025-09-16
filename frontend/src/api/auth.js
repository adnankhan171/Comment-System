export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

// Save token after login
export function saveToken(token) {
  localStorage.setItem("token", token);
}

// Get token for API requests
export function getToken() {
  return localStorage.getItem("token");
}
