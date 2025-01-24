document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // Redirect to login if not authenticated
  if (!token) {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  // Fetch and display profile data
  const profileResponse = await fetch(
    "https://localhost:7152/api/User/Profile",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (profileResponse.ok) {
    const profileData = await profileResponse.json();

    // Display profile data
    document.getElementById("profile-name-display").textContent =
      profileData.name || "Not provided";
    document.getElementById("profile-email-display").textContent =
      profileData.email;
    document.getElementById("profile-phone-display").textContent =
      profileData.phoneNumber || "Not provided";

    // Display profile photo
    const profilePhoto = document.getElementById("profile-photo");
    if (profileData.profilePictureUrl) {
      profilePhoto.src = profileData.profilePictureUrl;
    } else {
      profilePhoto.src = "../assets/default-profile.png";
    }
  } else {
    alert("Failed to fetch profile data.");
  }

  // Toggle update form visibility
  const toggleUpdateFormButton = document.getElementById("toggle-update-form");
  const profileForm = document.getElementById("profile-form");

  toggleUpdateFormButton.addEventListener("click", () => {
    profileForm.classList.toggle("hidden");
  });

  // Update profile
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("profile-name").value;
    const phoneNumber = document.getElementById("profile-phone").value;

    const response = await fetch("https://localhost:7152/api/User/Profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phoneNumber }),
    });

    if (response.ok) {
      alert("Profile updated successfully!");
      window.location.reload(); // Refresh the page to show updated data
    } else {
      alert("Failed to update profile.");
    }
  });

  // Upload profile picture
  document
    .getElementById("upload-profile-picture-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("profile-picture");
      const file = fileInput.files[0];

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://localhost:7152/api/User/UploadProfilePicture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert("Profile picture uploaded successfully!");
        window.location.reload(); // Refresh the page to show the new photo
      } else {
        alert("Failed to upload profile picture.");
      }
    });
});
