// Save this as check-admin-token.js and run with Node.js
// npm install jsonwebtoken
const jwt = require("jsonwebtoken")

// Get your token from localStorage in the browser and paste it here
const token = "YOUR_TOKEN_HERE" // Replace with your actual token

try {
  // The secret key should match the one in your Flask app
  const decoded = jwt.decode(token) // Just decode without verification for debugging
  console.log("Decoded token:", decoded)
  console.log("Is admin claim:", decoded.is_admin)
  console.log("User ID:", decoded.sub) // 'sub' is the user ID in JWT
} catch (error) {
  console.error("Error decoding token:", error)
}

