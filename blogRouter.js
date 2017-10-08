const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

BlogPosts.create('first post', 'here my sample post created', 'Raoul', '10/5/2017');
BlogPosts.create('second post', 'here my sample post created', 'samuel', '10/4/2017');


//get back all post if get on the root
router.get('/', (req, res)=>{
  res.status(200).json(BlogPosts.get());
});

//adding new post 
router.post('/', jsonParser, (req, res)=> {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for(let i =0; i< requiredFields.length; i++){
    if(!(requiredFields[i] in req.body)){
      const message = `Missing ${requiredFields[i]} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const post = BlogPosts.create(
    req.body.title, req.body.content, req.body.author, req.body.publishDate);
  res.status(201).json(post);
});

//delete a postorm the blog
router.delete('/:id', (req,res)=>{
  BlogPosts.delete(req.params.id);
  console.log('Delete post id `${req.params.id');
  res.status(204).end();
});

//update a post
router.put('/:id',jsonParser, (req, res)=>{
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for(let i =0; i< requiredFields.length; i++){
    if(!(requiredFields[i] in req.body)){
      const message = `Missing ${requiredFields[i]} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if(req.params.id !== req.body.id){
     const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating post id \`${req.params.id}\``);
  const updatedPost = BlogPosts.update({
    id: req.params.id,
    title: req.body.name,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
})

module.exports = router;