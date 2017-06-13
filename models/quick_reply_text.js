var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('QuickReplyText',
               new Schema({   payload_for:String,
                 text: String,

               }),
               'quick_reply_text');
