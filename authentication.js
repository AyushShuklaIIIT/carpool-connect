import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebaseconfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).then(() => {
    console.log("Auth persistence set to local.");
})
.catch((error) => {
    console.error("Error enabling persistence: ", error);
    alert(error.message);
});

document.getElementById("show-register").addEventListener('click', () => {
    document.querySelector("#register-container").classList.remove("hidden");
    document.querySelector("#login-container").classList.add("hidden");
});

document.getElementById("show-login").addEventListener("click", () => {
    document.querySelector("#register-container").classList.add("hidden");
    document.querySelector("#login-container").classList.remove("hidden");
});
document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)    
    .then(() => {
        alert("Login successful!");
        document.getElementById("logout-btn").classList.remove("hidden");
        window.location.href = "index.html";
    })
    .catch((error) => {
        alert(error.message);
    });
});

document.getElementById("register-btn").addEventListener("click", () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
        alert("Registration successful!");
        window.location.href = "index.html";
    })
    .catch((error) => {
        alert(error.message);
    });
});

document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        document.getElementById("logout-btn").classList.add("hidden");
        window.location.href = "index.html";
    });
});
