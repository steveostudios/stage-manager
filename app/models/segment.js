// event segment schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var SegmentSchema = new Schema({
    segment_title: {type : String, default : ''}
  , segment_trt: {type : String, default : ''}
  , segment_type: {type : String, default : ''}
})

mongoose.model('Segment', SegmentSchema)
