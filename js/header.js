document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const headerNav = document.getElementById("header-nav");

  if (headerNav) {
    if (token) {
      // User is logged in
      headerNav.innerHTML = `
        <a href="profile.html">Profile</a>
        <a href="created-rooms.html">Created Rooms</a>
        <a href="#" id="logout-link">Logout</a>
      `;
    } else {
      // User is logged out
      headerNav.innerHTML = `
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      `;
    }

    // Add logout functionality
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token"); // Remove the token
        window.location.href = "index.html"; // Redirect to the main page
      });
    }
  }
});
