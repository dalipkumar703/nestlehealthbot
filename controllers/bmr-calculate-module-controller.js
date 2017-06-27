var functionController = require('./functionController.js');
var UserPersonal = require('../models/user_personal.js');
var ReplyWithAttachments = require('../models/reply_with_attachments.js');
var _ = require('underscore');
var ReplyWithText = require('../models/reply_with_text.js');
var User = require('../models/user.js');
var ReplyWithImageOnly = require('../models/reply_with_image_only.js');
var PlainText = require('../models/reply_with_plain_text.js');
var request = require('request');
var dotenv = require('dotenv');
dotenv.load();

exports.postback = function(recipient, postback) {
  var title = [];
  var payload = [];
  var msg;
  if (postback === "USER_DETAIL_CONFIRM") {
    ReplyWithAttachments.find({
      payload_for: postback
    }).exec(function(err, result) {

      functionController.callReplyWithAttachments(result, err, recipient);
    });
    PlainText.findOne({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        console.log("data from user detail confirm", data);
        functionController.replyWithPlainText(recipient, data.text);
      } else {
        console.log("err in user detail confirm");
      }
    });
  }
  if (postback === "GOT_IT_RUNNING_STATUS") {
    console.log("got it running status");
    User.findOne({
      user_id: recipient
    }).exec(function(err, data) {
      if (!err) {
        console.log("is brm", data.is_bmr);
        if (data.is_bmr) {
          UserPersonal.find({
            user_id: recipient
          }).exec(function(err, data) {
            if (!err) {
              msg = "Great! You need " + data[0].bmr + " calories per day to maintain your weight.";
              title[0] = process.env.BMR_TITLE;
              payload[0] = process.env.BMR_PAYLOAD;
              title[1] = process.env.BMR_EDIT_TITLE;
              payload[1] = process.env.BMR_EDIT_PAYLOAD;
              functionController.replyWithTwoPayload(recipient, title, payload, msg);
            }
          })

        } else {
          functionController.replyWithPlainText(recipient, process.env.ASK_FOR_AGE);
        }
      }

    });
  }
  if (postback === "VERY_ACTIVE_EXERCISE" || postback === "MODERATE_EXERCISE" || postback === "LIGHTLY_EXERCISE" || postback === "SEDENTRY_EXERCISE") {
    console.log("exercise type");
    console.log("payload value:", postback);
    var exercise;
    if (postback === "VERY_ACTIVE_EXERCISE") {
      exercise =process.env.ACTIVE ;
    } else if (postback === "MODERATE_EXERCISE") {
      exercise = process.env.MODERATELY_ACTIVE;
    } else if (postback === "LIGHTLY_EXERCISE") {
      exercise = process.env.LIGHTLY_ACTIVE;
    } else if (postback === "SEDENTRY_EXERCISE") {
      exercise = process.env.SEDENTARY;
    }
    User.findOne({
      user_id: recipient
    }).exec(function(err, result) {
      if (!err) {

        UserPersonal.findOne({
          user_id: recipient
        }).exec(function(err, data) {
          if (!err) {
            console.log("data:", data);
            console.log("user data:", result.gender);
            console.log("exercise type:", exercise);
            request({
              url: process.env.BMR_CALCULATE_URL + result.gender + "&height=" + data.height + "&age=" + data.age + "&userId=" + recipient + "&weight=" + data.weight + "&exerciseLevel=" + exercise,
              method: "GET"
            }, function(error, response, body) {
              if (!error) {
                var resultExercise = JSON.parse(response.body);
                console.log("bmr = " + resultExercise.set_variables.bmr + "Calories");
                if (resultExercise.set_variables.bmr) {

                  User.update({
                    user_id: recipient
                  }, {
                    $set: {
                      is_bmr: true
                    }
                  }).exec(function(err, data) {
                    if (!err) {
                      console.log("update user value:", data);
                      UserPersonal.update({
                        user_id: recipient
                      }, {
                        $set: {
                          bmr: resultExercise.set_variables.bmr
                        }
                      }).exec(function(err, data) {
                        if (!err) {
                          console.log("updated value", data);
                        }
                      })
                    }
                  })
                }
                msg = "Great! You need " + resultExercise.set_variables.bmr + " calories per day to maintain your weight.";
                title[0] = process.env.BMR_TITLE;
                payload[0] = process.env.BMR_PAYLOAD;
                functionController.receivedMessage(recipient, title, payload, msg);
              } else {
                console.error("Unable to send message.");
                //console.error(response);
                console.error(error);
              }
              console.log("hello");


            });
          } else {
            console.log("error in  user personal");
          }


        });
      } else {
        console.log("error in user model");
      }

    });

  }
  if (postback === "EDIT_USER_DETAIL") {
    functionController.replyWithPlainText(recipient, process.env.ASK_FOR_AGE);
  }
}
exports.quickReplyPostback = function(recipient, postback) {
  var title = [];
  var payload = [];
  if (postback === "NOT_DECIDED" || postback === "BEGINNER" || postback === "HALF_MARATHON" || postback === "FULL_MARATHON") {
    ReplyWithText.find({
      $or: [{
          payload_for: "NOT_DECIDED"
        },
        {
          payload_for: "BEGINNER"
        },
        {
          payload_for: "HALF_MARATHON"
        },
        {
          payload_for: "FULL_MARATHON"
        }
      ]
    }).exec(function(err, result) {
      if (!err) {
        console.log("reply with text result:", result[0].payload);
        title[0] = process.env.TITLE;
        payload[0] = result[0].payload;
        functionController.receivedMessage(recipient, title, payload, result[0].text);

      } else {
        console.log("error in reply with text result");
      }
    });

  }
}
exports.TextMessage = function(recipient, text) {
  var title = [];
  var payload = [];
  if (/[1-9][0-9]?\sage/i.test(text)) {
    var textmsg = text;
    var num = textmsg.match(/\d/g);
    numb = num.join("");
    //  console.log(numb);
    UserPersonal.find({
      user_id: recipient
    }).exec(function(err, result) {
      if (!err) {
        if (_.size(result) == 0) {
          UserPersonal({
            user_id: recipient,
            age: numb
          }).save(function(err, data) {
            if (!err) {
              //console.log("age is saved in database.");
              functionController.replyWithPlainText(recipient, process.env.ASK_FOR_HEIGHT);
            } else {
              console.log("age is not saved.");
            }
          });
        } else {
          UserPersonal.update({
            user_id: recipient
          }, {
            $set: {
              age: numb
            }
          }).exec(function(err, data) {
            if (!err) {
              //console.log("height is saved in database.");
              functionController.replyWithPlainText(recipient, process.env.ASK_FOR_HEIGHT);
            } else {
              console.log("height is not saved.");
            }
          });
        }
      } else {
        console.log("error in userpersonal");
      }
    })
  }
  if (/[1-9][0-9]?\sfeet,?[1-9]?[0-9]?\s?i?n?c?h?e?s?/i.test(text)) {
    var textmsg = text;
    var num = textmsg.match(/\d/g);
    numb = num.join("");
    UserPersonal.update({
      user_id: recipient
    }, {
      $set: {
        height: numb
      }
    }).exec(function(err, data) {
      if (!err) {
        //console.log("height is saved in database.");
        functionController.replyWithPlainText(recipient, process.env.ASK_FOR_WEIGHT);
      } else {
        console.log("height is not saved.");
      }
    });
  }
  if (/[1-9][0-9]?[0-9]?\sKg/i.test(text)) {
    var textmsg = text;
    var num = textmsg.match(/\d/g);
    numb = num.join("");
    UserPersonal.update({
      user_id: recipient
    }, {
      $set: {
        weight: numb
      }
    }).exec(function(err, data) {
      if (!err) {
        UserPersonal.findOne({
          user_id: recipient
        }).exec(function(err, data) {
          if (!err) {
            textMsg = "You entered - Age(" + data.age + "), Weight (" + data.weight + "), Height (" + data.height + ")";
            title[0] = process.env.TITLE_OK;
            title[1] = process.env.BMR_EDIT_TITLE;
            payload[0] = process.env.PAYLOAD_USER_DETAIL_CONFIRM;
            payload[1] = process.env.PAYLOAD_EDIT_USER_DETAIL;
            functionController.replyWithTwoPayload(recipient, title, payload, textMsg);
          } else {
            console.log("problem fetching from user detail.");
          }
        })
        // console.log("weight is saved in database.");
        //textMsg=You entered - Age(40), Weight (45), Height (5)
        //functionController.replyWithTwoPayload(event,title,payload,textMsg);
      } else {
        console.log("height is not saved.");
      }
    });

  }
}
