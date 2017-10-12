const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

//call the should module
const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../index');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  console.info('seeding Blog data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogData());
  }
  // this will return a promise
  return BlogPost.insertMany(seedData);
}



function generateBlogData() {
  return {
    title: faker.company.companyName(),
    content: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    created: faker.date.past()
  }
}


//delete the entire database
function tearDownDb(){
  console.warn('Deleting the database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPost API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedBlogPostData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('GET endpoint', function(){
    it('should return all existing posts in the blog', function(){
      let res; 
      return chai.request(app)
      .get('/posts')
      .then(function(_res){
        res = _res;
        res.should.have.status(200);
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count){
        res.body.should.have.length.of(count);
      });
    });


    it('should return blog post with right fields', function(){
      let resPost;
      return chai.request(app)
      .get('/posts')
      .then(function(res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length.of.at.least(1);

        res.body.forEach(function(post) {
          post.should.be.a('object');
          post.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
        });
        resPost = res.body[0];
        return post.findById(post.id);
      })
      .then(function(post) {
        resPost.id.should.equal(post.id);
        resPost.title.should.equal(post.title);
        resPost.content.should.equal(post.content);
        resPost.author.should.equal(post.author);
        resPost.created.should.contain(post.created);
      });
    });

  });

   describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the blogpost we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new post', function() {

      const newPost = generateBlogData();

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
          res.body.title.should.equal(newPost.title);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.content.should.equal(newPost.content);
          res.body.author.should.equal(newPost.author);
          return BlogPost.findById(res.body.id);
        })
        .then(function(post) {
          post.title.should.equal(newPost.tile);
          post.content.should.equal(newPost.content);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
          post.created.should.equal(newPost.created);
        });
    });
  });

 describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing post from db
    //  2. Make a PUT request to update that post
    //  3. Prove post returned by request contains data we sent
    //  4. Prove post in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        name: 'fofofofofofofof',
        cuisine: 'futuristic fusion'
      };

      return BlogPost
        .findOne()
        .then(function(post) {
          updateData.id = post.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);

          return BlogPost.findById(updateData.id);
        })
        .then(function(post) {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
        });
      });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a post
    //  2. make a DELETE request for that post's id
    //  3. assert that response has right status code
    //  4. prove that post with the id doesn't exist in db anymore
    it('delete a post by id', function() {

      let post;

      return BlogPost
        .findOne()
        .then(function(_post) {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(function(_post) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_restaurant.should.be.null` would raise
          // an error. `should.be.null(_restaurant)` is how we can
          // make assertions about a null value.
          should.not.exist(_post);
        });
    });
  });

});

