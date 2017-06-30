var functionController = require('./functionController.js');
var _ = require('underscore');
var ReplyWithText = require('../models/reply_with_text.js');
var User = require('../models/user.js');
var PlainText = require('../models/reply_with_plain_text.js');
exports.portionGuidanceModulePostback = function(recipient, postback) {
  var title = [];
  var payload = [];
  if (postback === "PORTION_GUIDANCE") {
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("text for portion guidance:", data[0].text);
        ReplyWithText.find({
          payload_for: postback
        }).exec(function(err, result) {
          if (!err) {
            for (i = 0; i < _.size(result); i++) {
              title[i] = result[i].title;
              payload[i] = result[i].payload;
            }
            console.log("result:", result);
            functionController.replyWithTwoPayload(recipient, title, payload, data[0].text);
          } else {

          }
        });
      } else {
        console.log("error in plain text model");
      }
    });
  }
  if (postback === "LET_GO_PORTION") {
    console.log("let go portion");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
  if (postback === "TENNIS_BALL") {
    console.log("tennis ball");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
  if (postback === "CD") {
    console.log("CD");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
  if (postback === "CREDIT_CARD") {
    console.log("CREDIT_CARD");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
  if (postback === "PALM") {
    console.log("PALM");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
  if (postback === "DAL") {
    console.log("DAL");
    PlainText.find({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data:", data);
        functionController.replyWithPlainText(recipient, data[0].text);
      }
    })
  }
}

exports.portionGuidanceModuleTextMessage = function(recipient, text) {
  var title = [];
  var payload = [];
  var button_web_url = [];
  var text;
  if (/[1-9]?[0-9]+\srice/i.test(text)) {
    functionController.rice(recipient);
  }
  if (/[a-z]+\ssize/i.test(text)) {
    functionController.sizeChapatti(recipient);
  }
  if (/[a-z]+\scmp/i.test(text)) {
    functionController.compare(recipient);
  }
  if (/[a-z]+\smeat/i.test(text)) {
    functionController.meat(recipient);
  }
  if (/[1-9]?[0-9]+\sgram/i.test(text)) {
    functionController.gram(recipient);
  }
  if (/[1-9]?[0-9]+\slitre/i.test(text)) {
    console.log("litre");
  functionController.endAsking(recipient);
  }
}
