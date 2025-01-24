document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const createdRoomsList = document.getElementById("created-rooms-list");

  try {
    // Fetch created rooms
    const response = await fetch(
      "https://localhost:7152/api/User/Rooms/Created",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const rooms = await response.json();
      if (rooms.length > 0) {
        rooms.forEach((room) => {
          const roomItem = document.createElement("div");
          roomItem.className = "room-item";
          roomItem.innerHTML = `
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <p><strong>Players Joined:</strong> ${room.playerIds.length}/${room.maxPlayers}</p>
          `;

          // Make the room item clickable
          roomItem.style.cursor = "pointer";
          roomItem.addEventListener("click", () => {
            // Redirect to room.html with the room ID as a query parameter
            window.location.href = `room.html?id=${room.id}`;
          });

          createdRoomsList.appendChild(roomItem);
        });
      } else {
        createdRoomsList.innerHTML = "<p>No rooms created yet.</p>";
      }
    } else {
      const errorData = await response.json();
      
    }
  } catch (error) {
    console.error("Error fetching created rooms:", error);
   
  }
});
