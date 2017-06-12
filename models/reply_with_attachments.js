var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var replyWithAttachmentsSchema = new Schema({
  id:String,
  title: String,
  subtitle:String,
  image_url:String,
  button_type: String

});

module.exports = mongoose.model('replyWithAttachments', replyWithAttachmentsSchema);
