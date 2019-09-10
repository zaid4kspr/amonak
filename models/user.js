// models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: String,
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
      
    },
    secteur: {
        type: String,
    },
    profession: {
        type: String,
    },
    adresse: {
        type: String,
    },
    photoUrl:{
        type:String
    },
    numCarteBank:{
        type:String
    },
    conditionUtilisation:{
        type:Boolean
    },


});
module.exports = User = mongoose.model('User', UserSchema);