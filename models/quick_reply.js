var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var quickReplySchema = new Schema({
  payload:String,
  title:String,
  payload_for:String
});

module.exports = mongoose.model('QuickReply', quickReplySchema);
