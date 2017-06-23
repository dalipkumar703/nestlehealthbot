var request = require('request');
var _ = require('underscore');
var schedule = require('node-schedule');
var User = require('../models/user.js');
var functionController = require('../controllers/functionController.js');
exports.callReminder=function()
{
  schedule.scheduleJob('* * 1 * * *', function(){
    //console.log('The answer to life, the universe, and everything!');
   User.find({is_bmr:true}).exec(function(err,data){
     if(!err)
     {
       console.log("user data:",data);
       for(var i=0;i<_.size(data);i++)
       {
         var text="hi";
         var id=data[i].user_id;
         functionController.sayHi(id,text);
       }
     }
   })
  });
}
