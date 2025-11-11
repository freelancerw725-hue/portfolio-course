require("dotenv").config();
const Razorpay = require("razorpay");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);

app.post("/order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: 199 * 100, // paisa me amount
      currency: "INR",
      receipt: "receipt_order_1",
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

// Save customer data after payment
app.post("/save-customer", async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    if (!name || !email || !mobile) {
      return res.status(400).json({ error: "Name, email, and mobile are required" });
    }
    const customer = new Customer({ name, email, mobile });
    await customer.save();
    res.json({ message: "Customer saved successfully" });
  } catch (error) {
    console.error("Error saving customer:", error);
    res.status(500).json({ error: "Failed to save customer" });
  }
});

// Get all customers for admin dashboard
app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
