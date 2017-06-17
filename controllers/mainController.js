var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var apiai = require('apiai');
var Regex = require('regex');
mongoose.Promise = require('bluebird');
var request = require('request');
var dotenv = require('dotenv');
var api = require('./api.js');
var User = require('../models/user.js');
var Bot = require('../models/bot.js');
var QuickReply = require('../models/quick_reply.js');
var UserPersonal = require('../models/user_personal.js');
var ReplyWithText = require('../models/reply_with_text.js');
var ReplyWithAttachments = require('../models/reply_with_attachments.js');
var QuickReplyText = require('../models/quick_reply_text.js');
var ReplyWithUrl = require('../models/reply_with_url.js');
var PlainText = require('../models/reply_with_plain_text.js');
var functionController = require('./functionController.js');
var _ = require('underscore');
var textMsg;
var userName;
var noOfUser;
var checkData;
var user;
var image_url = [];
var title = [];
var payload = [];
var button_title = [];
var button_web_title=[];
var button_web_url=[];
var replyMessageWithAttachments;
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
            if (event.postback.payload === "GOT_IT") {
              /*
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
              */
              ReplyWithAttachments.find({
                payload_for: "GOT_IT"
              }).exec(function(err, result) {

              functionController.callReplyWithAttachments(result,err,event);
              });

            }
            if (event.postback.payload === "GOT_IT_RUNNING_STATUS" || event.postback.payload === "EDIT_USER_DETAIL") {
              console.log("got it running status");
              functionController.replyWithPlainText(event, process.env.ASK_FOR_AGE);
            }
            if (event.postback.payload === "VERY_ACTIVE_EXERCISE" ||event.postback.payload === "MODERATE_EXERCISE" || event.postback.payload ==="LIGHTLY_EXERCISE" || event.postback.payload ==="SEDENTRY_EXERCISE") {
              console.log("exercise type");
              console.log("payload value:",event.postback.payload);
              var exercise;
              if (event.postback.payload === "VERY_ACTIVE_EXERCISE") {
                exercise = "Active";
              }
              else if (event.postback.payload === "MODERATE_EXERCISE"){
                  exercise = "Moderately_Active";
              }
              else if (event.postback.payload === "LIGHTLY_EXERCISE") {
                exercise = "Lightly_Active";
              }
              else if (event.postback.payload === "SEDENTRY_EXERCISE") {
                exercise = "Sedentary";
              }
              User.findOne({
                user_id: event.sender.id
              }).exec(function(err, result) {
                if (!err) {

                  UserPersonal.findOne({
                    user_id: event.sender.id
                  }).exec(function(err, data) {
                    if (!err) {
                      console.log("data:", data);
                      console.log("user data:", result.gender);
                      console.log("exercise type:",exercise);
                      request({
                        url: "http://54.236.50.54/1.2/Calculatebmr?gender="+result.gender+"&height="+data.height+"&age="+data.age+"&userId="+event.sender.id+"&weight="+data.weight+"&exerciseLevel="+exercise,
                        method: "GET"
                      }, function(error, response, body) {
                        if (!error) {
                          var resultExercise = JSON.parse(response.body);
                          console.log("bmr = " + resultExercise.set_variables.bmr + "Calories");
                          msg = "Great! You need " + resultExercise.set_variables.bmr + " calories per day to maintain your weight.";
                          title[0] = "Next";
                          payload[0] = "SHOWED_CALORIE";
                          functionController.receivedMessage(event, title, payload, msg);
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
            if (event.postback.payload === "USER_DETAIL_CONFIRM") {
              //console.log("user detail confirm");

              ReplyWithAttachments.find({
                payload_for: "USER_DETAIL_CONFIRM"
              }).exec(function(err, result) {

                functionController.callReplyWithAttachments(result,err,event);
              });
              PlainText.findOne({
                payload_for: "USER_DETAIL_CONFIRM"
              }).exec(function(err, data) {
                if (!err) {
                  console.log("data from user detail confirm", data);
                  functionController.replyWithPlainText(event, data.text);
                } else {
                  console.log("err in user detail confirm");
                }
              });
              //functionController.replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
            }
            if(event.postback.payload==="SHOWED_CALORIE")
            {
                    //console.log("show calorie ");
                    PlainText.findOne({payload_for:"SHOWED_CALORIE"}).exec(function(err,data){
                      if(!err)
                      {
                        functionController.replyWithPlainText(event,data.text);
                      }
                      else {
                        console.log("error in plain text retrieval");
                      }
                    });
                    ReplyWithAttachments.find({payload_for:"SHOWED_CALORIE"}).exec(function(err,result){
                      if(!err)
                      {
                        console.log("result:",result);
                        functionController.callReplyWithAttachments(result,err,event);
                      }
                      else {
                        console.log("error in reply with attachements ");
                      }
                    })
            }
            if(event.postback.payload==="MAKE_DIET_PLAN")
            {
              console.log("diet plan");

              QuickReply.find({
                payload_for: "MAKE_DIET_PLAN"
              }).exec(function(err, result) {
                if (!err) {
                  //  console.log("quick reply result:",result);
                  for (var i = 0; i < _.size(result); i++) {
                    title[i] = result[i].title;
                    payload[i] = result[i].payload;
                  }
                  QuickReplyText.find({
                    payload_for: "MAKE_DIET_PLAN"
                  }).exec(function(err, result) {
                    if (!err) {
                      //console.log("quick reply with text:",result[0]);
                      functionController.quickReply(event.sender.id, title, payload, result[0].text);
                    } else {
                      console.log("error in quick reply with text");
                    }
                  });
                } else {
                  console.log("error in quick reply data fetching.");
                }
              })

            // functionController.callQuickReply(event.postback.payload,event);
                        }
            if (event.postback.payload === "GET_STARTED") {
              //quickReply(event.sender.id);TEXT,TITLE,PAYLOAD
              //functionController.quickReply(event.sender.id);
              QuickReply.find({
                payload_for: "GET_STARTED"
              }).exec(function(err, result) {
                if (!err) {
                  //  console.log("quick reply result:",result);
                  for (var i = 0; i < _.size(result); i++) {
                    title[i] = result[i].title;
                    payload[i] = result[i].payload;
                  }
                  QuickReplyText.find({
                    payload_for: "GET_STARTED"
                  }).exec(function(err, result) {
                    if (!err) {
                      //console.log("quick reply with text:",result[0]);
                      functionController.quickReply(event.sender.id, title, payload, result[0].text);
                    } else {
                      console.log("error in quick reply with text");
                    }
                  });
                } else {
                  console.log("error in quick reply data fetching.");
                }
              })
            }
          } else if (event.message && event.message.attachments) {
            console.log("message with attachments");


            let apiai = apiapp.textRequest("Hello", {
              sessionId: '5d8d89a6-aa6f-4f56-947a-4003e53277c4' // use any arbitrary id
            });
            apiai.on('response', (response) => {
              // Got a response from api.ai. Let's POST to Facebook Messenger
              let aiText = response.result.fulfillment.speech;
              console.log("Api ai reply:", aiText);
            });

            apiai.on('error', (error) => {
              console.log("error in api ai:", error);
            });
            apiai.end();

          } else if (event.message && event.message.text) {
            // message is quick reply type
            if (event.message.quick_reply) {

              if (event.message.quick_reply.payload === "NOT_DECIDED" ||event.message.quick_reply.payload ===  "BEGINNER" ||event.message.quick_reply.payload ===  "HALF_MARATHON" ||event.message.quick_reply.payload ===  "FULL_MARATHON") {
                //quickReply(event.sender.id);
                //functionController.quickReply(event.sender.id);
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
                    title[0] = "Got it";
                    payload[0] = result[0].payload;
                    functionController.receivedMessage(event, title, payload, result[0].text);

                  } else {
                    console.log("error in reply with text result");
                  }
                });
              }
              if(event.message.quick_reply.payload === "VEGAN_DIET" || event.message.quick_reply.payload ==="VEG_DIET" ||event.message.quick_reply.payload === "EGG_DIET" ||event.message.quick_reply.payload === "NON_VEG_DIET")
              {
                //console.log("diet call");
                User.findOne({user_id:event.sender.id}).exec(function(err,data){
                  if(!err)
                  {
                    console.log("user:",data);
                    var text="Hey "+data.name+", here'\s your weekly diet plan. Also check your race day and recovery diet.";
                    functionController.replyWithPlainText(event, text);
                  }
                  else {
                    console.log("error in finding user");
                  }
                });
              ReplyWithUrl.find({
                $or: [{
                    payload_for: "VEGAN_DIET"
                  },
                  {
                    payload_for: "VEG_DIET"
                  },
                  {
                    payload_for: "EGG_DIET"
                  },
                  {
                    payload_for: "NON_VEG_DIET"
                  }
                ]
              }).exec(function(err,result){
                if(!err)
                {
                  //console.log("result:",result);
                  for(var i=0;i<_.size(result);i++)
                  {
                    title[i]=result[i].title;
                    image_url[i]=result[i].image_url;
                    button_title[i]=result[i].b_t_p_title;
                    payload[i]=result[i].b_t_p_payload;
                    button_web_title[i]=result[i].b_t_w_title;
                    var str=result[i].b_t_w_url;
                     var btw_url=str.split(",");

                     if(event.message.quick_reply.payload=="VEG_DIET")
                     {
                      button_web_url[i]=btw_url[0];
                     console.log("button web url:",button_web_url[i]);
                     }
                    if(event.message.quick_reply.payload=="VEGAN_DIET")
                    {
                      button_web_url[i]=btw_url[1];
                     console.log("button web url:",button_web_url[i]);
                    }

                    if(event.message.quick_reply.payload=="EGG_DIET")
                    {
                      button_web_url[i]=btw_url[2];
                     console.log("button web url:",button_web_url[i]);
                    }
                    if(event.message.quick_reply.payload=="NON_VEG_DIET")
                    {
                      button_web_url[i]=btw_url[3];
                     console.log("button web url:",button_web_url[i]);
                    }

                  //  console.log("result[i].btwurl",result[i].b_t_w_url);
                }
                  //functionController.replyWithUrl(event.sender.id, image_url, title, payload, button_title,button_web_title,button_web_url);
                }
                else {

                }
              })

               }
            } else {
              //message is text type
              request({
                url: "https://graph.facebook.com/v2.6/"+event.sender.id,
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
                      title[0] = "Got it";
                      payload[0] = "GOT_IT";
                      var re = new Regex(/[1-99][Age]+/);
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
                        if (/[1-9][0-9]?age/i.test(event.message.text)) {
                          //console.log("age is correct");
                          var textmsg = event.message.text;
                          var num = textmsg.match(/\d/g);
                          console.log(num);
                        } else {
                          textMsg = event.message.text + " " + userName+", get fit with Nestle, your companion to good health.";
                          //receivedMessage(event, textMsg);title,payload
                          functionController.replyWithPlainText(event,textMsg);
                          textMsg1="You need a variety of nutrients to strengthen your performance and endurance. Let's guide you on daily nutrition. To start over type \"Hi\" any time.";
                          functionController.receivedMessage(event, title, payload, textMsg1);

                        }

                      } else {

                        if (/[1-9][0-9]?age/i.test(event.message.text)) {
                          //save age of user
                          var textmsg = event.message.text;
                          var num = textmsg.match(/\d/g);
                          numb = num.join("");
                          //  console.log(numb);
                          UserPersonal.find({user_id:event.sender.id}).exec(function(err,result){
                            if(!err)
                            {
                              if(_.size(result)==0)
                              {
                                UserPersonal({
                                  user_id: event.sender.id,
                                  age: numb
                                }).save(function(err, data) {
                                  if (!err) {
                                    //console.log("age is saved in database.");
                                    functionController.replyWithPlainText(event, process.env.ASK_FOR_HEIGHT);
                                  } else {
                                    console.log("age is not saved.");
                                  }
                                });
                              }
                              else {
                                UserPersonal.update({
                                  user_id: event.sender.id
                                }, {
                                  $set: {
                                    age: numb
                                  }
                                }).exec(function(err, data) {
                                  if (!err) {
                                    //console.log("height is saved in database.");
                                    functionController.replyWithPlainText(event, process.env.ASK_FOR_HEIGHT);
                                  } else {
                                    console.log("height is not saved.");
                                  }
                                });
                              }
                            }
                            else {
                             console.log("error in userpersonal");
                            }
                          })


                        } else if (/[1-9][0-9]?feet,?[1-9]?[0-9]?i?n?c?h?e?s?/i.test(event.message.text)) {
                          var textmsg = event.message.text;
                          var num = textmsg.match(/\d/g);
                          numb = num.join("");
                          UserPersonal.update({
                            user_id: event.sender.id
                          }, {
                            $set: {
                              height: numb
                            }
                          }).exec(function(err, data) {
                            if (!err) {
                              //console.log("height is saved in database.");
                              functionController.replyWithPlainText(event, process.env.ASK_FOR_WEIGHT);
                            } else {
                              console.log("height is not saved.");
                            }
                          });
                        } else if (/[1-9][0-9]?[0-9]?Kg/i.test(event.message.text)) {
                          //console.log("weight is received");
                          var textmsg = event.message.text;
                          var num = textmsg.match(/\d/g);
                          numb = num.join("");
                          UserPersonal.update({
                            user_id: event.sender.id
                          }, {
                            $set: {
                              weight: numb
                            }
                          }).exec(function(err, data) {
                            if (!err) {
                              UserPersonal.findOne({
                                user_id: event.sender.id
                              }).exec(function(err, data) {
                                if (!err) {
                                  textMsg = "You entered - Age(" + data.age + "), Weight (" + data.weight + "), Height (" + data.height + ")";
                                  title[0] = "OK";
                                  title[1] = "Edit";
                                  payload[0] = "USER_DETAIL_CONFIRM";
                                  payload[1] = "EDIT_USER_DETAIL";
                                  functionController.replyWithTwoPayload(event, title, payload, textMsg);
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
                        } else {

                          textMsg = event.message.text + " " + userName+", get fit with Nestle, your companion to good health.";
                          //receivedMessage(event, textMsg);title,payload
                          functionController.replyWithPlainText(event,textMsg);
                          textMsg1="You need a variety of nutrients to strengthen your performance and endurance. Let's guide you on daily nutrition. To start over type \"Hi\" any time.";
                          functionController.receivedMessage(event, title, payload, textMsg1);
                        }

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
