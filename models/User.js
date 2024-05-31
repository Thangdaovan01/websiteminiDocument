const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    user_name: { type: String,unique:true, default: '', required: true, maxlength: 100 },
    password: {type: String, minlength: 8, maxlength: 100, required: true},
    fullname: {type: String, maxlength: 100},
    role: { type: String, default: '',  enum: ['user', 'admin'] },
    gender: { type: String, default: 'other',  enum: ['male', 'female', 'other'] },
    dateJoined: { type: Date, default: Date.now },
    profilePicture: { type: String, default: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/10/avatar-trang-4.jpg'},
    coverPicture: { type: String, default: 'https://media.sproutsocial.com/uploads/1c_facebook-cover-photo_clean@2x.png'},
    bio: {type: String, maxlength: 500},
    active: {type: Boolean, default: false },
    birthday: { type: Date },

}, {
    timestamps: true,
});


module.exports = mongoose.model('User', User);