import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js"
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",
  authDomain: "saathibazar-59132.firebaseapp.com",
  projectId: "saathibazar-59132",
  storageBucket: "saathibazar-59132.appspot.com",
  messagingSenderId: "70401479708",
  appId: "1:70401479708:web:32568f0136713e32757bd9",
  measurementId: "G-GC9NYHSL0G",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const provider = new GoogleAuthProvider()

// Register with Email/Password
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const contact = document.getElementById("contact").value.trim()
  const role = "vendor"

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      contact,
      role,
      createdAt: new Date(),
    })

    alert("Vendor registered successfully!")
    window.location.href = "vendordashboard.html"
  } catch (error) {
    console.error("❌ Error during registration:", error.message)
    alert(error.message)
  }
})

// Google Signup
document.getElementById("googleSignup").addEventListener("click", async () => {
  const role = "vendor"

  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      contact: "", // default empty
      role,
      createdAt: new Date(),
    })

    alert("Signed up as Vendor with Google!")
    window.location.href = "vendordashboard.html"
  } catch (error) {
    console.error("❌ Google signup failed:", error.message)
    alert(error.message)
  }
})
