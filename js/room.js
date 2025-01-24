document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const roomId = new URLSearchParams(window.location.search).get("id"); // Get room ID from URL
  const roomDetails = document.getElementById("room-details");
  const joinRoomButton = document.getElementById("join-room-button");
  const leaveRoomButton = document.getElementById("leave-room-button");
  const deleteRoomButton = document.getElementById("delete-room-button");
  const openChatButton = document.getElementById("open-chat-button");

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

  // Function to remove a room from the user's joined rooms
  const removeJoinedRoom = (roomId) => {
    const joinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
    const updatedRooms = joinedRooms.filter((id) => id !== roomId);
    localStorage.setItem("joinedRooms", JSON.stringify(updatedRooms));
  };

  try {
    // Fetch room details
    const roomResponse = await fetch(
      `https://localhost:7152/api/Room/${roomId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!roomResponse.ok) {
      throw new Error(
        `Failed to fetch room details: ${roomResponse.statusText}`
      );
    }

    const room = await roomResponse.json();

    // Fetch stadium details
    let stadium = null;
    if (room.stadiumId && room.stadiumId > 0) {
      const stadiumResponse = await fetch(
        `https://localhost:7152/api/Stadium/${room.stadiumId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!stadiumResponse.ok) {
        console.error(
          `Failed to fetch stadium details: ${stadiumResponse.statusText}`
        );
      } else {
        stadium = await stadiumResponse.json();
      }
    }

    // Fetch sport details
    let sport = null;
    if (room.sportId && room.sportId > 0) {
      const sportResponse = await fetch(
        `https://localhost:7152/api/Sport/${room.sportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!sportResponse.ok) {
        console.error(
          `Failed to fetch sport details: ${sportResponse.statusText}`
        );
      } else {
        sport = await sportResponse.json();
      }
    }

    // Display room, stadium, and sport details
    roomDetails.innerHTML = `
      <h3>${room.name}</h3>
      <p>${room.description}</p>
      <p><strong>City:</strong> ${room.city}</p>
      <p><strong>Max Players:</strong> ${room.maxPlayers}</p>
      <p><strong>Event Start:</strong> ${new Date(
        room.eventStart
      ).toLocaleString()}</p>
      <h4>Stadium Details</h4>
      ${
        stadium
          ? `
            <p><strong>Stadium Name:</strong> ${stadium.name}</p>
            <p><strong>Location:</strong> ${stadium.location}</p>
            <p><strong>Price:</strong> $${stadium.price}</p>
            <p><strong>Description:</strong> ${stadium.description}</p>
          `
          : "<p>No stadium details available.</p>"
      }
      <h4>Sport Details</h4>
      ${
        sport
          ? `
            <p><strong>Sport Name:</strong> ${sport.name}</p>
            <p><strong>Description:</strong> ${sport.description}</p>
          `
          : "<p>No sport details available.</p>"
      }
      <p><strong>Host:</strong> ${room.hostUserName}</p>
    `;

    // Set the chat link for the specific room
    openChatButton.href = `room-chat.html?roomId=${room.id}`;

    // Show "Join Room" or "Leave Room" button based on whether the user has joined the room
    if (hasUserJoinedRoom(roomId)) {
      leaveRoomButton.classList.remove("hidden");
    } else {
      joinRoomButton.classList.remove("hidden");
    }

    // Show "Delete Room" button if the current user is the host
    const currentUserId = localStorage.getItem("userId"); // Ensure this is set correctly
    if (room.hostUserId === currentUserId) {
      deleteRoomButton.classList.remove("hidden");
    }
  } catch (error) {
    alert("An error occurred. Please try again.");
  }

  // Handle "Join Room" button click
  joinRoomButton.addEventListener("click", async () => {
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
        alert("Successfully joined the room!");
        addJoinedRoom(roomId); // Add the room to the user's joined rooms
        window.location.reload(); // Refresh the page to update the UI
      } else {
        const errorData = await response.json();
        alert(`Failed to join room: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred. Please try again.");
    }
  });

  // Handle "Leave Room" button click
  leaveRoomButton.addEventListener("click", async () => {
    try {
      const response = await fetch(
        `https://localhost:7152/api/Room/Leave/${roomId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Successfully left the room!");
        removeJoinedRoom(roomId); // Remove the room from the user's joined rooms
        window.location.reload(); // Refresh the page to update the UI
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Handle "Delete Room" button click
  deleteRoomButton.addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://localhost:7152/api/Room/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Room deleted successfully!");
        window.location.href = "index.html";
      } else {
        const errorData = await response.json();
        alert(`Failed to delete room: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  });
});
