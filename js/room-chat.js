document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const roomId = new URLSearchParams(window.location.search).get("roomId"); // Get room ID from URL
  const chatMessagesContainer = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const emojiPickerButton = document.getElementById("emoji-picker-button");
  const backToRoomButton = document.getElementById("back-to-room-button");

  if (!roomId) {
    alert("Room ID is missing. Redirecting to the main page.");
    window.location.href = "index.html";
    return;
  }

  // Set the "Back to Room" link dynamically
  backToRoomButton.href = `room.html?id=${roomId}`;

  // Fetch the logged-in user's name
  let userName = "Anonymous"; // Default name
  try {
    const response = await fetch("https://localhost:7152/api/User/Profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      userName = userData.name || "Anonymous"; // Use the user's name from the API
    } else {
      console.error("Failed to fetch user profile:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  // Fetch room details to get the host's name
  let hostUserName = "";
  try {
    const roomResponse = await fetch(
      `https://localhost:7152/api/Room/${roomId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (roomResponse.ok) {
      const roomData = await roomResponse.json();
      hostUserName = roomData.hostUserName; // Get the host's name
    } else {
      console.error("Failed to fetch room details:", roomResponse.statusText);
    }
  } catch (error) {
    console.error("Error fetching room details:", error);
  }

  // Function to load chat messages from localStorage
  const loadChatMessages = () => {
    const messages = JSON.parse(localStorage.getItem(`chat-${roomId}`)) || [];
    chatMessagesContainer.innerHTML = messages
      .map(
        (msg) => `
      <div class="chat-message ${
        msg.sender === userName ? "user-message" : "other-message"
      }">
        <div class="message-content">
          <strong>${msg.sender} ${
          msg.sender === hostUserName ? "👑" : ""
        }:</strong> ${msg.message}
        </div>
        <span class="timestamp">${new Date(
          msg.timestamp
        ).toLocaleTimeString()}</span>
      </div>
    `
      )
      .join("");
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Auto-scroll to the latest message
  };

  // Load existing messages when the page loads
  loadChatMessages();

  // Handle sending new messages
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Create a new message object
    const newMessage = {
      sender: userName,
      message,
      timestamp: new Date().toISOString(),
    };

    // Save the message to localStorage
    const messages = JSON.parse(localStorage.getItem(`chat-${roomId}`)) || [];
    messages.push(newMessage);
    localStorage.setItem(`chat-${roomId}`, JSON.stringify(messages));

    // Clear the input and reload messages
    chatInput.value = "";
    loadChatMessages();
  });

  // Initialize emoji picker
  const picker = new EmojiPicker();
  picker.addEventListener("emoji-click", (event) => {
    chatInput.value += event.detail.unicode;
  });

  emojiPickerButton.addEventListener("click", () => {
    picker.togglePicker(emojiPickerButton);
  });
});
