var functionController = require('./functionController.js');
var _ = require('underscore');
var ReplyWithText = require('../models/reply_with_text.js');
var User = require('../models/user.js');
var ReplyWithImageOnly = require('../models/reply_with_image_only.js');
var PlainText = require('../models/reply_with_plain_text.js');
var dotenv = require('dotenv');
dotenv.load();
exports.gameModulePostback = function(recipient, postback) {
  var payload = [];
  var title = [];
  if (postback === "PLAY_GAME") {
    console.log("play game");
    User.findOne({
      user_id: recipient
    }).exec(function(err, data) {
      if (!err) {
        console.log("user name:", data);
        ReplyWithText.find({
          payload_for: postback
        }).exec(function(err, result) {
          if (!err) {
            //  console.log("play game data",result);
            for (var i = 0; i < _.size(result); i++) {
              payload[i] = result[i].payload;
              title[i] = result[i].title;
            }
            var msg;
            msg = "Hey " + data.name + ", time for a little game🎮";
            functionController.replyWithTwoPayload(recipient, title, payload, msg);
          }
        })
      }

    })
  }
  if (postback === "START_GAME") {
    console.log("start game");

    ReplyWithImageOnly.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.callSendImageOnly(recipient, data[0].url);
      }
    });
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("text from plain reply", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    });
  }
}
exports.gameModuleTextMessage = function(recipient, message) {
  var payload = [];
  var title = [];
  var button_web_url = [];
  var button_web_title = [];
  if (/[1-9][0-9]+\scalorie/i.test(message)) {
    console.log("pizza calorie");
    functionController.pizzaCalorie(recipient);
  }
}
