import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const input = document.getElementById("msgInput");
const btn = document.getElementById("addBtn");
const list = document.getElementById("list");

const messagesRef = collection(window.db, "messages");

// Add message to Firestore
btn.onclick = async () => {
  await addDoc(messagesRef, { text: input.value });
  input.value = "";
  loadMessages();
};

// Load all messages
async function loadMessages() {
  list.innerHTML = "";
  const snap = await getDocs(messagesRef);
  
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    list.appendChild(li);
  });
}

loadMessages();
