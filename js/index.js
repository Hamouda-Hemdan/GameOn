document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const roomList = document.getElementById("room-list");
  const createRoomButton = document.getElementById("create-room-button");
  const filterForm = document.getElementById("filter-form");
  const sportIdDropdown = document.getElementById("sportId");

  // Check if the user is logged in
  const isLoggedIn = !!token;

  // Function to check if the user has joined a room
  const hasUserJoinedRoom = (roomId) => {
    const joinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
    return joinedRooms.includes(roomId);
  };

  // Function to add a room to the user's joined rooms
  const addJoinedRoom = (roomId) => {
    const joinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
    if (!joinedRooms.includes(roomId)) {
      joinedRooms.push(roomId);
      localStorage.setItem("joinedRooms", JSON.stringify(joinedRooms));
    }
  };

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
          option.textContent = sport.name;
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

  // Fetch sports on page load
  fetchSports();

  // Redirect to Create Room page (only for logged-in users)
  if (isLoggedIn) {
    createRoomButton.addEventListener("click", () => {
      window.location.href = "create-room.html";
    });
  } else {
    createRoomButton.style.display = "none"; // Hide the "Create Room" button
  }

  // Fetch rooms with filters
  const fetchRooms = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `https://localhost:7152/api/Room/all?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const rooms = await response.json();
        roomList.innerHTML = ""; // Clear existing rooms

        if (rooms.length > 0) {
          rooms.forEach((room) => {
            const roomCard = document.createElement("div");
            roomCard.className = "room-card";

            // Calculate price per person
            const pricePerPerson = (
              room.stadium.price / room.maxPlayers
            ).toFixed(2);

            roomCard.innerHTML = `
              <h3>${room.name}</h3>
              <p>${room.description}</p>
              <p><strong>City:</strong> ${room.city}</p>
              <p><strong>Sport:</strong> ${room.sport.name}</p>
              <p><strong>Price per Person:</strong> ${pricePerPerson} RUB</p>
              <p><strong>Stadium:</strong> ${room.stadium.name} </p>
            <p><strong>Location:</strong> ${room.stadium.location}</p>
              <p><strong>Max Players:</strong> ${room.maxPlayers}</p>
              <p><strong>Event Start:</strong> ${new Date(
                room.eventStart
              ).toLocaleString()}</p>
              <p class="players-joined"><strong>Players Joined:</strong> <span>${
                room.playerIds.length
              }</span>/${room.maxPlayers}</p>
              <p><strong>Host:</strong> ${room.hostUserName}</p>
              ${
                isLoggedIn
                  ? `<div class="room-buttons">
                      ${
                        hasUserJoinedRoom(room.id)
                          ? '<p class="room-joined">Room Joined</p>'
                          : `<button class="join-room-button" onclick="joinRoom(${room.id})" style="
                                padding: 14px 20px;
                                background: linear-gradient(135deg, #4a90e2, #357abd);
                                color: #fff;
                                border: none;
                                border-radius: 10px;
                                font-size: 16px;
                                font-weight: 500;
                                cursor: pointer;
                                box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
                                transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                margin-right: 10px; /* Add spacing between buttons */
                              ">
                              <i class="fas fa-user-plus"></i> Join Room
                            </button>`
                      }
                      <a href="room.html?id=${
                        room.id
                      }" class="button-primary" style="
                            padding: 14px 20px;
                            background: linear-gradient(135deg, #6c5ce7, #4a4e69);
                            color: #fff;
                            border: none;
                            border-radius: 10px;
                            font-size: 16px;
                            font-weight: 500;
                            cursor: pointer;
                            box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
                            transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            text-decoration: none; /* Remove underline from link */
                          ">
                        <i class="fas fa-info-circle"></i> View Details
                      </a>
                    </div>`
                  : ""
              }
            `;
            roomList.appendChild(roomCard);
          });
        } else {
          roomList.innerHTML = "<p>No rooms available.</p>";
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to fetch rooms: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Initial fetch without filters
  fetchRooms();

  // Apply filters when the form is submitted
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const filters = {
      city: document.getElementById("city").value,
      sportId: document.getElementById("sportId").value,
    };

    fetchRooms(filters);
  });
});

// Function to join a room (only for logged-in users)
async function joinRoom(roomId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to join a room.");
    return;
  }

  try {
    const response = await fetch(
      `https://localhost:7152/api/Room/Join/${roomId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      window.location.reload();
      alert("Successfully joined the room!");
      addJoinedRoom(roomId);
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Failed to join room: ${errorData.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error joining room:", error);
  }
}
