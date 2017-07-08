var functionController = require('./functionController.js');
var UserPersonal = require('../models/user_personal.js');
var ReplyWithAttachments = require('../models/reply_with_attachments.js');
var PlainText = require('../models/reply_with_plain_text.js');
var QuickReplyText = require('../models/quick_reply_text.js');
var QuickReply = require('../models/quick_reply.js');
var User = require('../models/user.js');
var ReplyWithUrl = require('../models/reply_with_url.js');
var ReplyWithUrlOnly = require('../models/reply_with_url_only.js');
var request = require('request');
var _ = require('underscore');
var dotenv = require('dotenv');
dotenv.load();
exports.postback = function(recipient, postback) {
  var title = [];
  var payload = [];
  if (postback === "SHOWED_CALORIE") {
    console.log("show calorie ");

    ReplyWithAttachments.find({
      payload_for: postback
    }).exec(function(err, result) {
      if (!err) {
        console.log("result:", result);
        functionController.callReplyWithAttachments(result, err, recipient);
      } else {
        console.log("error in reply with attachements ");
      }
    });
    PlainText.findOne({
      payload_for: postback
    }).exec(function(err, data) {
      if (!err) {
        functionController.replyWithPlainText(recipient, data.text);
      } else {
        console.log("error in plain text retrieval");
      }
    });

  }
  if (postback === "MAKE_DIET_PLAN") {
    console.log("diet plan");

    QuickReply.find({
      payload_for: postback
    }).exec(function(err, result) {
      if (!err) {
        //  console.log("quick reply result:",result);
        for (var i = 0; i < _.size(result); i++) {
          title[i] = result[i].title;
          payload[i] = result[i].payload;
        }
        QuickReplyText.find({
          payload_for: postback
        }).exec(function(err, result) {
          if (!err) {
            console.log("quick reply with text:", result[0]);
            functionController.quickReply(recipient, title, payload, result[0].text);
          } else {
            console.log("error in quick reply with text");
          }
        });
      } else {
        console.log("error in quick reply data fetching.");
      }
    })

  }
}
exports.quickReplyPostback = function(recipient, postback) {
  var image_url = [];
  var title = [];
  var button_web_url = [];
  var button_web_title = [];
  var button_title = [];
  var payload = [];
  var subtitle = [];
  var payload1 = [];
  if (postback === "I_AM_IN" || postback === "REMINDER_OFF") {
    console.log("calorie calculator");
    User.findOne({
      user_id: recipient
    }).exec(function(err, result) {
      if (!err) {
        var flag;
        if (postback === "I_AM_IN") {
          flag = process.env.TRUE;
        } else {
          flag = process.env.FALSE;
        }
        User.update({
          user_id: recipient
        }, {
          $set: {
            is_reminder: flag
          }
        }).exec(function(err, data) {
          if (!err) {
            console.log("updated values of user:", data);
            functionController.callCalorieCalculator(recipient);
          } else {
            console.log("user reminder is not updated.");
          }
        });
      } else {
        console.log("error in user find");
      }
    });


  }
  if (postback === "VEGAN_DIET" || postback === "VEG_DIET" || postback === "EGG_DIET" || postback === "NON_VEG_DIET") {
    //console.log("diet call");
    User.findOne({
      user_id: recipient
    }).exec(function(err, data) {
      if (!err) {
        console.log("user:", data);
        var text = "Hey " + data.name + ", here'\s your weekly diet plan. Also check your race day and recovery diet.";
        functionController.replyWithPlainText(recipient, text);
      } else {
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
    }).exec(function(err, result) {
      if (!err) {
        //console.log("result:",result);
        for (var i = 0; i < _.size(result); i++) {
          title[i] = result[i].title;
          image_url[i] = result[i].image_url;
          button_title[i] = result[i].b_t_p_title;
          payload[i] = result[i].b_t_p_payload;
          button_web_title[i] = result[i].b_t_w_title;
          var str = result[i].b_t_w_url;
          var btw_url = str.split(",");


          if (postback == "VEG_DIET") {
            button_web_url[i] = btw_url[0];
            console.log("button web url:", button_web_url[i]);
          }
          if (postback == "VEGAN_DIET") {
            button_web_url[i] = btw_url[1];
            console.log("button web url:", button_web_url[i]);
          }

          if (postback == "EGG_DIET") {
            button_web_url[i] = btw_url[2];
            console.log("button web url:", button_web_url[i]);
          }
          if (postback == "NON_VEG_DIET") {
            button_web_url[i] = btw_url[3];
            console.log("button web url:", button_web_url[i]);
          }

          //  console.log("result[i].btwurl",result[i].b_t_w_url);
        }
        functionController.replyWithUrl(recipient, image_url, title, payload, button_title, button_web_title, button_web_url);
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
          ]
        }).exec(function(err, result) {
          if (!err) {
            // console.log("hurray:",result);
            UserPersonal.findOne({user_id:recipient}).exec(function(err,data)
          {
            if(!err)
            {
              var range;
              if(data.bmr<process.env.TWO_THOUSAND)
              {
                 range="2000";
                functionController.MealPlan(recipient,postback,range);
                console.log("range is between 1500 & 2000");
                for (var i = 0; i < _.size(result); i++) {
                  title[i] = result[i].title;
                  subtitle[i] = result[i].subtitle;
                  image_url[i] = result[i].image_url;
                  button_web_title[i] = result[i].b_t_w_title;
                  button_web_url[i] = result[i].b_t_w_url;
                  var str = result[i].image_url;
                  var images_url = str.split(",");

                  console.log("web url:", button_web_url[i]);
                  if (postback == "VEG_DIET") {
                    image_url[i] = images_url[0];
                    console.log("button web url:", image_url[i]);
                  }
                  if (postback == "VEGAN_DIET") {
                    image_url[i] = images_url[1];
                    console.log("button web url:", image_url[i]);
                  }

                  if (postback == "EGG_DIET") {
                    image_url[i] = images_url[2];
                    console.log("button web url:", image_url[i]);
                  }
                  if (postback == "NON_VEG_DIET") {
                    image_url[i] = images_url[3];
                    console.log("button web url:", image_url[i]);
                  }

                }
              }
              else if(data.bmr>=process.env.TWO_THOUSAND&&data.bmr<process.env.TWENTY_FIVE_HUNDRED) {
                 console.log("range is between 2000 & 2500");
                  range="2001-2499";
                 functionController.MealPlan(recipient,postback,range);
                 for (var i = 0; i < _.size(result); i++) {
                   title[i] = result[i].title;
                   subtitle[i] = result[i].subtitle;
                   image_url[i] = result[i].image_url;
                   button_web_title[i] = result[i].b_t_w_title;
                   button_web_url[i] = result[i].b_t_w_url;
                   var str = result[i].image_url;
                   var images_url = str.split(",");

                   console.log("web url:", button_web_url[i]);
                   if (postback == "VEG_DIET") {
                     image_url[i] = images_url[4];
                     console.log("button web url:", image_url[i]);
                   }
                   if (postback == "VEGAN_DIET") {
                     image_url[i] = images_url[5];
                     console.log("button web url:", image_url[i]);
                   }

                   if (postback == "EGG_DIET") {
                     image_url[i] = images_url[6];
                     console.log("button web url:", image_url[i]);
                   }
                   if (postback == "NON_VEG_DIET") {
                     image_url[i] = images_url[7];
                     console.log("button web url:", image_url[i]);
                   }

                 }
              }
              else if(data.bmr>=process.env.TWENTY_FIVE_HUNDRED)
              {
                range="2500";
                functionController.MealPlan(recipient,postback,range);
                 console.log("range is between 2500");
                 for (var i = 0; i < _.size(result); i++) {
                   title[i] = result[i].title;
                   subtitle[i] = result[i].subtitle;
                   image_url[i] = result[i].image_url;
                   button_web_title[i] = result[i].b_t_w_title;
                   button_web_url[i] = result[i].b_t_w_url;
                   var str = result[i].image_url;
                   var images_url = str.split(",");

                   console.log("web url:", button_web_url[i]);
                   if (postback == "VEG_DIET") {
                     image_url[i] = images_url[8];
                     console.log("button web url:", image_url[i]);
                   }
                   if (postback == "VEGAN_DIET") {
                     image_url[i] = images_url[9];
                     console.log("button web url:", image_url[i]);
                   }

                   if (postback == "EGG_DIET") {
                     image_url[i] = images_url[10];
                     console.log("button web url:", image_url[i]);
                   }
                   if (postback == "NON_VEG_DIET") {
                     image_url[i] = images_url[11];
                     console.log("button web url:", image_url[i]);
                   }

                 }
              }
              functionController.replyWithUrlOnly(recipient, title, subtitle, image_url, button_web_title, button_web_url);
            }
            else {
              console.log(err);
            }
          });



        setTimeout(function(){
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
                              ]
                            }).exec(function(err, data) {
                              if (!err) {


                                    functionController.replyWithPlainText(recipient, data[1].text);




                              } else {
                                console.log("error in retrieving from quick reply model");
                              }
                            });

        },2000);
        setTimeout(function(){
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
                              ]
                            }).exec(function(err, data) {
                              if (!err) {
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
                                  ]
                                }).exec(function(err, result) {
                                  if (!err) {
                                    console.log("result", result);
                                    for (var i = 0; i < _.size(result); i++) {
                                      title[i] = result[i].title;
                                      payload1[i] = result[i].payload;

                                    }
                                    console.log("payload in quick reply:", payload1);
                                    functionController.QuickReplyForTwo(recipient, title, payload1, data[2].text);
                                      console.log("quick reply send");
                                  } else {
                                    console.log("error in reply with url only");
                                  }
                                });
                              }
                              else {
                                  console.log("error in quick reply");
                              }
                            });

        },2000);

          } else {
            console.log("error in getting result from quick reply text ");
          }
        });



      } else {

      }
    });
  }
}
