const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');


const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images",express.static(path.join("backend/images")));


mongoose.connect("mongodb://localhost:27017/trial").then(() =>{
  console.log("connected to db");
})
.catch(() => {
  console.log("connection failed");
});

app.use((req , res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
   "Origin, X-Requested-With,Content-Type, Accept, Authorization");

res.setHeader("Access-Control-Allow-Methods",
"GET,POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
