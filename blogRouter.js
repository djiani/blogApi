const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const jsonParser = bodyParser.json();


const {BlogPost} = require('./models');

//get back all post if get on the root
router.get('/', jsonParser, (req, res)=>{
  BlogPost
  .find()
  .then(postres =>{
    res.status(200).json(postres)
  })
  .catch(err =>{
    console.error(err);
    res.status(500).json({message:'Internal server error'})
  })
});

//get back post with a given id 
router.get('/:id', jsonParser, (req, res)=>{
  BlogPost.findById(req.params.id)
  .then(post => res.json(post.apiRepr()))
  .catch(err =>{
    console.error(err);
    res.status(500).json({message:"Internal server error"})
  })
});


//add a new post to a db
router.post('/', jsonParser, (req, res)=>{
  const requiredFields = ['title', 'content'];
  for(let i=0; i < requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = 'Missing '+ field +' in request body';
      console.error(message);
      res.status(400).send(message);
    }
  }
  BlogPost
  .create({
    title:req.body.title,
    content:req.body.content,
    author: req.body.author
  })
  .then(
    post => res.status(201).json(post.apiRepr())
  )
  .catch(err =>{
    console.error(err);
    res.status(500).json({message:'Internal server error'});
  });
});


//edit title of post 
router.put('/:id',jsonParser, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


//delete post 
router.delete('/:id', jsonParser, (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});





module.exports= router;












