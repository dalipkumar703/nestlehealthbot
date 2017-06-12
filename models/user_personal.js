var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userPersonalSchema = new Schema({

  user_id: String,
  age: String,
  height: String,
  weight: String,
  bmr: String
});

module.exports = mongoose.model('UserPersonal', userPersonalSchema);
