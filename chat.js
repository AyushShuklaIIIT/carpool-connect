import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import { firebaseConfig } from "./firebaseconfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const messageRef = collection(db, "messages");

onSnapshot(query(messageRef, orderBy("timestamp")), (snapshot) => {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
        let message = doc.data();
        let messageElement = document.createElement("p");
        messageElement.textContent = message.text;
        chatBox.appendChild(messageElement);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
})

document.getElementById("send-btn").addEventListener("click", async () => {
    const messageInput = document.getElementById("message-input");

    if(messageInput.value.trim() !== "") {
        await addDoc(messageRef, {
            text: messageInput.value,
            timestamp: new Date()
        });
        messageInput.value = "";
    }
});