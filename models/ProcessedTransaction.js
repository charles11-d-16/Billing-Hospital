const mongoose = require('mongoose');

const processedSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  birthday: Date,
  address: String,
  gender: String,
  originalTotal: Number,
  adjustedTotal: Number,
  isSenior: Boolean,
  isResident: Boolean,
  philHealthAmount: Number,
  dateProcessed: {
    type: Date,
    default: Date.now
  },
  transactions: [
    {
      transactionNumber: String,
      date: Date,
      transactionType: String,
      description: String,
      unitAmount: Number,
      quantity: Number,
      totalAmount: Number
    }
  ]
});

module.exports = mongoose.model('ProcessedTransaction', processedSchema);
