"use strict"
const Amis = require('../models/amis');

exports.getAmis = function (req, res, next) {
  Amis.find({ participants: req.params.userIdFriends,status:"accepted" })
    // .select('createdAt body author')
    .sort('-createdAt')
    .populate({
      path: 'participants',
      select: '_id username photoUrl email secteur'
    })

    .exec(function (err, messages) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ Amis: messages });
    });
}
exports.getInvitation = function (req, res, next) {
  Amis.find({ invitationReceiver:req.params.userIdFriends ,status:"pending"})
    .sort('-createdAt')
    .populate({
      path: 'participants',
      select: '_id username photoUrl email secteur'
    })
    .exec(function (err, friendRequests) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ friendRequests: friendRequests });
    });
}

exports.newAmis = function (req, res, next) {

  Amis.find({ participants: { "$in": [req.body.userId, req.body.newAmisId] } })
    .then(amis => {
      if (amis.length) {
        let error = 'friendship Exists in Database.';
        return res.status(400).json(error);
      } else {
        var amis = new Amis({
          participants: [req.body.userId, req.body.newAmisId],
          status: "pending",
          invitationSender: req.body.userId,
          invitationReceiver: req.body.newAmisId

        });

        amis.save(function (err, newAmis) {
          if (err) {
            res.status(404).json({ error: err });

          } else {
            res.status(200).json({ message: 'frienship started!', Amis: newAmis });

          }

        });

      }

    })
}


exports.updateInvitationStatus = function (req, res, next) {
  var amitieId=req.body.id 
  Amis.findOneAndUpdate({ _id:amitieId }, {status:req.body.status}, { new: true })
  .exec()
  .then(result => {
      res.status(200).json({
          message: 'InvitationStatus updated',
          data: result
      });
  })
  .catch(err => {
      console.log(err);
      res.status(404).json({
          error: err
      });
  });
}