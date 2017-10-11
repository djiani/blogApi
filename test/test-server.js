const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../index');

// this lets us use *should* style syntax in our tests
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('posts', function(){
  before(function(){
    return runServer();
  })

  after(function(){
    return closeServer();
  });

  it('List all post on GET', function(){
    return chai.request(app)
    .get('/posts')
    .then(function(res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.a('array');
      res.body.length.should.be.at.least(1);
      const expectdKeys = ['id', 'title', 'content', 'author', 'publishDate'];
      res.body.forEach(function(post){
        post.should.be.a('object');
        post.should.include.keys(expectdKeys);
      });
    });
  });

  it('should add a new blog on POST', function(){
    const newBlog = {title:"test", content:"integration test on POST", author:"author1", publishDate:"10/5/2017"}
    return chai.request(app)
    .post('/posts')
    .send(newBlog)
    .then(function(res){
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.id.should.be.not.null;
      res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
    });
  });

  it('should update post on PUT', function(){
    const updateBlog = {
      title: "test2", 
      content: "integration test on POST update", 
      author: "author1", 
      publishDate: "10/5/2017"
    };
    return chai.request(app)
    .get('/posts')
    .then(function(res){
      updateBlog.id = res.body[0].id;
      return chai.request(app)
      .put(`/posts/${res.body[0].id}`)
      .send(updateBlog)
      .then(function(res){
        res.should.have.status(204);
      });
    }) 
  });

  it('should delete post on DELETE', function(){
    return chai.request(app)
    .get('/posts')
    .then(function(res){
      return chai.request(app)
      .delete(`/posts/${res.body[0].id}`)
      .then(function(res){
        res.should.have.status(204);
      });
    }) 
  });

});
