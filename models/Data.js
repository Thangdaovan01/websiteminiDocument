const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Data = new Schema({
    title: { type: String},
    content: {type: String},
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User'}


}, {
    timestamps: true,
});


module.exports = mongoose.model('Data', Data);