var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('ButtonTypePostback',
               new Schema({
                  id:String,
                 title: String,
                 payload_for:String,
                 payload:String
               }),
               'b_t_for_postback');
