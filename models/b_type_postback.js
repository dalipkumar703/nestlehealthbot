var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var postbackSchema = new Schema({
  id:String,
  title: String,
  payload_for:String,
  payload:String
});

module.exports = mongoose.model('Postback', postbackSchema);
