var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = new Schema({

  user_id: String,
  name: String,
  gender: String,
  is_bmr: Boolean,
  is_reminder: Boolean
});

module.exports = mongoose.model('User', userSchema);
