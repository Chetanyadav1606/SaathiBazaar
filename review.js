import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔧 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",
  authDomain: "saathibazar-59132.firebaseapp.com",
  projectId: "saathibazar-59132",
  storageBucket: "saathibazar-59132.appspot.com",
  messagingSenderId: "70401479708",
  appId: "1:70401479708:web:32568f0136713e32757bd9",
  measurementId: "G-GC9NYHSL0G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

// ⛓️ Get vendorId from URL
const urlParams = new URLSearchParams(window.location.search);
const vendorId = urlParams.get("vendorId");
document.getElementById("vendorId").value = vendorId;

// Autofill name if logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("customerName").value = user.displayName || user.email;
  }
});

// 🎯 Submit Review Handler
document.getElementById("submitReview").addEventListener("click", async () => {
  const customerName = document.getElementById("customerName").value.trim();
  const rating = parseInt(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value.trim();

  if (!customerName || !comment || isNaN(rating) || rating < 1 || rating > 5) {
    alert("⚠️ Please fill in all fields correctly.");
    return;
  }

  const btn = document.getElementById("submitReview");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    await addDoc(collection(db, "reviews"), {
      vendorId,
      customerName,
      rating,
      comment,
      date: serverTimestamp()
    });

    alert("✅ Review submitted successfully!");
    window.location.href = "vendordashboard.html"; // or your redirect page
  } catch (err) {
    console.error("❌ Error saving review:", err);
    alert("❌ Failed to submit review.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Review";
  }
});
