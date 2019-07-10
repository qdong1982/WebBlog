//jshint esversion: 6

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});


//create a mongoose model
module.exports = mongoose.model("Post", postSchema);
