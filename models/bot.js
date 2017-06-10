var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



module.exports =mongoose.model('Bot',
               new Schema({ message: String, subtitle: String, item_url: String,image_url:String}),
               'botReply');
