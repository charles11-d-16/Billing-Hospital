
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: String,
  name: String,
  birthday: Date,
  address: String,
  gender: String
});

module.exports = mongoose.model('Patient', patientSchema);
