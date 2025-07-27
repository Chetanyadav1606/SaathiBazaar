import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔧 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",
  authDomain: "saathibazar-59132.firebaseapp.com",
  projectId: "saathibazar-59132",
  storageBucket: "saathibazar-59132.appspot.com",
  messagingSenderId: "70401479708",
  appId: "1:70401479708:web:32568f0136713e32757bd9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUserUID = null;
let cart = [];
let allMaterials = [];

// ✅ Check login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUID = user.uid;
    fetchMaterials();
    fetchOrders();
    loadWhatsappNumber(user.uid);
    loadLocation(user.uid);
  } else {
    window.location.href = "vendorlogin.html";
  }
});

// ✅ WhatsApp Number
const whatsappInput = document.getElementById("whatsappInput");
const saveWhatsappBtn = document.getElementById("saveWhatsappBtn");

async function loadWhatsappNumber(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.whatsapp && whatsappInput) {
      whatsappInput.value = data.whatsapp;
    }
  }
}

saveWhatsappBtn?.addEventListener("click", async () => {
  const number = whatsappInput?.value.trim();
  if (!number.startsWith("+91") || number.length < 12) {
    alert("📞 Enter valid number with +91");
    return;
  }
  const userRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(userRef, { whatsapp: number }, { merge: true });
  alert("✅ WhatsApp number saved!");
});

// ✅ Location Detection
const locationInput = document.getElementById("locationInput");
const saveLocationBtn = document.getElementById("saveLocationBtn");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const locationDisplay = document.getElementById("locationDisplay");

saveLocationBtn?.addEventListener("click", async () => {
  const location = locationInput.value.trim();
  if (location.length < 3) return alert("Enter a valid location");
  const ref = doc(db, "users", auth.currentUser.uid);
  await setDoc(ref, { location }, { merge: true });
  locationDisplay.textContent = location;
  alert("📍 Location saved!");
});

detectLocationBtn?.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      const address = data?.display_name || `Lat: ${latitude}, Lon: ${longitude}`;
      locationDisplay.textContent = address;
      await setDoc(doc(db, "users", currentUserUID), { location: address }, { merge: true });
    });
  } else {
    alert("Geolocation not supported");
  }
});

async function loadLocation(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.location && locationDisplay) {
      locationDisplay.textContent = data.location;
    }
  }
}

// ✅ Fetch Materials
async function fetchMaterials() {
  const snapshot = await getDocs(collection(db, "materials"));
  allMaterials = [];
  snapshot.forEach((doc) => {
    allMaterials.push({ id: doc.id, ...doc.data() });
  });
  displayMaterials(allMaterials);
}

function displayMaterials(materials) {
  const container = document.getElementById("materialsList");
  container.innerHTML = "";

  materials.forEach((mat) => {
    const card = document.createElement("div");
    card.className = "bg-gray-100 p-4 border rounded shadow hover:shadow-lg transition";
    card.innerHTML = `
      <h3 class="font-bold">${mat.name}</h3>
      <p>Qty: ${mat.quantity} ${mat.unit}</p>
      <p>₹${mat.price} / ${mat.unit}</p>
      <div class="flex gap-2 mt-2">
        <input type="number" id="qty-${mat.id}" value="1" min="1" class="border p-1 rounded w-16 text-sm" />
        <button onclick="addToCart('${mat.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-sm">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ✅ Cart Logic
window.addToCart = (id) => {
  const mat = allMaterials.find((m) => m.id === id);
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  if (!mat || qty <= 0 || qty > mat.quantity) return alert("Invalid quantity");

  const existing = cart.find((i) => i.id === id);
  if (existing) existing.quantity += qty;
  else cart.push({ ...mat, quantity: qty });

  updateCart();
};

function updateCart() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const btn = document.getElementById("placeOrderBtn");

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty</p>";
    btn.disabled = true;
    totalEl.textContent = "Total: ₹0";
    return;
  }

  cart.forEach((item, index) => {
    const price = item.price * item.quantity;
    total += price;
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-white p-2 border rounded mb-2";
    div.innerHTML = `
      <span>${item.name} - ${item.quantity} ${item.unit}</span>
      <div class="flex gap-2 items-center">
        <span>₹${price}</span>
        <button onclick="removeFromCart(${index})" class="text-red-500 font-bold">×</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = `Total: ₹${total}`;
  btn.disabled = false;
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  updateCart();
};

// ✅ Place Order + WhatsApp Message
document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  if (cart.length === 0) return;

  const grouped = {};
  cart.forEach((item) => {
    if (!grouped[item.supplierId]) grouped[item.supplierId] = [];
    grouped[item.supplierId].push(item);
  });

  for (const supplierId in grouped) {
    const items = grouped[supplierId];

    await addDoc(collection(db, "orders"), {
      vendorId: currentUserUID,
      supplierId,
      items,
      status: "Pending",
      timestamp: new Date()
    });

    const snap = await getDocs(query(collection(db, "users"), where("uid", "==", supplierId)));
    const supplier = snap.docs[0]?.data();

    if (supplier?.whatsapp) {
      const list = items.map(i => `${i.name} x${i.quantity}`).join(", ");
      const msg = `📦 New Order from Vendor:\n${list}`;
      await fetch("http://localhost:3000/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: supplier.whatsapp, message: msg })
      });
    }
  }

  alert("✅ Order placed!");
  cart = [];
  updateCart();
  fetchOrders();
});

// ✅ Vendor Orders
async function fetchOrders() {
  const q = query(collection(db, "orders"), where("vendorId", "==", currentUserUID));
  const snapshot = await getDocs(q);
  const container = document.getElementById("ordersList");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const order = docSnap.data();
    const div = document.createElement("div");
    div.className = "bg-white p-4 border rounded mb-4";
    div.innerHTML = `
      <p><strong>Order ID:</strong> ${docSnap.id}</p>
      <ul class="list-disc ml-4 my-2">
        ${order.items.map(item => `<li>${item.name} - ${item.quantity} ${item.unit}</li>`).join("")}
      </ul>
      <p><strong>Status:</strong> ${order.status}</p>
    `;
    container.appendChild(div);
  });
}

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "vendorlogin.html";
  });
});
