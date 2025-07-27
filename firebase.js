// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

// ✅ Replace these with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDALc5-P5QIX2Nw_DcxN4XDxxKhfdLqQOU",  // apikey of firebase
  authDomain: "saathibazar-59132.firebaseapp.com",    //authdomain key
  projectId: "saathibazar-59132",//projectId
  storageBucket: "saathibazar-59132.firebasestorage.app", //storage buccket
  messagingSenderId: "70401479708",  //messagind sender id

  appId: "1:70401479708:web:32568f0136713e32757bd9", //appid
  measurementId: "G-GC9NYHSL0G"  //measurement id
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// -------------- 🔥 BACKEND FUNCTIONS --------------

// ✅ Add new user (after sign up)
export const addUser = async (uid, email, role, whatsapp) => {
  await addDoc(collection(db, "users"), {
    uid,
    email,
    role,
    whatsapp, // ✅ Now saving WhatsApp number
    createdAt: serverTimestamp(),
  });
};


// ✅ Add material (Supplier)
export const addMaterial = async (material) => {
  await addDoc(collection(db, "materials"), {
    ...material,
    timestamp: serverTimestamp(),
  });
};

// ✅ Fetch all materials
export const getMaterials = async () => {
  const snapshot = await getDocs(collection(db, "materials"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const placeOrder = async (vendorId, supplierId, items) => {
  // 1. Save order to Firestore
  await addDoc(collection(db, "orders"), {
    vendorId,
    supplierId,
    items,
    status: "pending",
    timestamp: serverTimestamp(),
  });

  // 2. Fetch supplier phone number from Firestore
  const supplierSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", supplierId)));
  const supplier = supplierSnapshot.docs[0]?.data();

  if (supplier?.whatsapp) {
    // 3. Prepare WhatsApp message
    const message = `📦 New Order Received!\nItems:\n${items.map(i => `• ${i.name} x ${i.quantity} ${i.unit}`).join("\n")}`;

    // 4. Send POST request to your backend
    await fetch("http://localhost:3000/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: supplier.whatsapp, // Must include country code e.g. "+91..."
        message,
      }),
    });
  }
};

// ✅ Get orders for a specific vendor or supplier
export const getOrdersByRole = async (field, uid) => {
  const q = query(collection(db, "orders"), where(field, "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};  
