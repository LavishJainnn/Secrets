const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

app.use(session({
  secret: "yourSecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://lavishjain30306:90IiFc8QkJ9lwHr4@cluster0.8mwaclu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  })
}));



app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://lavishjain30306:90IiFc8QkJ9lwHr4@cluster0.8mwaclu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
const dt = mongoose.Schema({
    email: String,
    password: String,
    secr: String
});

const secret = "LittleSecret."
dt.plugin(encrypt,{secret: secret, encryptedFields: ["password"]});

const items = mongoose.model("secrets", dt);

app.get("/", function(req,res){
    res.render("partials/home");
});

app.post("/login", function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    
    items.findOne({email: req.body.email})
        .then(found => {
            if(found.password === password){
                req.session._id = found._id;
                res.render("partials/secrets");
            }
            else{
                res.send("Incorrect password.");
            }
        })
        .catch(err => {
            console.log(err);
        });
});
app.get("/login", function(req,res){
    res.render("partials/login");
});

app.post("/register", function(req,res){
    const user = new items({
        email: req.body.email,
        password: req.body.password
    });
    user.save()
    .then(done => {
        res.render("partials/login");
    })
    .catch(err => {
        console.log(err);
    });
});
app.get("/register", function(req,res){
    res.render("partials/register");
});

app.post("/submit", function(req,res){
    const s = req.body.secret;
    if(req.session._id){
        items.findByIdAndUpdate(req.session._id, {secr: s})
            .then(found => {
                res.render("partials/secrets");
            })
            .catch(err => {
                console.log(err);
            });
    };
});
app.get("/submit", function(req,res){
    res.render("partials/submit");
});

app.listen(3000,function(){
    console.log("Server started successfully !");
});