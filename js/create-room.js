// create-room.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const sportIdDropdown = document.getElementById("sportId");
  const stadiumIdDropdown = document.getElementById("stadiumId");

  // Fetch and populate sports dropdown
  const fetchSports = async () => {
    try {
      const response = await fetch("https://localhost:7152/api/Sport", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sports = await response.json();
        sports.forEach((sport) => {
          const option = document.createElement("option");
          option.value = sport.id;
          option.textContent = sport.name; // Show only the sport name
          sportIdDropdown.appendChild(option);
        });
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch sports:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  };

  // Fetch and populate stadiums dropdown
  const fetchStadiums = async () => {
    try {
      const response = await fetch("https://localhost:7152/api/Stadium/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const stadiums = await response.json();
        stadiums.forEach((stadium) => {
          const option = document.createElement("option");
          option.value = stadium.id;
          option.textContent = `${stadium.name} (${stadium.city}) - ${stadium.price}RUB per hour`;
          stadiumIdDropdown.appendChild(option);
        });
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch stadiums:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching stadiums:", error);
    }
  };

  // Fetch sports and stadiums on page load
  fetchSports();
  fetchStadiums();

  // Handle form submission
  document
    .getElementById("create-room-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const roomData = {
        name: document.getElementById("room-name").value,
        description: document.getElementById("room-description").value,
        maxPlayers: parseInt(document.getElementById("max-players").value),
        eventStart: document.getElementById("event-start").value,
        sportId: parseInt(document.getElementById("sportId").value),
        stadiumId: parseInt(document.getElementById("stadiumId").value),
        city: document.getElementById("city").value,
      };

      try {
        const response = await fetch("https://localhost:7152/api/Room/Create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roomData),
        });

        if (response.ok) {
          alert("Room created successfully!");
          window.location.href = "index.html"; // Redirect to the main page
        } else {
          const errorData = await response.json();
          alert(
            `Failed to create room: ${errorData.message || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error creating room:", error);
        alert("An error occurred. Please try again.");
      }
    });
});
