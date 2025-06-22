const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  staffId: String,
  firstName: String,
  middleInitial: String,
  surname: String,
  birthday: Date,
  address: String,
  email: String,
  password: String 
});

module.exports = mongoose.model('Staff', staffSchema);
