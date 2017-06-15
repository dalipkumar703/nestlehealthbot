var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('ReplyWithText',
               new Schema({
                 text:String,
                 payload:String,
                 payload_for:String,
                 title:String
               }),
               'reply_with_text');
