var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var webUrlSchema = new Schema({
  id:String,
  url:String,
  title: String
});

module.exports = mongoose.model('WebUrl', webUrlSchema);
