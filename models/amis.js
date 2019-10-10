const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');


// Schema defines how friendship will be stored in MongoDB
const AmisSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    //pending//accepted//refused//deleted
    status: {
        type: String,
    },
    bloque_ami: {
        type: Date,
    },

    invitationSender:
        { type: Schema.Types.ObjectId, ref: 'User' },



    invitationReceiver:
        { type: Schema.Types.ObjectId, ref: 'User' }


},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

module.exports = mongoose.model('Amis', AmisSchema); 