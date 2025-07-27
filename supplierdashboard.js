// supplierdashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import {
  getFirestore, collection, addDoc, query, where, getDocs,
  doc, deleteDoc, updateDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",
  authDomain: "saathibazar-59132.firebaseapp.com",
  projectId: "saathibazar-59132",
  storageBucket: "saathibazar-59132.appspot.com",
  messagingSenderId: "70401479708",
  appId: "1:70401479708:web:32568f0136713e32757bd9",
  measurementId: "G-GC9NYHSL0G"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth()
const db = getFirestore()

let currentUserUID = null

// 🧠 On login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid
    fetchMaterials()
    fetchOrders()
    loadWhatsAppNumber(user.uid)
  } else {
    window.location.href = "supplierlogin.html"
  }
})

// 📦 Add material
document.getElementById("materialForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  const name = document.getElementById("materialName").value.trim()
  const quantity = +document.getElementById("quantity").value
  const unit = document.getElementById("unit").value.trim()
  const price = +document.getElementById("price").value
  const category = document.getElementById("category").value.trim().toLowerCase()

  if (!name || !unit || !category || isNaN(quantity) || isNaN(price)) {
    alert("Please fill all fields.")
    return
  }

  try {
    await addDoc(collection(db, "materials"), {
      name, quantity, unit, price, category,
      supplierId: currentUserUID,
      timestamp: new Date()
    })
    alert("✅ Material added!")
    document.getElementById("materialForm").reset()
    fetchMaterials()
  } catch (err) {
    console.error("Error adding:", err)
    alert("❌ Error uploading material.")
  }
})

// 🧾 Fetch Materials
async function fetchMaterials() {
  const q = query(collection(db, "materials"), where("supplierId", "==", currentUserUID))
  const snapshot = await getDocs(q)

  const container = document.getElementById("materialsList")
  container.innerHTML = ""

  snapshot.forEach(docSnap => {
    const mat = docSnap.data()
    const matId = docSnap.id

    const card = document.createElement("div")
    card.className = "bg-gray-50 border p-4 rounded shadow"

    card.innerHTML = `
      <h3 class="font-bold">${mat.name}</h3>
      <p>Qty: ${mat.quantity} ${mat.unit}</p>
      <p>Price: ₹${mat.price} / ${mat.unit}</p>
      <div class="mt-2 flex gap-2">
        <button class="bg-yellow-400 text-white px-2 py-1 rounded text-sm editBtn">Edit</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded text-sm deleteBtn">Delete</button>
      </div>
    `

    // 🗑 Delete
    card.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Delete "${mat.name}"?`)) {
        await deleteDoc(doc(db, "materials", matId))
        fetchMaterials()
      }
    })

    // ✏ Edit
    card.querySelector(".editBtn").addEventListener("click", () => {
      document.getElementById("materialName").value = mat.name
      document.getElementById("quantity").value = mat.quantity
      document.getElementById("unit").value = mat.unit
      document.getElementById("price").value = mat.price

      const submitBtn = document.querySelector("#materialForm button[type='submit']")
      submitBtn.textContent = "Update Material"

      const form = document.getElementById("materialForm")
      const handler = async (e) => {
        e.preventDefault()
        const name = document.getElementById("materialName").value.trim()
        const quantity = +document.getElementById("quantity").value
        const unit = document.getElementById("unit").value.trim()
        const price = +document.getElementById("price").value

        await updateDoc(doc(db, "materials", matId), {
          name, quantity, unit, price
        })

        alert("✅ Updated!")
        form.reset()
        submitBtn.textContent = "Upload Material"
        fetchMaterials()
        form.removeEventListener("submit", handler)
      }

      form.addEventListener("submit", handler)
    })

    container.appendChild(card)
  })
}

// 📞 WhatsApp Save + Load
const whatsappInput = document.getElementById("whatsappInput")
const saveWhatsappBtn = document.getElementById("saveWhatsappBtn")
const whatsappStatus = document.getElementById("whatsappStatus")

async function loadWhatsAppNumber(uid) {
  const userRef = doc(db, "users", uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data()
    if (data.whatsapp) {
      whatsappInput.value = data.whatsapp
      whatsappStatus.textContent = `✅ Saved number: ${data.whatsapp}`
    }
  }
}

saveWhatsappBtn?.addEventListener("click", async () => {
  const number = whatsappInput.value.trim()
  if (!number.startsWith("+91") || number.length < 12) {
    alert("⚠️ Enter valid WhatsApp number with +91")
    return
  }

  try {
    const userRef = doc(db, "users", currentUserUID)
    await setDoc(userRef, { whatsapp: number }, { merge: true })
    whatsappStatus.textContent = `✅ Saved number: ${number}`
    alert("WhatsApp number saved!")
  } catch (err) {
    console.error("Error saving WhatsApp:", err)
    alert("❌ Could not save WhatsApp number.")
  }
})

// 📦 Fetch Orders
async function fetchOrders() {
  const q = query(collection(db, "orders"), where("supplierId", "==", currentUserUID))
  const snapshot = await getDocs(q)

  const container = document.getElementById("ordersList")
  container.innerHTML = ""

  if (snapshot.empty) {
    container.innerHTML = "<p>No orders yet.</p>"
    return
  }

  snapshot.forEach(docSnap => {
    const order = docSnap.data()
    const orderId = docSnap.id

    const div = document.createElement("div")
    div.className = "p-4 bg-gray-100 rounded shadow mb-4"

    div.innerHTML = `
      <p><strong>Vendor ID:</strong> ${order.vendorId}</p>
      <p><strong>Items:</strong></p>
      <ul class="list-disc list-inside">
        ${order.items.map(item => `<li>${item.name} - ${item.quantity} ${item.unit}</li>`).join("")}
      </ul>
      <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
      ${order.status === "Pending" ? `
        <button onclick="markOrderCompleteUI('${orderId}')" 
                class="mt-2 bg-green-500 text-white px-3 py-1 rounded">
          Mark as Delivered
        </button>
      ` : ""}
    `

    container.appendChild(div)
  })
}

// ✅ Mark as Delivered
window.markOrderCompleteUI = async (orderId) => {
  if (!confirm("Mark this order as delivered?")) return

  const orderRef = doc(db, "orders", orderId)
  await updateDoc(orderRef, { status: "Completed" })

  const orderSnap = await getDoc(orderRef)
  const order = orderSnap.data()

  const vendorQuery = query(collection(db, "users"), where("uid", "==", order.vendorId))
  const vendorSnap = await getDocs(vendorQuery)
  const vendor = vendorSnap.docs[0]?.data()

  if (vendor?.whatsapp) {
    const message = `✅ Your order (ID: ${orderId}) has been delivered. Thanks for using SaathiBazar!`
    await fetch("http://localhost:3000/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: vendor.whatsapp, message })
    })
  }

  alert("✅ Order marked as delivered & vendor notified!")
  fetchOrders()
}

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "supplierlogin.html"
  })
})
