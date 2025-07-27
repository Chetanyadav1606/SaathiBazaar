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
  appId: "1:70401479708:web:32568f0136713e32757bd9",
  measurementId: "G-GC9NYHSL0G"
};

// 🔌 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUserUID = null;
let cart = [];
let allMaterials = [];

// 🚀 Init Elements
const whatsappInput = document.getElementById("whatsappInput");
const saveWhatsappBtn = document.getElementById("saveWhatsappBtn");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const locationInput = document.getElementById("locationInput");
const saveLocationBtn = document.getElementById("saveLocationBtn");
const currentLocationText = document.getElementById("currentLocationText");

// 🧠 Auth Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUID = user.uid;
    fetchMaterials();
    fetchOrders();
    loadWhatsappNumber(user.uid);
    loadLocation(user.uid); // ✅ load saved location
  } else {
    window.location.href = "vendorlogin.html";
  }
});

// ☎️ Load WhatsApp Number
async function loadWhatsappNumber(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.whatsapp && whatsappInput) {
      whatsappInput.value = data.whatsapp;
    }
  }
}

saveWhatsappBtn?.addEventListener("click", async () => {
  const number = whatsappInput?.value.trim();
  if (!number.startsWith("+91") || number.length < 12) {
    alert("📞 Please enter valid WhatsApp number with +91");
    return;
  }

  try {
    const userRef = doc(db, "users", currentUserUID);
    await setDoc(userRef, { whatsapp: number }, { merge: true });
    alert("✅ WhatsApp number saved!");
  } catch (err) {
    console.error("❌ Error saving WhatsApp:", err);
    alert("❌ Failed to save WhatsApp number.");
  }
});

let map, marker;

function initMap(lat = 20.5937, lng = 78.9629) { // default: India center
  if (!map) {
    map = L.map('locationMap').setView([lat, lng], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }

  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }

  map.setView([lat, lng], 13);
}

detectLocationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("❌ Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const coords = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    locationInput.value = coords;
    initMap(latitude, longitude); // Show on map
  }, (err) => {
    console.error("Error getting location:", err);
    alert("❌ Could not detect location.");
  });
});

saveLocationBtn?.addEventListener("click", async () => {
  const location = locationInput?.value.trim();
  if (!location) {
    alert("⚠️ Please enter or detect your shop location.");
    return;
  }

  try {
    const userRef = doc(db, "users", currentUserUID);
    await setDoc(userRef, { location }, { merge: true });
    currentLocationText.textContent = location;

    const [latStr, lngStr] = location.match(/-?\d+(\.\d+)?/g);
    if (latStr && lngStr) initMap(parseFloat(latStr), parseFloat(lngStr));

    alert("✅ Location saved!");
  } catch (err) {
    console.error("❌ Error saving location:", err);
    alert("❌ Failed to save location.");
  }
});

async function loadLocation(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.location && locationInput && currentLocationText) {
      locationInput.value = data.location;
      currentLocationText.textContent = data.location;

      const [latStr, lngStr] = data.location.match(/-?\d+(\.\d+)?/g);
      if (latStr && lngStr) initMap(parseFloat(latStr), parseFloat(lngStr));
    }
  }
}

// 🛒 Fetch Materials
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

  if (materials.length === 0) {
    container.innerHTML = "<p>No materials found.</p>";
    return;
  }

  materials.forEach((material) => {
    const card = document.createElement("div");
    card.className = "bg-gray-100 p-4 border rounded shadow";

    card.innerHTML = `
      <h3 class="font-bold">${material.name}</h3>
      <p>Qty: ${material.quantity} ${material.unit}</p>
      <p>Price: ₹${material.price} / ${material.unit}</p>
      <div class="flex gap-2 mt-2">
        <input type="number" id="qty-${material.id}" value="1" min="1" class="border p-1 rounded w-16 text-sm" />
        <button onclick="addToCart('${material.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-sm">
          Add to Cart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ➕ Add to Cart
window.addToCart = (materialId) => {
  const material = allMaterials.find((m) => m.id === materialId);
  const qtyInput = document.getElementById(`qty-${materialId}`);
  const quantity = parseInt(qtyInput.value);

  if (!material || quantity <= 0 || quantity > material.quantity) {
    alert("Invalid quantity selected.");
    return;
  }

  const existing = cart.find((item) => item.id === materialId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: materialId,
      name: material.name,
      quantity,
      unit: material.unit,
      price: material.price,
      supplierId: material.supplierId
    });
  }

  updateCartDisplay();
  alert(`${material.name} added to cart!`);
};

// 🗑️ Remove from Cart
window.removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCartDisplay();
};

// 🧾 Update Cart UI
function updateCartDisplay() {
  const container = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    placeOrderBtn.disabled = true;
    totalElement.textContent = "Total: ₹0";
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-white p-2 border rounded mb-2";
    div.innerHTML = `
      <span>${item.name} - ${item.quantity} ${item.unit}</span>
      <div class="flex gap-2 items-center">
        <span>₹${itemTotal}</span>
        <button onclick="removeFromCart(${index})" class="text-red-500 font-bold">×</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalElement.textContent = `Total: ₹${total}`;
  placeOrderBtn.disabled = false;
}

// 🛍️ Place Order
document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  if (cart.length === 0) return;

  const grouped = {};
  cart.forEach((item) => {
    if (!grouped[item.supplierId]) grouped[item.supplierId] = [];
    grouped[item.supplierId].push(item);
  });

  try {
    for (const supplierId in grouped) {
      const items = grouped[supplierId];

      // Save order
      await addDoc(collection(db, "orders"), {
        vendorId: currentUserUID,
        supplierId,
        items,
        status: "Pending",
        timestamp: new Date()
      });

      // Notify supplier on WhatsApp
      const snap = await getDocs(query(collection(db, "users"), where("uid", "==", supplierId)));
      const supplier = snap.docs[0]?.data();

      if (supplier?.whatsapp) {
        const itemList = items.map(i => `${i.name} x${i.quantity} ${i.unit}`).join(", ");
        const msg = `📦 New Order Received on SaathiBazar!\nItems: ${itemList}`;

        await fetch("http://localhost:3000/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: supplier.whatsapp,
            message: msg
          })
        });
      }
    }

    alert("✅ Order placed and supplier notified!");
    cart = [];
    updateCartDisplay();
    fetchOrders();
  } catch (err) {
    console.error("❌ Error placing order:", err);
    alert("Something went wrong!");
  }
});

// 📦 Fetch Orders
async function fetchOrders() {
  const q = query(collection(db, "orders"), where("vendorId", "==", currentUserUID));
  const snapshot = await getDocs(q);
  const container = document.getElementById("ordersList");

  container.innerHTML = "";
  if (snapshot.empty) {
    container.innerHTML = "<p>No orders placed yet.</p>";
    return;
  }

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
    if (order.status === "Completed") {
  div.innerHTML += `
    <a href="review.html?vendorId=${order.supplierId}" 
       class="bg-blue-600 text-white px-3 py-1 rounded mt-2 inline-block">
      Leave a Review
    </a>
  `;
}

    container.appendChild(div);
  });
}

// 🌟 Load Reviews for this Vendor
async function loadReviews() {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("vendorId", "==", currentUserUID));
  const snapshot = await getDocs(q);

  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p class='text-gray-500'>No reviews yet.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const review = docSnap.data();
    const stars = "⭐".repeat(review.rating || 0);
    const div = document.createElement("div");
    div.className = "border border-gray-300 rounded p-4 bg-gray-50";

    div.innerHTML = `
      <div class="flex justify-between items-center mb-1">
        <span class="font-semibold text-green-800">${review.customerName || 'Anonymous'}</span>
        <span class="text-yellow-500">${stars}</span>
      </div>
      <p class="text-gray-700 italic">"${review.comment}"</p>
      <p class="text-sm text-gray-400">${new Date(review.date?.seconds * 1000).toLocaleDateString()}</p>
    `;

    container.appendChild(div);
  });
}
async function loadReviews() {
  const q = query(collection(db, "reviews"), where("vendorId", "==", currentUserUID));
  const snap = await getDocs(q);

  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  if (snap.empty) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  snap.forEach(doc => {
    const data = doc.data();
    container.innerHTML += `
      <div class="bg-gray-100 p-4 rounded shadow">
        <p><strong>${data.customerName}</strong> ⭐ ${data.rating}/5</p>
        <p class="text-sm text-gray-600 italic">${data.comment}</p>
      </div>
    `;
  });
}

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "vendorlogin.html";
  });
});
