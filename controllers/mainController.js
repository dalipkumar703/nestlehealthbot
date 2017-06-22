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
var ReplyWithUrlOnly = require('../models/reply_with_url_only.js');
var ReplyWithImageOnly=require('../models/reply_with_image_only.js');
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
var payload1=[];
var button_title = [];
var button_web_title=[];
var button_web_url=[];
var subtitle=[];
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
  app.use(bodyParser.json());
  //api calls
  //app.get('/user', api.post);
 app.get("/", function (req, res) {
  res.send("Deployed!");
  console.log("deployed");
 });
  app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] == process.env.HUB_VERIFY) {
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
            if(event.postback.payload==="PALM")
            {
              console.log("PALM");
              PlainText.find({payload_for:"PALM"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="DAL")
            {
              console.log("DAL");
              PlainText.find({payload_for:"DAL"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="CREDIT_CARD")
            {
              console.log("CREDIT_CARD");
              PlainText.find({payload_for:"CREDIT_CARD"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="CD")
            {
              console.log("CD");
              PlainText.find({payload_for:"CD"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="TENNIS_BALL")
            {
              console.log("tennis ball");
              PlainText.find({payload_for:"TENNIS_BALL"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="LET_GO_PORTION")
            {
              console.log("let go portion");
              PlainText.find({payload_for:"LET_GO_PORTION"}).exec(function(err,data){
                if(!err)
                {
                  console.log("data:",data);
                  functionController.replyWithPlainText(event, data[0].text);
                }
              })
            }
            if(event.postback.payload==="START_GAME")
            {
              console.log("start game");

                ReplyWithImageOnly.find({payload_for:"START_GAME"}).exec(function(err,data){
                  if(!err)
                  {
                    console.log("data:",data);
                      functionController.callSendImageOnly(event.sender.id,data[0].url);
                  }
                });
                PlainText.find({payload_for:"START_GAME"}).exec(function(err,data){
                  if(!err)
                  {
                    console.log("text from plain reply",data);
                    functionController.replyWithPlainText(event, data[0].text);
                  }
                });


            }
            if(event.postback.payload==="PLAY_GAME")
            {
              console.log("play game");
              User.findOne({user_id:event.sender.id}).exec(function(err,data){
                if(!err)
                {
                  console.log("user name:",data);
                  ReplyWithText.find({payload_for:"PLAY_GAME"}).exec(function(err,result){
                    if(!err)
                    {
                    //  console.log("play game data",result);
                    for(var i=0;i<_.size(result);i++)
                    {
                      payload[i]=result[i].payload;
                      title[i]=result[i].title;
                    }
                    var msg;
                    msg="Hey "+data.name+", time for a little game🎮";
                  functionController.replyWithTwoPayload(event, title, payload,msg);
                    }
                  })
                }

              })
            }
            if(event.postback.payload==="CALORIE_CALCULATOR")
            {
              console.log("calorie calculator");
              functionController.callCalorieCalculator(event);
            }
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
            if (event.postback.payload === "GOT_IT_RUNNING_STATUS") {
              console.log("got it running status");
              User.findOne({user_id:event.sender.id}).exec(function(err,data){
                if(!err)
                {
                  console.log("is brm",data.is_bmr);
                  if(data.is_bmr)
                  {
                   UserPersonal.find({user_id:event.sender.id}).exec(function(err,data){
                     if(!err)
                     {
                       msg ="Great! You need " + data[0].bmr +" calories per day to maintain your weight.";
                       title[0] = "Next";
                       payload[0] = "SHOWED_CALORIE";
                       title[1]="Edit";
                       payload[1]="EDIT_USER_DETAIL";
                       functionController.replyWithTwoPayload(event, title, payload, msg);
                     }
                   })

                  }
                  else {
                    functionController.replyWithPlainText(event, process.env.ASK_FOR_AGE);
                  }
                }

              });


            }
            if( event.postback.payload === "EDIT_USER_DETAIL")
            {
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
                          if(resultExercise.set_variables.bmr)
                          {

                            User.update({
                              user_id: event.sender.id
                            }, {
                              $set: {
                                is_bmr: true
                              }
                            }).exec(function(err,data){
                              if(!err)
                              {
                                console.log("update user value:",data);
                                UserPersonal.update({
                                  user_id: event.sender.id
                                }, {
                                  $set: {
                                    bmr: resultExercise.set_variables.bmr
                                  }
                                }).exec(function(err,data){
                                  if(!err)
                                  {
                                    console.log("updated value",data);
                                  }
                                })
                              }
                            })
                          }
                          msg = "Great! You need " + resultExercise.set_variables.bmr + " calories per day to maintain your weight.";
                          title[0] = "Next";
                          payload[0] = "SHOWED_CALORIE";
                          functionController.receivedMessage(event.sender.id, title, payload, msg);
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
            if(event.postback.payload==="PORTION_GUIDANCE")
            {
              PlainText.find({payload_for:"PORTION_GUIDANCE"}).exec(function(err,data){
                if(!err)
                {
                  console.log("text for portion guidance:",data[0].text);
                  ReplyWithText.find({payload_for:"PORTION_GUIDANCE"}).exec(function(err,result){
                    if(!err)
                    {
                      for(i=0;i<_.size(result);i++)
                      {
                        title[i]=result[i].title;
                        payload[i]=result[i].payload;
                      }
                      console.log("result:",result);
                      functionController.replyWithTwoPayload(event, title, payload, data[0].text);
                    }
                    else {

                    }
                  });
                }
                else {
                  console.log("error in plain text model");
                }
              });

            }
            if(event.postback.payload==="READING_MANUAL")
            {
              PlainText.find({payload_for:"READING_MANUAL"}).exec(function(err,data){
                if(!err)
                {
                  console.log("text for portion guidance:",data[0].text);
                  ReplyWithText.find({payload_for:"READING_MANUAL"}).exec(function(err,result){
                    if(!err)
                    {
                      for(i=0;i<_.size(result);i++)
                      {
                        title[i]=result[i].title;
                        payload[i]=result[i].payload;
                      }
                      console.log("result:",result);
                      functionController.replyWithTwoPayload(event, title, payload, data[0].text);
                    }
                    else {

                    }
                  });
                }
                else {
                  console.log("error in plain text model");
                }
              });
            }
            if(event.postback.payload==="GO_AHEAD")
            {
              ReplyWithAttachments.find({
                payload_for: "GO_AHEAD"
              }).exec(function(err, result) {

                functionController.callReplyWithAttachments(result,err,event);
              });
            }
            if(event.postback.payload==="LEARN_MORE")
            {
              PlainText.find({payload_for:"LEARN_MORE"}).exec(function(err,data){
                if(!err)
                {
                  console.log("text for portion guidance:",data[0].text);
                  ReplyWithText.find({payload_for:"LEARN_MORE"}).exec(function(err,result){
                    if(!err)
                    {
                      for(i=0;i<_.size(result);i++)
                      {
                        title[i]=result[i].title;
                        payload[i]=result[i].payload;
                      }
                      console.log("result:",result);
                      functionController.replyWithTwoPayload(event, title, payload, data[0].text);
                    }
                    else {

                    }
                  });
                }
                else {
                  console.log("error in plain text model");
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
                    console.log("show calorie ");

                    ReplyWithAttachments.find({payload_for:"SHOWED_CALORIE"}).exec(function(err,result){
                      if(!err)
                      {
                        console.log("result:",result);
                        functionController.callReplyWithAttachments(result,err,event);
                      }
                      else {
                        console.log("error in reply with attachements ");
                      }
                    });
                    PlainText.findOne({payload_for:"SHOWED_CALORIE"}).exec(function(err,data){
                      if(!err)
                      {
                        functionController.replyWithPlainText(event,data.text);
                      }
                      else {
                        console.log("error in plain text retrieval");
                      }
                    });

            }
            if(event.postback.payload==="DIET_QUERIES")
            {
              text=process.env.DIET_QUERIES;
              functionController.replyWithPlainText(event, text);
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
                      console.log("quick reply with text:",result[0]);
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




          } else if (event.message && event.message.text) {
            // message is quick reply type
            if (event.message.quick_reply) {
              if(event.message.quick_reply.payload==="REMINDER_OFF"||event.message.quick_reply.payload==="I_AM_IN")
              {
                console.log("calorie calculator");
                User.findOne({user_id:event.sender.id}).exec(function(err,result){
                  if(!err)
                  {
                    var flag;
                    if(event.message.quick_reply.payload==="I_AM_IN")
                    {
                      flag=true;
                    }
                    else {
                      flag=false;
                    }
                    User.update({
                      user_id: event.sender.id
                    }, {
                      $set: {
                        is_reminder: flag
                      }
                    }).exec(function(err, data) {
                      if (!err) {
                        console.log("updated values of user:",data);
                        functionController.callCalorieCalculator(event);
                      } else {
                        console.log("user reminder is not updated.");
                      }
                    });
                  }
                  else {
                    console.log("error in user find");
                  }
               });

              }
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
                    functionController.receivedMessage(event.sender.id, title, payload, result[0].text);

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
                  functionController.replyWithUrl(event.sender.id, image_url, title, payload, button_title,button_web_title,button_web_url);
                ReplyWithUrlOnly.find({
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
                ]}).exec(function(err,result){
                  if(!err)
                  {
                  // console.log("hurray:",result);
                  for(var i=0;i<_.size(result);i++)
                  {
                    title[i]=result[i].title;
                    subtitle[i]=result[i].subtitle;
                    image_url[i]=result[i].image_url;
                    button_web_title[i]=result[i].b_t_w_title;
                    button_web_url[i]=result[i].b_t_w_url;
                    var str=result[i].image_url;
                     var images_url=str.split(",");
                     console.log("web url:",button_web_url[i]);
                     if(event.message.quick_reply.payload=="VEG_DIET")
                     {
                      image_url[i]=images_url[0];
                     console.log("button web url:",image_url[i]);
                     }
                    if(event.message.quick_reply.payload=="VEGAN_DIET")
                    {
                      image_url[i]=images_url[1];
                     console.log("button web url:",image_url[i]);
                    }

                    if(event.message.quick_reply.payload=="EGG_DIET")
                    {
                      image_url[i]=images_url[2];
                     console.log("button web url:",image_url[i]);
                    }
                    if(event.message.quick_reply.payload=="NON_VEG_DIET")
                    {
                      image_url[i]=images_url[3];
                     console.log("button web url:",image_url[i]);
                    }

                  }
                  functionController.replyWithUrlOnly(event.sender.id,title,subtitle,image_url,button_web_title,button_web_url);
                  QuickReplyText.find({
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
                  ]}).exec(function(err,data){
                    if(!err)
                    {
                      for(var i=0;i<_.size(data);i++)
                      {
                        console.log("data[i]",data[i]);
                        functionController.replyWithPlainText(event,data[i].text);
                      }



                  QuickReply.find({
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
                 ]}).exec(function(err,result){
                    if(!err)
                    {
                      console.log("result",result);
                      for(var i=0;i<_.size(result);i++)
                      {
                        title[i]=result[i].title;
                        payload1[i]=result[i].payload;

                      }
                     console.log("payload in quick reply:",payload1);
                    functionController.QuickReplyForTwo(event.sender.id, title, payload1, data[1].text);

                  }
                  else {
                    console.log("error in reply with url only");
                  }
                });

          }
          else {
            console.log("error in retrieving from quick reply model");
          }
        });
          }
          else {
            console.log("error in getting result from quick reply text ");
          }
        });



                }
                else {

                }
              });


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
                        if (/[1-9][0-9]?\sage/i.test(event.message.text)) {
                          //console.log("age is correct");
                          var textmsg = event.message.text;
                          var num = textmsg.match(/\d/g);
                          console.log(num);
                        } else {
                          textMsg = event.message.text + " " + userName+", get fit with Nestle, your companion to good health.";
                          //receivedMessage(event, textMsg);title,payload
                          functionController.replyWithPlainText(event,textMsg);
                          textMsg1="You need a variety of nutrients to strengthen your performance and endurance. Let's guide you on daily nutrition. To start over type \"Hi\" any time.";
                          functionController.receivedMessage(event.sender.id, title, payload, textMsg1);

                        }

                      } else {
                        console.log("string length",_.size(event.message.text));
                        if(_.size(event.message.text)>20)
                        {
                          console.log(_.size(event.message.text));
                          let apiai = apiapp.textRequest(event.message.text, {
                            sessionId: process.env.API_AI_SESSION_ID // use any arbitrary id
                          });
                          apiai.on('response', (response) => {
                            // Got a response from api.ai. Let's POST to Facebook Messenger
                            let aiText = response.result.fulfillment.speech;
                            console.log("Api ai reply:", aiText);
                            functionController.replyWithPlainText(event,aiText);
                          });

                          apiai.on('error', (error) => {
                            console.log("error in api ai:", error);
                          });
                          apiai.end();
                        }
                        else if(/[1-9]?[0-9]+\sgm/i.test(event.message.text))
                        {
                          var url="https://scontent.xx.fbcdn.net/v/t34.0-0/p280x280/17141321_958249330944340_510464946_n.jpg?_nc_ad=z-m&oh=f8cc22bdc955d5730a5ec2e765e38a96&oe=594E3589";
                          title[0]="Ask More";
                          payload[0]="DAL";
                          text="30 gm or half a cup.";

                          functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }
                        else if(/[1-9]?[0-9]+\slitre/i.test(event.message.text))
                        {
                          var url="https://l.messenger.com/l.php?u=https%3A%2F%2Fscontent.fdel1-1.fna.fbcdn.net%2Fv%2Ft34.0-0%2Fp280x280%2F17141727_958249394277667_1219660866_n.jpg%3Foh%3D9d6eb6915c1ab9f0fd848d24a10c2759%26oe%3D594E0A29&h=ATPmM8c5gsY-qVksk4bw_RSVcsFv3eOrRB7P8MegH05HY1w_z4LC-bOp8tAQIJI9rHmLsTd8abh0Lbvpo2DUxLaw7hMdABSKYmXjh8tocmxfoPfCIdwI8jOaumb8Z51tE0grlg";
                          title[0]="More on this";
                          button_web_url[0]="https://s3.amazonaws.com/nestlehome/eatanddrink.html";
                          text="1 cup milk = 250 mL";
                          functionController.callSendImageOnly(event.sender.id,url);
                          functionController.callSendWithXPayload(event.sender.id,0,0,text,button_web_url,title);
                          //functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }

                        else if(/[1-9]?[0-9]+\sr?i?c?e?p?a?s?t?a?n?o?o?d?l?e?s?/i.test(event.message.text))
                        {
                          var url="https://scontent.xx.fbcdn.net/v/t34.0-0/p280x280/17078108_955444074558199_1834766401_n.jpg?_nc_ad=z-m&oh=ecab7a427b6ef9969df277908e76314d&oe=594DF4EB";
                          title[0]="Ask More";
                          payload[0]="TENNIS_BALL";
                          text="Size of a tennis ball!  That’s the quantity you should take .";

                          functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }

                        else if(/[a-z]+\smeat/i.test(event.message.text))
                        {
                          var url="https://scontent.fdel1-1.fna.fbcdn.net/v/t34.0-0/p280x280/17101742_956141274488479_1490264435_n.jpg?oh=4dbe83d67396cec433868dc03f0098e8&oe=594DCF23";
                          title[0]="Ask More";
                          payload[0]="PALM";
                          text="90-100 gm. About the size of your palm !!";

                          functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }
                        else if(/[a-z]+\ssize/i.test(event.message.text))
                        {
                          var url="https://scontent.fdel1-1.fna.fbcdn.net/v/t34.0-12/17078518_955444347891505_1540860361_n.jpg?oh=87798be7472e0650b7e01987046c862a&oe=594DD2C1";
                          title[0]="Ask More";
                          payload[0]="CD";
                          text="Remember the CD! That’s how big your Chapatti sould be";

                          functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }
                        else if(/[a-z]+\scmp/i.test(event.message.text))
                        {
                          var url="https://scontent.fdel1-1.fna.fbcdn.net/v/t34.0-0/p280x280/17077947_955444624558144_1832317505_n.jpg?oh=964bc2e900e1fb2d19f2ab5b0fc2d7a9&oe=594DEC2A";
                          title[0]="Ask More";
                          payload[0]="CREDIT_CARD";
                          text="The size of your credit card. No more than this in a portion.";
                        functionController.callAskQuestion(event.sender.id,title, payload, text,url);
                        }
                        else if(/[1-9][0-9]+\scalorie/i.test(event.message.text))
                        {
                      console.log("pizza calorie");
                      var msg="2000! An adult's whole day allowance. You can check calories of every meal. Enter your entire meal & separate each item with a comma e.g 2 naan, 1 butter chicken, 1 plate rice. Or click the links for more information";
                         payload[0]=process.env.PAYLOAD_PORTION;
                         payload[1]=process.env.PAYLOAD_MANUAL;
                         title[0]=process.env.PORTION_GUIDANCE;
                         title[1]=process.env.READING_MANUAL;
                          button_web_title[0]=process.env.URL_TITLE;
                          button_web_url[0]=process.env.URL_LINK;
                         functionController.callSendWithXPayload(event.sender.id,payload,title,msg,button_web_url,button_web_title);
                        }
                        else if (/[1-9][0-9]?\sage/i.test(event.message.text)) {
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


                        } else if (/[1-9][0-9]?\sfeet,?[1-9]?[0-9]?\s?i?n?c?h?e?s?/i.test(event.message.text)) {
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
                        } else if (/[1-9][0-9]?[0-9]?\sKg/i.test(event.message.text)) {
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
                        }
                        else if(/[1-9]+\snaan/i.test(event.message.text)||/[1-9]+\sbutter\schicken/i.test(event.message.text)||/[1-9]+\splate\srice/i.test(event.message.text))
                        {
                          request({
                            url: "http://54.236.50.54/1.2/Getcalorific?data="+event.message.text,
                            method: "GET"
                          }, function(error, response, body) {
                            if (!error) {
                              var result = JSON.parse(response.body);
                              console.log("result:",result);
                              User.find({user_id:event.sender.id}).exec(function(err,data){
                                if(!err)
                                {
                                  console.log("name",data);
                                  var textMsg="Hey "+data[0].name+", Here'\s your answer\n"+result.set_variables.totalcalories+"\n Make sure you read the label and control the portion you take.";
                                  title[0]=process.env.PORTION_GUIDANCE;
                                  title[1]=process.env.READING_MANUAL;
                                  payload[0]=process.env.PAYLOAD_PORTION;
                                  payload[1]=process.env.PAYLOAD_MANUAL;
                                  functionController.replyWithTwoPayload(event, title, payload, textMsg);
                                }
                              })

                            } else {
                              console.error("Unable to send message.");
                              //console.error(response);
                              console.error(error);
                            }
                            console.log("hello");


                          });

                        } else {

                          textMsg = event.message.text + " " + userName+", get fit with Nestle, your companion to good health.";
                          //receivedMessage(event, textMsg);title,payload
                          functionController.replyWithPlainText(event,textMsg);
                          textMsg1="You need a variety of nutrients to strengthen your performance and endurance. Let's guide you on daily nutrition. To start over type \"Hi\" any time.";
                          functionController.receivedMessage(event.sender.id, title, payload, textMsg1);
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
      // will time out and we will keep trying to resend. hello
      res.sendStatus(200);
    }
  });
}
