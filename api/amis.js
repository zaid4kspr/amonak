const amisController = require('./../controllers/amis')
    module.exports = function (router) {

        
      // Retrieve  friendList
        router.get('/amis/getFriendList/:userIdFriends', amisController.getAmis);
      // Retrieve  friendRequests
        router.get('/amis/friendRequest/:userIdFriends', amisController.getInvitation);
      // add  friend
        router.post('/amis/new', amisController.newAmis);
 // update  friendShipStatus
 //reminder friendRequest Status ===> //pending//accepted//refused//deleted 
        router.put('/amis/updateStatus', amisController.updateInvitationStatus);

    }