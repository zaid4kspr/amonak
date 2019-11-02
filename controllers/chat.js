"use strict"
const Conversation = require('../models/conversation');
const Message = require('../models/message')



exports.getConversations = function (req, res, next) {
  // Only return one message from each conversation to display as snippet
  Conversation.find({ participants: req.body.userId })
    .select().sort('-createdAt')
    .populate({
      path: "participants",
      select: "_id username photoUrl"
    })
    .exec(function (err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      // Set up empty array to hold conversations + most recent message
      let fullConversations = [];
      conversations.forEach(function (conversation) {
        Message.find({ 'conversationId': conversation._id })
          .sort('-createdAt')
          .limit(1)
      
          .exec(function (err, message) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            fullConversations.unshift(
              { authors: conversation.participants, messages: message });
            if (fullConversations.length === conversations.length) {
              return res.status(200).json({ conversations: fullConversations });
            }
          });
      });
    });
}

exports.getConversation = function (req, res, next) {
  Message.find({ conversationId: req.params.conversationId })
    .select('createdAt body author')
    .sort('createdAt')
    .populate({
      path: 'author',
      select: '_id username photoUrl'
    })

    .exec(function (err, messages) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ conversation: messages });
    });
}


exports.newConversation = function (req, res, next) {
  if (!req.params.recipient) {
    res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
    return next();
  }

  if (!req.body.composedMessage) {
    res.status(422).send({ error: 'Please enter a message.' });
    return next();
  }

  const conversation = new Conversation({
    participants: [req.body.userId, req.params.recipient]
  });


  conversation.save(function (err, newConversation) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    const message = new Message({
      conversationId: newConversation._id,
      body: req.body.composedMessage,
      author: req.body.userId
    });

    message.save(function (err, newMessage) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ message: 'Conversation started!', conversationId: newConversation });
      return next();
    });
  });
}

exports.sendReply = function (req, res, next) {
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.composedMessage,
    author: req.body.author
  });

  reply.save(function (err, sentReply) {

    sentReply.populate( { path: "author" }, function (err, reply) {
      res.io.emit('new-message', {
        msg: reply
      });

      res.status(200).json({ message: 'Reply successfully sent!', sentReply: reply });


    });


    return (next);
  });


}