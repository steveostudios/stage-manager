// Event schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var EventSchema = new Schema({
  alert:      {type : String, default : '', trim : true}
  , body:     {type : String, default : '', trim : true}
  , categories: []
  , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
  , createdAt: {type : Date, default : Date.now}
  , current: {type : String, default : '', trim : true}
  , currentStart: {type : Date, default : null}
  , date:     {type : String, default : '', trim: true}
	, program:  {type : String, default : '', trim : true}
  , segments: [{type : Schema.ObjectId, ref : 'Segment'}]
  , series:   {type : String, default : '', trim : true}
  , title:    {type : String, default : '', trim : true}
  , user:     {type : Schema.ObjectId, ref : 'User'} 
})

EventSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Event title cannot be blank')

mongoose.model('Event', EventSchema)