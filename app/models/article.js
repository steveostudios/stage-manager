// Article schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var getTags = function (tags) {
  return tags.join(',')
}

var setTags = function (tags) {
  return tags.split(',')
}

var ArticleSchema = new Schema({
	program: {type : String, default : '', trim : true}
  , series: {type : String, default : '', trim : true}
  , title: {type : String, default : '', trim : true}
  , segments: [{type : Schema.ObjectId, ref : 'Segment'}]
  , body: {type : String, default : '', trim : true}
  , date: {type : String, default : '', trim: true}
  , user: {type : Schema.ObjectId, ref : 'User'}
  , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
  , tags: {type: [], get: getTags, set: setTags}
  , categories: []
  , createdAt  : {type : Date, default : Date.now}
})

ArticleSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Article title cannot be blank')

//ArticleSchema.path('body').validate(function (body) {
//  return body.length > 0
//}, 'Article body cannot be blank')



mongoose.model('Article', ArticleSchema)
