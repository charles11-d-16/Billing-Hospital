
const mongoose = require('mongoose');

const transactionTypeSchema = new mongoose.Schema({
  type: String,
  descriptions: [
    {
      name: String,
      unitAmount: Number
    }
  ]
});

module.exports = mongoose.model('TransactionType', transactionTypeSchema);
