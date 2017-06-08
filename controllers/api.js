var User = require('../models/user.js');


exports.post = function(req,res) {
    new User({user_id:"123", name:"dalipt",is_bmr:true,is_reminder:true}).save();
    res.sendStatus(200);
}
