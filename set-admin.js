// Save this as set-admin.js and run with Node.js
// npm install mongodb
const { MongoClient, ObjectId } = require("mongodb")

async function setAdminStatus() {
  // Replace with your MongoDB connection string
  const uri =
    "mongodb+srv://aaml1603:Doral11386.@cluster0.lwei9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("humanize_ai")
    const accounts = db.collection("accounts")

    // Replace with your email
    const userEmail = "your-email@example.com" // Replace with your actual email

    // Find the user
    const user = await accounts.findOne({ email: userEmail })

    if (!user) {
      console.error(`User with email ${userEmail} not found`)
      return
    }

    console.log("Current user:", user)
    console.log("Current admin status:", user.is_admin)

    // Update the user to be an admin
    const result = await accounts.updateOne({ email: userEmail }, { $set: { is_admin: true } })

    console.log(`Updated ${result.modifiedCount} document(s)`)

    // Verify the update
    const updatedUser = await accounts.findOne({ email: userEmail })
    console.log("Updated admin status:", updatedUser.is_admin)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

setAdminStatus().catch(console.error)

