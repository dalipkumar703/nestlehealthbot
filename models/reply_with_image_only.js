var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('ReplyWithImageOnly',
               new Schema({   id:String,
                 payload_for:String,
                 url:String

               }),
               'ReplyWithImageOnly');
