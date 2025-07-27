// Sample data
const materials = [
  { id: 1, name: "Fresh Tomatoes", price: 45, unit: "kg", icon: "🍅", stock: 120, category: "vegetables" },
  { id: 2, name: "Basmati Rice", price: 85, unit: "kg", icon: "🍚", stock: 200, category: "grains" },
  { id: 3, name: "Red Onions", price: 35, unit: "kg", icon: "🧅", stock: 150, category: "vegetables" },
  { id: 4, name: "Fresh Apples", price: 120, unit: "kg", icon: "🍎", stock: 80, category: "fruits" },
  { id: 5, name: "Turmeric Powder", price: 180, unit: "kg", icon: "🌶️", stock: 50, category: "spices" },
  { id: 6, name: "Mustard Oil", price: 140, unit: "L", icon: "🫒", stock: 75, category: "oils" },
  { id: 7, name: "Fresh Milk", price: 60, unit: "L", icon: "🥛", stock: 90, category: "dairy" },
  { id: 8, name: "Green Bananas", price: 40, unit: "dozen", icon: "🍌", stock: 110, category: "fruits" },
]

// Sample users for demo
const users = [{ email: "vendor@saathibazar.com", password: "123456", name: "Demo Vendor", contact: "9876543210" }]

// Add recommended items data
const recommendedItems = [
  { id: 101, name: "Organic Carrots", price: 55, unit: "kg", icon: "🥕", category: "vegetables" },
  { id: 102, name: "Fresh Ginger", price: 180, unit: "kg", icon: "🫚", category: "spices" },
  { id: 103, name: "Green Peas", price: 80, unit: "kg", icon: "🟢", category: "vegetables" },
  { id: 104, name: "Coconut Oil", price: 220, unit: "L", icon: "🥥", category: "oils" },
]

// Update the categories data structure
const categories = [
  { id: "all", name: "All Materials", icon: "🏪", count: 156 },
  { id: "vegetables", name: "Vegetables", icon: "🥬", count: 45 },
  { id: "fruits", name: "Fruits", icon: "🍎", count: 32 },
  {
    id: "grocery",
    name: "Grocery",
    icon: "🛒",
    count: 79,
    isExpandable: true,
    subcategories: [
      { id: "grains", name: "Grains & Pulses", icon: "🌾", count: 28 },
      { id: "dairy", name: "Dairy Products", icon: "🥛", count: 18 },
      { id: "spices", name: "Spices & Herbs", icon: "🌶️", count: 22 },
      { id: "oils", name: "Cooking Oils", icon: "🫒", count: 11 },
    ],
  },
]

// State
let currentUser = null
let currentCategory = "all"
let currentView = "grid"
const cart = []
let searchQuery = ""

// Add expanded state tracking
const expandedCategories = new Set()

// DOM Elements
const categoryList = document.getElementById("categoryList")
const materialsGrid = document.getElementById("materialsGrid")
const searchInput = document.getElementById("searchInput")
const itemCount = document.getElementById("itemCount")
const cartCount = document.getElementById("cartCount")
const cartBadge = document.getElementById("cartBadge")
const cartItems = document.getElementById("cartItems")
const cartTotal = document.getElementById("cartTotal")
const totalAmount = document.getElementById("totalAmount")
const headerCartCount = document.getElementById("headerCartCount")
const cartDropdown = document.getElementById("cartDropdown")
const cartPreview = document.getElementById("cartPreview")
const dropdownCartCount = document.getElementById("dropdownCartCount")
const cartTotalPreview = document.getElementById("cartTotalPreview")
const cartItemsList = document.getElementById("cartItemsList")
const cartItemsTotal = document.getElementById("cartItemsTotal")
const placeOrderBtn = document.getElementById("placeOrderBtn")

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  showSignup()
  initializeInteractiveElements()
})

// Event Listeners
function setupEventListeners() {
  // Signup form
  document.getElementById("signupForm").addEventListener("submit", handleSignup)

  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Google buttons
  document.getElementById("googleSignup").addEventListener("click", handleGoogleAuth)
  document.getElementById("googleLogin").addEventListener("click", handleGoogleAuth)

  // Dashboard search
  document.getElementById("dashboardSearch").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase()
    renderMaterials()
  })

  // Category selection
  categoryList.addEventListener("click", (e) => {
    if (e.target.closest(".category-item")) {
      const categoryBtn = e.target.closest(".category-item")
      const category = categoryBtn.dataset.category

      document.querySelectorAll(".category-item").forEach((btn) => btn.classList.remove("active"))
      categoryBtn.classList.add("active")

      currentCategory = category
      renderMaterials()
    }
  })

  // View toggle
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      currentView = this.dataset.view
      renderMaterials()
    })
  })

  // Cart dropdown toggle
  document.getElementById("cartToggle").addEventListener("click", toggleCartDropdown)

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cart-dropdown")) {
      document.getElementById("cartDropdown").classList.remove("show")
    }
    if (!e.target.closest(".category-dropdown")) {
      const subcategories = document.getElementById("grocerySubcategories")
      const toggle = document.querySelector(".grocery-toggle")
      if (subcategories && subcategories.classList.contains("show")) {
        subcategories.classList.remove("show")
        toggle.classList.remove("expanded")
        expandedCategories.delete("grocery")
      }
    }
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape key to close cart dropdown
    if (e.key === "Escape") {
      document.getElementById("cartDropdown").classList.remove("show")
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      const searchInput = document.getElementById("dashboardSearch")
      if (searchInput) {
        searchInput.focus()
      }
    }
  })
}

// Authentication Functions
function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById("signupName").value.trim()
  const email = document.getElementById("signupEmail").value.trim()
  const contact = document.getElementById("signupContact").value.trim()
  const password = document.getElementById("signupPassword").value

  if (!name || !email || !contact || !password) {
    showError("Please fill all fields")
    return
  }

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    showError("User already exists. Please login.")
    showLogin()
    return
  }

  // Add new user
  users.push({ email, password, name, contact })

  // Auto login
  currentUser = { email, name, contact }
  showSuccess("Signup successful!")
}

function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    showSuccess("Login successful!")
  } else {
    showError("Invalid credentials")
  }
}

function handleGoogleAuth() {
  // Simulate Google auth
  currentUser = {
    email: "google.user@gmail.com",
    name: "Google User",
    contact: "9876543210",
  }
  showSuccess("Logged in with Google!")
}

function logout() {
  currentUser = null
  cart.length = 0
  showSignup()
}

// Page Navigation
function showSignup() {
  hideAllPages()
  document.getElementById("signupPage").style.display = "flex"
}

function showLogin() {
  hideAllPages()
  document.getElementById("loginPage").style.display = "flex"
}

function showSuccessMessage() {
  document.getElementById("successMessage").style.display = "flex"

  // Auto redirect after 2 seconds
  setTimeout(() => {
    showDashboard()
  }, 2000)
}

function showDashboard() {
  hideAllPages()
  document.getElementById("dashboardPage").style.display = "block"
  renderMaterials()
  updateCartDisplay()
}

function showCart() {
  hideAllPages()
  document.getElementById("cartPage").style.display = "block"
  renderCartPage()
}

function showExplore() {
  hideAllPages()
  document.getElementById("explorePage").style.display = "block"
  updateExplorePage()
}

function showSpecialOffers() {
  hideAllPages()
  document.getElementById("offersPage").style.display = "block"
}

function exploreCategories() {
  showExplore()
}

function selectCategoryAndGoToDashboard(category) {
  currentCategory = category
  showDashboard()

  // Update active category
  document.querySelectorAll(".category-item").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-category="${category}"]`).classList.add("active")

  // Scroll to materials section
  setTimeout(() => {
    document.querySelector(".materials-section").scrollIntoView({ behavior: "smooth" })
  }, 100)
}

// Add these new functions for handling the expandable grocery category:

// Toggle grocery category expansion
function toggleGroceryCategory() {
  const subcategories = document.getElementById("grocerySubcategories")
  const arrow = document.getElementById("groceryArrow")
  const toggle = document.querySelector(".grocery-toggle")

  if (subcategories.classList.contains("show")) {
    subcategories.classList.remove("show")
    toggle.classList.remove("expanded")
    expandedCategories.delete("grocery")
  } else {
    subcategories.classList.add("show")
    toggle.classList.add("expanded")
    expandedCategories.add("grocery")
  }
}

// Update the selectCategory function to handle subcategories
function selectCategory(category) {
  // Close grocery dropdown if selecting a different main category
  if (!["grains", "dairy", "spices", "oils"].includes(category)) {
    const subcategories = document.getElementById("grocerySubcategories")
    const toggle = document.querySelector(".grocery-toggle")
    subcategories.classList.remove("show")
    toggle.classList.remove("expanded")
    expandedCategories.delete("grocery")
  }

  // Update active states
  document.querySelectorAll(".category-item").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".subcategory-item").forEach((btn) => btn.classList.remove("active"))

  // Set active category
  if (["grains", "dairy", "spices", "oils"].includes(category)) {
    // It's a subcategory
    document.querySelector(`[data-category="${category}"].subcategory-item`).classList.add("active")
    document.querySelector(".grocery-toggle").classList.add("active")
  } else {
    // It's a main category
    document.querySelector(`[data-category="${category}"].category-item`).classList.add("active")
  }

  currentCategory = category
  renderMaterials()
}

function hideAllPages() {
  document.querySelectorAll(".page").forEach((page) => (page.style.display = "none"))
}

// Materials Functions
function getFilteredMaterials() {
  return materials.filter((material) => {
    const matchesCategory = currentCategory === "all" || material.category === currentCategory
    const matchesSearch = material.name.toLowerCase().includes(searchQuery)
    return matchesCategory && matchesSearch
  })
}

function renderMaterials() {
  const filteredMaterials = getFilteredMaterials()
  const grid = document.getElementById("materialsGrid")

  // Update item count
  itemCount.textContent = `${filteredMaterials.length} items`

  grid.innerHTML = filteredMaterials
    .map(
      (material) => `
        <div class="material-card fade-in" data-id="${material.id}">
            <div class="material-header" onclick="viewMaterialDetails(${material.id})" style="cursor: pointer;">
                <div class="material-icon">${material.icon}</div>
                <span class="stock-badge ${material.stock > 50 ? "high" : "low"}">
                    ${material.stock} in stock
                </span>
            </div>
            <h3 class="material-name" onclick="viewMaterialDetails(${material.id})" style="cursor: pointer;">${material.name}</h3>
            <div class="material-price-row">
                <div class="material-price">₹${material.price}</div>
                <span class="material-unit">per ${material.unit}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${material.id})">
                <i class="fas fa-plus"></i>
                Add to Cart
            </button>
        </div>
    `,
    )
    .join("")
}

// Cart Functions
function addToCart(materialId) {
  const material = materials.find((m) => m.id === materialId)
  const existingItem = cart.find((item) => item.id === materialId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...material, quantity: 1 })
  }

  updateCartDisplay()
  updateCartDropdown()

  // Show success animation
  const btn = event.target.closest(".add-to-cart-btn")
  const originalText = btn.innerHTML
  btn.innerHTML = '<i class="fas fa-check"></i> Added!'
  btn.style.background = "#059669"

  setTimeout(() => {
    btn.innerHTML = originalText
    btn.style.background = "#22c55e"
  }, 1000)
}

function removeFromCart(materialId) {
  const index = cart.findIndex((item) => item.id === materialId)
  if (index > -1) {
    cart.splice(index, 1)
    updateCartDisplay()
    updateCartDropdown()
    renderCartPage()
  }
}

function updateQuantity(materialId, change) {
  const item = cart.find((item) => item.id === materialId)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(materialId)
    } else {
      updateCartDisplay()
      updateCartDropdown()
      renderCartPage()
    }
  }
}

function updateCartDisplay() {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Update header cart count
  headerCartCount.textContent = cartItemCount

  if (cartItemCount > 0) {
    headerCartCount.classList.add("show")
  } else {
    headerCartCount.classList.remove("show")
  }
}

function updateCartDropdown() {
  const dropdown = document.getElementById("cartDropdown")
  const preview = document.getElementById("cartPreview")
  const countElement = document.getElementById("dropdownCartCount")
  const totalElement = document.getElementById("cartTotalPreview")

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  countElement.textContent = `${itemCount} items`
  totalElement.textContent = `Total: ₹${total}`

  if (cart.length === 0) {
    preview.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>'
  } else {
    preview.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item-preview">
            <div class="cart-item-icon">${item.icon}</div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="cart-item-price">₹${item.price * item.quantity}</div>
          </div>
        `,
      )
      .join("")
  }
}

// Update the cart toggle function to redirect instead of showing dropdown
function toggleCartDropdown() {
  showCart()
}

// Cart Page Functions
function renderCartPage() {
  const cartItemsList = document.getElementById("amazonCartItems")
  const cartItemsTotal = document.getElementById("amazonCartCount")
  const recommendedItemsContainer = document.getElementById("recommendedItems")
  const recentlyViewedContainer = document.getElementById("recentlyViewed")

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartItemsTotal.textContent = `${itemCount} items`

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="amazon-empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your SaathiBazar Cart is empty</h3>
        <p>Shop today's deals and discover fresh materials for your business</p>
        <button class="continue-shopping-btn" onclick="showDashboard()">Continue Shopping</button>
      </div>
    `
  } else {
    cartItemsList.innerHTML = cart
      .map(
        (item) => `
          <div class="amazon-cart-item slide-in">
            <div class="amazon-item-image">${item.icon}</div>
            <div class="amazon-item-details">
              <a href="#" class="amazon-item-title" onclick="viewItemDetails(${item.id})">${item.name}</a>
              <div class="amazon-item-price">₹${item.price}.00</div>
              <div class="amazon-item-stock">In Stock</div>
              <div class="amazon-item-actions">
                <div class="amazon-qty-selector">
                  <select class="amazon-qty-select" onchange="updateQuantityAmazon(${item.id}, this.value)">
                    ${Array.from({ length: 10 }, (_, i) => i + 1)
                      .map(
                        (num) =>
                          `<option value="${num}" ${num === item.quantity ? "selected" : ""}>Qty: ${num}</option>`,
                      )
                      .join("")}
                  </select>
                </div>
                <button class="amazon-action-btn" onclick="removeFromCart(${item.id})">Delete</button>
                <button class="amazon-action-btn" onclick="saveForLater(${item.id})">Save for later</button>
                <button class="amazon-action-btn" onclick="shareItem(${item.id})">Share</button>
              </div>
            </div>
            <div class="amazon-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `,
      )
      .join("")
  }

  // Render recommended items
  recommendedItemsContainer.innerHTML = recommendedItems
    .map(
      (item) => `
      <div class="recommended-item" onclick="addRecommendedToCart(${item.id})">
        <div class="recommended-item-image">${item.icon}</div>
        <div class="recommended-item-title">${item.name}</div>
        <div class="recommended-item-price">₹${item.price}</div>
      </div>
    `,
    )
    .join("")

  // Render recently viewed items (using some materials as example)
  const recentlyViewed = materials.slice(0, 4)
  recentlyViewedContainer.innerHTML = recentlyViewed
    .map(
      (item) => `
      <div class="recently-viewed-item" onclick="viewItemDetails(${item.id})">
        <div class="recently-viewed-image">${item.icon}</div>
        <div class="recently-viewed-title">${item.name}</div>
        <div class="recently-viewed-price">₹${item.price}</div>
      </div>
    `,
    )
    .join("")

  updateAmazonBilling()
}

// Update Amazon-style billing
function updateAmazonBilling() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 50
  const beforeTax = subtotal + shipping
  const tax = Math.round(beforeTax * 0.05)
  const total = beforeTax + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  document.getElementById("summaryItemCount").textContent = itemCount
  document.getElementById("summarySubtotal").textContent = `₹${subtotal.toFixed(2)}`
  document.getElementById("summaryShipping").textContent = shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`
  document.getElementById("summaryBeforeTax").textContent = `₹${beforeTax.toFixed(2)}`
  document.getElementById("summaryTax").textContent = `₹${tax.toFixed(2)}`
  document.getElementById("summaryTotal").textContent = `₹${total.toFixed(2)}`
}

// New helper functions
function updateQuantityAmazon(materialId, newQuantity) {
  const item = cart.find((item) => item.id === materialId)
  if (item) {
    item.quantity = Number.parseInt(newQuantity)
    updateCartDisplay()
    renderCartPage()
  }
}

function addRecommendedToCart(itemId) {
  const item = recommendedItems.find((i) => i.id === itemId)
  if (item) {
    const existingItem = cart.find((cartItem) => cartItem.id === itemId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    updateCartDisplay()
    renderCartPage()
    showSuccess(`${item.name} added to cart!`)
  }
}

function viewItemDetails(itemId) {
  // Simulate viewing item details
  const item = materials.find((m) => m.id === itemId) || recommendedItems.find((r) => r.id === itemId)
  if (item) {
    showSuccess(`Viewing details for ${item.name}`)
    // In a real app, this would navigate to a product detail page
  }
}

function saveForLater(itemId) {
  showSuccess("Item saved for later!")
  // In a real app, this would move the item to a "saved for later" list
}

function shareItem(itemId) {
  const item = cart.find((i) => i.id === itemId)
  if (item && navigator.share) {
    navigator.share({
      title: `Check out ${item.name} on SaathiBazar`,
      text: `Fresh ${item.name} for just ₹${item.price} per ${item.unit}`,
      url: window.location.href,
    })
  } else {
    showSuccess("Share link copied to clipboard!")
  }
}

function proceedToCheckout() {
  if (cart.length === 0) return

  const total =
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 2000 ? 0 : 50) +
    Math.round(
      (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
        (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 2000 ? 0 : 50)) *
        0.05,
    )

  alert(
    `🎉 Order placed successfully!\n\nTotal: ₹${total.toFixed(2)}\n\n📦 Your fresh materials will be delivered within 30 minutes!\n\n📱 You'll receive SMS updates about your order status.`,
  )

  // Clear cart and return to dashboard
  cart.length = 0
  showDashboard()
  showSuccess("Thank you for your order! 🙏")
}

// Make material cards clickable for details
function viewMaterialDetails(materialId) {
  const material = materials.find((m) => m.id === materialId)
  if (material) {
    showSuccess(`Viewing ${material.name} details`)
    // In a real app, this would show a detailed product page
  }
}

// Make stats clickable
function viewOrderHistory() {
  showSuccess("Order history feature coming soon!")
}

function viewMonthlyReport() {
  showSuccess("Monthly report feature coming soon!")
}

function viewPendingOrders() {
  showSuccess("Pending orders feature coming soon!")
}

// Add some interactive effects
document.addEventListener("click", (e) => {
  // Ripple effect for buttons
  if (e.target.matches("button") || e.target.closest("button")) {
    const button = e.target.matches("button") ? e.target : e.target.closest("button")

    // Skip ripple for certain buttons
    if (button.classList.contains("qty-btn") || button.classList.contains("remove-btn")) {
      return
    }

    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }
})

// Add CSS animation for ripple effect
const style = document.createElement("style")
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .list-view {
    grid-template-columns: 1fr !important;
  }
  
  .list-view .material-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
  }
  
  .list-view .material-header {
    margin-bottom: 0;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .list-view .material-name {
    margin-bottom: 0;
    flex: 1;
  }
  
  .list-view .material-price-row {
    margin-bottom: 0;
    flex-direction: column;
    align-items: flex-end;
  }
  
  .list-view .add-to-cart-btn {
    width: auto;
    padding: 0.5rem 1rem;
  }
`
document.head.appendChild(style)

// Smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth"

// Add loading states for better UX
function showLoading(element) {
  element.classList.add("loading")
  const originalContent = element.innerHTML
  element.innerHTML = '<span class="spinner"></span> Loading...'
  return originalContent
}

function hideLoading(element, originalContent) {
  element.classList.remove("loading")
  element.innerHTML = originalContent
}

// Initialize tooltips and other interactive elements
function initializeInteractiveElements() {
  // Add hover effects to material cards
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(".material-card")) {
      e.target.closest(".material-card").style.transform = "translateY(-4px)"
    }
  })

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".material-card")) {
      e.target.closest(".material-card").style.transform = "translateY(0)"
    }
  })
}

// Enhanced error handling
function showError(message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-toast"
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideInRight 0.3s ease-out;
  `

  document.body.appendChild(errorDiv)

  setTimeout(() => {
    errorDiv.remove()
  }, 3000)
}

// Add success toast
function showSuccess(message) {
  const successDiv = document.createElement("div")
  successDiv.className = "success-toast"
  successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #22c55e;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideInRight 0.3s ease-out;
  `

  document.body.appendChild(successDiv)

  setTimeout(() => {
    successDiv.remove()
  }, 3000)
}

// Add slide animation CSS
const additionalStyles = document.createElement("style")
additionalStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .error-toast, .success-toast {
    animation: slideInRight 0.3s ease-out;
  }
`
document.head.appendChild(additionalStyles)

// Update the explore page featured categories to match new structure
function updateExplorePage() {
  const exploreGrid = document.querySelector(".featured-grid")
  if (exploreGrid) {
    exploreGrid.innerHTML = `
      <div class="featured-card" onclick="selectCategoryAndGoToDashboard('vegetables')">
          <div class="featured-image">🥬</div>
          <h3>Fresh Vegetables</h3>
          <p>Farm-fresh vegetables delivered daily</p>
          <span class="featured-count">45+ items</span>
      </div>
      <div class="featured-card" onclick="selectCategoryAndGoToDashboard('fruits')">
          <div class="featured-image">🍎</div>
          <h3>Seasonal Fruits</h3>
          <p>Premium quality fruits from local farms</p>
          <span class="featured-count">32+ items</span>
      </div>
      <div class="featured-card" onclick="showGroceryOptions()">
          <div class="featured-image">🛒</div>
          <h3>Grocery Items</h3>
          <p>Essential grocery items for your business</p>
          <span class="featured-count">79+ items</span>
      </div>
      <div class="featured-card" onclick="selectCategoryAndGoToDashboard('all')">
          <div class="featured-image">🏪</div>
          <h3>All Materials</h3>
          <p>Browse our complete collection</p>
          <span class="featured-count">156+ items</span>
      </div>
    `
  }
}

// Show grocery options in explore page
function showGroceryOptions() {
  showDashboard()
  setTimeout(() => {
    toggleGroceryCategory()
  }, 300)
}
