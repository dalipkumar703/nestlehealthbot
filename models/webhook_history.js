var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('WebhookHistory',
               new Schema({   seq:Number,
                 text: String,

               }),
               'webhook_history');
