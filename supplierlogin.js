// Firebase imports from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",
  authDomain: "saathibazar-59132.firebaseapp.com",
  projectId: "saathibazar-59132",
  storageBucket: "saathibazar-59132.appspot.com",
  messagingSenderId: "70401479708",
  appId: "1:70401479708:web:32568f0136713e32757bd9",
  measurementId: "G-GC9NYHSL0G"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
 // Email/Password Login
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert("Login successful!");
          window.location.href = "supplierdashboard.html"; // ✅ redirect to supplier dashboard
        })
        .catch((error) => {
          alert("Login failed: " + error.message);
        });
    });

// ✅ Google Sign-in Button Event
document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("✅ Google Login Success", user);
      alert("Welcome, " + user.displayName);
      window.location.href = "supplierdashboard.html"; // ✅ Change this if needed
    })
    .catch((error) => {
      console.error("❌ Google Login Failed:", error);
      alert("Google Login Error: " + error.message);
    });
});
