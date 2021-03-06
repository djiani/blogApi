
const mongoose = require('mongoose');

//create a blog schema
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
  created:{type:Date, default:Date.now}
})

//virtual schema to return author name
blogPostSchema.virtual('authorName').get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
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
//.model('BlogPost') => refers to the collection name to use in database. 
//but by default, mongo convert this name: 'BlogPost' => 'blogposts'. so behing the scene, we acces our db as follow: db.blogposts. 
module.exports= {BlogPost};