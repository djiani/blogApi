const express = require('express');
const router = express.Router();
const morgan = require('morgan');


//const jsonParser = bodyParser.json();
const app = express();

const blogPostRouter = require('./blogRouter');

app.use(morgan('common'));

app.get('/', (req, res)=>{
  console.log('test running app');
});

app.use('/blog-posts',blogPostRouter);



app.listen(process.env.PORT || 8080, () =>{
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});