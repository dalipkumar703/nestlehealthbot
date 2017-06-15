var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('PlainText',
               new Schema({
                 text:String,
                 payload_for:String
               }),
               'reply_with_plain_text');
