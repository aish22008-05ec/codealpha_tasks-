const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, 
  cart: [
    {
      title: String,
      price: String,
      image: String,
      quantity: Number
    }
  ],
  orders: [
    {
      items: [],
      total: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
