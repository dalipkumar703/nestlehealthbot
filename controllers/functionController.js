var request = require('request');
var _ = require('underscore');
var QuickReply = require('../models/quick_reply.js');
var QuickReplyText = require('../models/quick_reply_text.js');
//HI text message send
exports.sayHi = function(recipient, textMsg) {
  var messageData = {
    "recipient": {
      "id": recipient
    },
    "message": {
      "text": textMsg
    }

  };
  this.callSendAPI(messageData);
}
//message with two payload attachment format
exports.replyWithTwoPayload = function(recipient, title, payload, textMsg) {
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": textMsg,
          "buttons": [{
              "type": "postback",
              "title": title[0],
              "payload": payload[0]
            },
            {
              "type": "postback",
              "title": title[1],
              "payload": payload[1]
            }
          ]
        }
      }
    }
  };
  this.callSendAPI(messageData);
}
//quick reply message format
exports.quickReply = function(recipient, title, payload, text) {
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "text": text,
      "quick_replies": [{
          "content_type": "text",
          "title": title[0],
          "payload": payload[0]
        },
        {
          "content_type": "text",
          "title": title[1],
          "payload": payload[1]
        },
        {
          "content_type": "text",
          "title": title[2],
          "payload": payload[2]
        },
        {
          "content_type": "text",
          "title": title[3],
          "payload": payload[3]
        }
      ]
    }
  };
  this.callSendAPI(messageData);
}

//reply with attachments
exports.replyWithAttachments = function(recipient, image_url, title, payload, button_title) {

  var element = [];
  for (var i = 0; i < payload.length; i++) {
    var object = {
      title: title[i],
      image_url: image_url[i],
      buttons: [{
        type: "postback",
        title: button_title[i],
        payload: payload[i]
      }]
    };
    console.log("payload :", payload[i]);
    element.push(object);
  }
  console.log("element value", element);
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: element
        }
      }

    }

  };
  this.callSendAPI(messageData);
}
//message with text and single payload format
exports.receivedMessage = function(recipient, title, payload, textMsg) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("payload", payload[0]);
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": textMsg,
          "buttons": [{
            "type": "postback",
            "title": title[0],
            "payload": payload[0]
          }]
        }
      }
    }
  };
  this.callSendAPI(messageData);
  //console.log("Message data: ", event.message);
}
//message with text only format
exports.replyWithPlainText = function(recipient, textMsg) {
  var messageData = {
    "recipient": {
      "id": recipient
    },
    "message": {
      "text": textMsg
    }

  };
  this.callSendAPI(messageData);
}
//call facebook graph api to send message
exports.callSendAPI = function(messageData) {
  request({
    url: process.env.FACEBOOK_GRAPH_MSG_URL,
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
//message with attachments only format
exports.callReplyWithAttachments = function(result, err, recipient) {
  var image_url = [];
  var title = [];
  var payload = [];
  var button_title = [];
  var button_web_url = [];
  if (!err) {
    console.log("length of payload:", _.size(result));
    console.log("length of payload 1:", result);

    for (var i = 0; i < _.size(result); i++) {

      image_url[i] = result[i].image_url;
      title[i] = result[i].title;
      payload[i] = result[i].b_t_p_payload;
      button_title[i] = result[i].b_t_p_title;

    }

    this.replyWithAttachments(recipient, image_url, title, payload, button_title);
  } else {
    console.log("error in reply with attachemnts");
  }

}
//message with two quick reply format
exports.QuickReplyForTwo = function(recipient, title, postback, text) {
  console.log("paylaod in quickreply:", postback);
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "text": text,
      "quick_replies": [{
          "content_type": "text",
          "title": title[0],
          "payload": postback[0]
        },
        {
          "content_type": "text",
          "title": title[1],
          "payload": postback[1]
        }
      ]
    }
  };
  this.callSendAPI(messageData);
}
//call quick reply method
exports.callQuickReply = function(postback_payload, event) {
  var image_url = [];
  var title = [];
  var payload = [];
  var button_title = [];
  var button_web_url = [];
  QuickReply.find({
    payload_for: postback_payload
  }).exec(function(err, result) {
    if (!err) {
      //  console.log("quick reply result:",result);
      for (var i = 0; i < _.size(result); i++) {
        title[i] = result[i].title;
        payload[i] = result[i].payload;
      }
      QuickReplyText.find({
        payload_for: postback_payload
      }).exec(function(err, result) {
        if (!err) {
          console.log("quick reply with text:", result[0]);
          this.quickReply(event.sender.id, title, payload, result[0].text);
        } else {
          console.log("error in quick reply with text");
        }
      });
    } else {
      console.log("error in quick reply data fetching.");
    }
  })
}
//message with web url and payload format
exports.replyWithUrl = function(recipient, image_url, title, payload, button_title, button_web_title, button_web_url) {
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
              title: title[0],
              image_url: image_url[0],
              buttons: [{
                  type: "postback",
                  title: button_title[0],
                  payload: payload[0],
                },
                {
                  type: "web_url",
                  url: button_web_url[0],
                  title: button_web_title[0]

                }
              ],
            }, {
              title: title[1],
              image_url: image_url[1],
              buttons: [{
                  type: "postback",
                  title: button_title[1],
                  payload: payload[1],
                },
                {
                  type: "web_url",
                  url: button_web_url[1],
                  title: button_web_title[1]

                }
              ],
            },
            {
              title: title[2],
              image_url: image_url[2],
              buttons: [{
                  type: "postback",
                  title: button_title[2],
                  payload: payload[2],
                },
                {
                  type: "web_url",
                  url: button_web_url[2],
                  title: button_web_title[2]

                }
              ],
            }
          ]
        }
      }

    }

  };
  this.callSendAPI(messageData);
}
//call reply with url
exports.callReplyWithUrl = function(result, err, event) {

  if (!err) {
    var element = [];
    for (var i = 0; i < payload.length; i++) {
      var object = {
        title: title[i],
        image_url: image_url[i],
        buttons: [{
            type: "postback",
            title: button_title[i],
            payload: payload[i],
          },
          {
            type: "web_url",
            url: button_web_url[i],
            title: button_web_title[i]

          }
        ]
      };
      element.push(object);
    }
    this.ReplyWithUrl(recipient, image_url, title, payload, button_title, button_web_title, button_web_url);

  } else {
    console.log("error in callreplywithurl function");
  }
}
//message with web url only format
exports.replyWithUrlOnly = function(recipient, title, subtitle, image_url, button_web_title, button_web_url) {
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
              title: title[0],
              image_url: image_url[0],
              buttons: [{
                type: "web_url",
                url: button_web_url[0],
                title: button_web_title[0]

              }],
            }, {
              title: title[1],
              image_url: image_url[1],
              buttons: [{
                type: "web_url",
                url: button_web_url[1],
                title: button_web_title[1]

              }],
            },
            {
              title: title[2],
              image_url: image_url[2],
              buttons: [{
                type: "web_url",
                url: button_web_url[2],
                title: button_web_title[2]

              }],
            },
            {
              title: title[3],
              image_url: image_url[3],
              buttons: [{
                type: "web_url",
                url: button_web_url[3],
                title: button_web_title[3]

              }],
            },
            {
              title: title[4],
              image_url: image_url[4],
              buttons: [{
                type: "web_url",
                url: button_web_url[4],
                title: button_web_title[4]

              }],
            },
            {
              title: title[5],
              image_url: image_url[5],
              buttons: [{
                type: "web_url",
                url: button_web_url[5],
                title: button_web_title[5]

              }],
            },
            {
              title: title[6],
              image_url: image_url[6],
              buttons: [{
                type: "web_url",
                url: button_web_url[6],
                title: button_web_title[6]

              }],
            }
          ]
        }
      }

    }

  };
  console.log("messageData ", messageData);
  this.callSendAPI(messageData);
}
//message for calculating calorie
exports.callCalorieCalculator = function(recipient) {
  var textMsg = process.env.TEXT_MSG_CALORIE_CALCULATOR;
  this.replyWithPlainText(recipient, textMsg);
}
//message with bmr value
exports.bmrShow = function(bmr, recipient) {
  msg = "Great! You need " + bmr + " calories per day to maintain your weight.";
  title[0] = process.env.BMR_TITLE;
  payload[0] = process.env.BMR_PAYLOAD;
  this.receivedMessage(recipient, title, payload, msg);
}
//message with image only format
exports.callSendImageOnly = function(recipient, url) {
  var messageData = {
    "recipient": {
      "id": recipient
    },
    "message": {
      "attachment": {
        "type": "image",
        "payload": {
          "url": url
        }
      }
    }
  };
  this.callSendAPI(messageData);
}
//add x no of payload
exports.callSendWithXPayload = function(recipient, payload, title, text, url, url_title) {
  var element = [];
  for (var i = 0; i < payload.length; i++) {
    var obj_postback = {
      "type": "postback",
      "title": title[i],
      "payload": payload[i]
    };

    element.push(obj_postback);
  }
  for (i = 0; i < url.length; i++) {
    var obj_url = {
      "type": "web_url",
      "url": url[i],
      "title": url_title[i]

    };
    element.push(obj_url);
  }
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": text,
          "buttons": element
        }
      }
    }
  };
  this.callSendAPI(messageData);

}
//ask new question to user
exports.callAskQuestion = function(recipient, title, payload, text, url) {

  this.receivedMessage(recipient, title, payload, text);
  this.callSendImageOnly(recipient, url);
}
