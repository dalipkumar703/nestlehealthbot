var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var apiai=require('apiai');
mongoose.Promise = require('bluebird');
var request = require('request');
var dotenv = require('dotenv');
var api = require('./api.js');
var User = require('../models/user.js');
var Bot = require('../models/bot.js');
var functionController = require('./functionController.js');
var _ = require('underscore');
var textMsg;
var userName;
var noOfUser;
var checkData;
var user;
dotenv.load();
//console.log(process.env.API_AI_CLIENT);
var apiapp = apiai(process.env.API_AI_CLIENT);
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
  //app.get('/user', api.post);
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
            if (event.postback.payload === "HI_GOT_IT") {
              var botmessage = Bot.find({}).exec(function(err, result) {
                if (!err) {
                  // handle result
                  //console.log("bot message :",result[0].image_url);
                  var image_url = result[0].image_url;
                  var title = result[0].subtitle;
                  var payload = "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN";
                  var button_title = result[0].subtitle;
                  //  replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
                  functionController.replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
                } else {
                  // error handling
                  console.log("error in find command");
                };
              });

              //console.log("bot database reply:",botmessage);
              //  replyWithAttachments(event.sender.id);
            }
            if (event.postback.payload === "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN") {
              //quickReply(event.sender.id);
              functionController.quickReply(event.sender.id);
            }
          } else if (event.message && event.message.attachments) {
            console.log("message with attachments");


                   let apiai = apiapp.textRequest("How are you?", {
                    sessionId: 'tabby_cat' // use any arbitrary id
                  });
                  apiai.on('response', (response) => {
                     // Got a response from api.ai. Let's POST to Facebook Messenger
                     let aiText = response.result.fulfillment.speech;
                     console.log("Api ai reply:",aiText);
                   });

                   apiai.on('error', (error) => {
                     console.log("error in api ai:",error);
                   });


                      } else if (event.message && event.message.text) {
            // message is quick reply type
            if (event.message.quick_reply) {

              if (event.message.quick_reply.payload === "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN") {
                //quickReply(event.sender.id);
                functionController.quickReply(event.sender.id);
              }
            } else {
              //message is text type
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
                  User.findOne({
                    user_id: event.sender.id
                  }).exec(function(err, result) {
                    if (!err) {
                      // handle result
                      //textMsg = event.message.text + " " + result.name;
                      //console.log("function scope textMsg:", textMsg);
                      //receivedMessage(event, textMsg)
                      //console.log("length of user:",_.size(result));
                      if (_.size(result) == 0) {
                        User({
                          user_id: event.sender.id,
                          name: userName,
                          gender: gender,
                          is_bmr: false,
                          is_reminder: false
                        }).save(function(err, data) {
                          if (err) throw err;
                          console.log("user store:", data);
                        });
                        textMsg = event.message.text + " " + userName;
                        //receivedMessage(event, textMsg);
                        functionController.receivedMessage(event, textMsg);
                      } else {
                        textMsg = event.message.text + " " + result.name;
                        //receivedMessage(event, textMsg);
                        functionController.receivedMessage(event, textMsg);
                      }
                    } else {
                      // error handling
                      console.log("error in find command");
                    };
                  });
                } else {
                  console.error("Unable to send message.");
                  //  console.error(response);
                  //  console.error(error);
                }
                console.log("hello");
              });
            }
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
}
