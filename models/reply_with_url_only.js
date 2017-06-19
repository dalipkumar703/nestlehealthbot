var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('ReplyWithUrlOnly',
               new Schema({
                 title: String,
                 subtitle:String,
                 image_url:String,
                 button_type: String,
                 payload_for:String,
                 b_t_w_title:String,
                 b_t_w_url:String
               }),
               'ReplyWithUrlOnly');
