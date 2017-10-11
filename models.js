
const mongoose = require('mongoose');

//create a blog schema
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    fisrtName: String,
    lastName: String
  },
  created:{type:Date, default:Date.now}
})

//virtual schema to return author name
blogPostSchema.virtual('authorName').get(function(){
  return `${this.author.fisrtName} ${this.author.lastName}`.trim();
});

//instance method available on all instances of the models
blogPostSchema.methods.apiRepr = function(){
  return {
    id:this._id,
    title:this.title,
    content:this.content,
    author:this.authorName,
    created:this.created
  };
}


const BlogPost = mongoose.model('BlogPost', blogPostSchema);
module.exports= {BlogPost};