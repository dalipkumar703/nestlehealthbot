var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var dotenv = require('dotenv');
var api = require('./api.js');
var User = require('../models/user.js');
var Bot = require('../models/bot.js');
var textMsg;

dotenv.load();
var db = process.env.DB_URL;
console.log(db);
mongoose.connect(db);
module.exports = function(app) {
  app.use(bodyParser.urlencoded({
    extended: false
  }))

  // parse application/json
  app.use(bodyParser.json())
  //api calls
  app.get('/user', api.post);
  app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.HUB_VERIFY) {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);
    }
  });
  app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        //page ID used by the Data comes from Facebook
        var pageID = entry.id;
        //timeEvent of Data used from facebook
        var timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {

          if (event.postback) {
            if (event.postback.payload === "USER_DEFINED_PAYLOAD") {
              var botmessage = Bot.find({}).exec(function(err, result) {
                if (!err) {
                  // handle result
                  //console.log("bot message :",result[0].image_url);
                  var image_url = result[0].image_url;
                  var title = result[0].subtitle;
                  var payload = "payload bot";
                  var button_title = result[0].subtitle;
                  replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
                } else {
                  // error handling
                  console.log("error in find command");
                };
              });

              //console.log("bot database reply:",botmessage);
              //  replyWithAttachments(event.sender.id);
            }
            if (event.postback.payload === "Payload for first bubble") {
              quickReply(event.sender.id);
            }


          } else if (event.message && event.message.attachments) {
            console.log("message with attachments");
          } else if (event.message && event.message.text) {
            // message is quick reply type
            if (event.message.quick_reply) {

              if (event.message.quick_reply.payload === "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN") {
                quickReply(event.sender.id);
              }
            } else {
              //message is not quick reply
              //console.log("type of message:",event.message.quick_reply);
              //console.log("quick_reply:",message);
              //console.log("MESSAGE OBJECT",event.message[0].quick_reply);


              request({
                url: "https://graph.facebook.com/v2.6/1215082925284543",
                qs: {
                  access_token: process.env.FACEBOOK_TOKEN,
                },
                method: "GET"
              }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  var parsed = JSON.parse(response.body);
                  var userName = parsed.first_name;
                  var gender = parsed.gender;
                  //STORE USER DETAIL INTO USER COLLECTION

                  var newUser = User({
                    user_id: event.sender.id,
                    name: userName,
                    gender: gender,
                    is_bmr: false,
                    is_reminder: false
                  }).save(function(err, data) {
                    if (err) throw err;
                    console.log("user store:", data);
                  });
                  //  console.log(newUser);
                  // console.log(parsed);
                } else {
                  console.error("Unable to send message.");
                  //  console.error(response);
                  //  console.error(error);
                }
                console.log("hello");


              });


              //	User({user_id:event.sender.id,name:})

              User.findOne({
                user_id: event.sender.id
              }).exec(function(err, result) {
                if (!err) {
                  // handle result
                  textMsg = event.message.text + " " + result.name;
                  console.log("function scope textMsg:", textMsg);
                  receivedMessage(event, textMsg)
                } else {
                  // error handling
                  console.log("error in find command");
                };
              });
            }

            //console.log("text:",textMsg);
            //receivedMessage(event,textMsg)
          }

        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.sendStatus(200);
    }
  });

  //  message for quick reply
  function quickReply(recipient) {
    var messageData = {
      recipient: {
        id: recipient
      },
      message: {
        "text": "Pick a color:",
        "quick_replies": [{
            "content_type": "text",
            "title": "Red",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
          },
          {
            "content_type": "text",
            "title": "Green",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
          }
        ]
      }
    };
    callSendAPI(messageData);
  }

  //reply with attachments
  function replyWithAttachments(recipient, image_url, title, payload, button_title) {
    var messageData = {
      recipient: {
        id: recipient
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: title,
              image_url: image_url,
              buttons: [{
                type: "postback",
                title: "Call Postback",
                payload: payload,
              }],
            }, {
              title: title,
              image_url: image_url,
              buttons: [{
                type: "postback",
                title: "Call Postback",
                payload: payload + "1",
              }]
            }]
          }
        }

      }

    };
    callSendAPI(messageData);
  }

  function receivedMessage(event, textMsg) {
    // Putting a stub for now, we'll expand it in the following steps
    var messageData = {
      recipient: {
        id: event.sender.id
      },
      message: {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": textMsg,
            "buttons": [{
              "type": "postback",
              "title": "Got it",
              "payload": "USER_DEFINED_PAYLOAD"
            }]
          }
        }
      }
    };
    callSendAPI(messageData);
    //console.log("Message data: ", event.message);
  }

  function callSendAPI(messageData) {
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: process.env.FACEBOOK_TOKEN
      },
      method: "POST",
      json: messageData
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;

        console.log("Successfully sent generic message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.error("Unable to send message.");
        //console.error(response);
        //console.error(error);
      }
      console.log("hello");


    });

  }
}
