// Import Realtime Database
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Connect to database
const db = getDatabase();

// UI elements
const input = document.getElementById("msgInput");
const btn = document.getElementById("addBtn");
const list = document.getElementById("list");

// Reference to messages in the database
const messagesRef = ref(db, "messages");

// Add message
btn.onclick = () => {
  if (input.value.trim() === "") return;
  push(messagesRef, input.value)
    .then(() => {
      input.value = "";
    })
    .catch((error) => {
      console.error("Error writing to database: ", error);
    });
};

// Load realtime messages
onValue(messagesRef, (snapshot) => {
  list.innerHTML = "";
  snapshot.forEach(child => {
    const li = document.createElement("li");
    li.textContent = child.val();
    list.appendChild(li);
  });
}, (error) => {
  console.error("Error reading from database: ", error);
});
