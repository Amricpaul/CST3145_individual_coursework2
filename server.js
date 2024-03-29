const express = require('express');
const path = require('path');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

//connect to MongoDB
let uri =  "mongodb+srv://amric:ninja2023@clusterv1.p3b35bu.mongodb.net";
let db;
MongoClient.connect(uri, (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  db = client.db('tutorio');
  console.log('Connected to database');
});

//request logger
const logger = (req, res, next) => {
    console.log(`${req.method} request made to ${req.url}`);
    next();
};
app.use(logger);

//set cross origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// //static files middleware
app.use('/public',(req, res, next) => {
   
    const filePath = path.join(__dirname, "public", req.url);
    console.log(filePath);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).send("File not found");
      } else {
        next();
      }
    });
});
app.use('/public', express.static(path.join(__dirname, 'public')));
  
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Collection Param
// app.param('collectionName', (req, res, next, collectionName) => {
//   req.collection = db.collection(collectionName)
//   return next()
// })

//get lessons
app.get('/collection/lessons', (req, res, next) => {
  db.collection('lessons').find({}).toArray((e, result) => {
      if(e) return next(e)

      const rootUrl = req.protocol + '://' + req.get('host')+ '/public/';

      result.map(lesson => {
        // Update the image URL with an absolute URL
        //regex to remove last first forware slash
        lesson.img = lesson.img.replace(/^\/+|\/+$/g, '');
        lesson.img = rootUrl + lesson.img;
        return lesson;
      });

      res.send(result)
  })
})


//create new order
app.post('/collection/orders/create', (req, res, next) => {
  db.collection('orders').insertOne(req.body, (e, result) => {
      if(e) return next(e)
      res.send(result)
  })
})

//update lesson
app.put('/collection/lesson/:id', (req, res, next) => {
    db.collection('lessons').updateOne(
      {_id:new ObjectId(req.params.id)},
      {$set: req.body},
      {safe: true, multi: false},
      (e, result) => {
          if(e) return next(e)
          console.log(result);
          res.send((result) ? {msg: 'success', updatedId: req.params.id, requestBody: req.body} : {msg: 'error'})
      })
});


//search lessons
app.get('/collection/lessons/search/:key', async (req, res, next) => {

 db.collection('lessons').find({title: {$regex: new RegExp(req.params.key+'.*', 'i')}}).toArray((e, result) => { 
    if(e) return next(e)

    const rootUrl = req.protocol + '://' + req.get('host')+ '/public/';

    result.map(lesson => {
      // Update the image URL with an absolute URL
      //regex to remove last first forware slash
      lesson.img = lesson.img.replace(/^\/+|\/+$/g, '');
      lesson.img = rootUrl + lesson.img;
      return lesson;
    });

    res.send(result);
  });
});

