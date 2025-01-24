document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const name = document.getElementById("register-name").value;
    const phoneNumber = document.getElementById("register-phone").value;
    const photoFile = document.getElementById("register-photo").files[0];

    try {
      // Step 1: Register the user
      const registerResponse = await fetch(
        "https://localhost:7152/api/User/Register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name, phoneNumber }),
        }
      );

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        localStorage.setItem("token", registerData.token); // Save the token
        localStorage.setItem("userId", registerData.userId); // Save the user ID

        // Step 2: Upload the profile photo (if provided)
        if (photoFile) {
          const formData = new FormData();
          formData.append("file", photoFile);

          const uploadResponse = await fetch(
            "https://localhost:7152/api/User/UploadProfilePicture",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${registerData.token}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(
              `Profile photo upload failed: ${
                errorData.message || "Unknown error"
              }`
            );
          }
        }

        // If both steps succeed
        alert("Registration and profile photo upload successful!");
        window.location.href = "profile.html"; // Redirect to profile page
      } else {
        const errorData = await registerResponse.json();
        throw new Error(
          `Registration failed: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.message || "An error occurred. Please try again.");
    }
  });
