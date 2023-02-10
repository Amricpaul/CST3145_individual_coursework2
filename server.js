const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoClient = require("mongodb").MongoClient;
const objectId = require('mongodb').ObjectId;


const app = express();
const PORT = process.env.PORT || 3000;


const MONGO_URL = "mongodb+srv://amric:ninja2023@clusterv1.p3b35bu.mongodb.net";
mongoClient.connect(MONGO_URL, { useNewUrlParser: true }, (err, client) => {
    console.log('connected to mongo');
    if (err) {
      console.log(err);
      process.exit(1);
    }
  
    const db = client.db("tutorio");
    console.log("Connected to MongoDB");
  
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  });

const logger = (req, res, next) => {
    console.log(`${req.method} request made to ${req.url}`);
    next();
};
  
app.use(logger);


app.use('/public',(req, res, next) => {
   
    const filePath = path.join(__dirname, "dist", req.url);
    console.log(filePath);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).send("File not found");
      } else {
        next();
      }
    });
});

app.use('/public', express.static(path.join(__dirname, 'dist')));
  

app.get('/post/1', (req, res) => {

    res.send('Hello World');
});

