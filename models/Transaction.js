
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: String,
  patientId: String,
  patientName: String,
  birthday: Date,       
  address: String,      
  gender: String,
  transactionType: String,
  description: String,
  unitAmount: Number,
  quantity: Number,
  totalAmount: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
