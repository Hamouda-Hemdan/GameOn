document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    // Send POST request to the login API
    const response = await fetch("https://localhost:7152/api/User/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Handle the response
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token); // Save the token
      localStorage.setItem("userId", data.userId); // Save the user ID
      window.location.href = "index.html"; // Redirect to the main page
    } else {
      const errorData = await response.json();
      // Show error message on the login page without redirecting
      const errorMessage = document.createElement("p");
      errorMessage.textContent = `Login failed: ${
        errorData.message || "Invalid credentials"
      }`;
      errorMessage.style.color = "red";
      document.getElementById("login-form").appendChild(errorMessage);
    }
  } catch (error) {
    console.error("Error during login:", error);
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "An error occurred. Please try again.";
    errorMessage.style.color = "red";
    document.getElementById("login-form").appendChild(errorMessage);
  }
});
