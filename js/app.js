//jshint enversion: 6
require('dotenv').config();
//require module 
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
const ejs = require("ejs");
const _ = require("lodash");
const app = express();
const url = require('url');    
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate"); 
//blog default writings
const homeStartingContent = {
          title: "homestartingContent", 
          content:"This blog is tech blog for transfer learning",
      }
const aboutContent = {
          title: "aboutContent",
          content:"if you wish to leave a message, head into localhost:/compose",
}
const contactContent = {
          title: "contact",
          content: "visit our contact page and leave your contact number. we wiil touch you ASAP.",
}
const defaultItem = [homeStartingContent,aboutContent,contactContent];

//use module , set ejs module
app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../')));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

//setup session; initial configuration 
//We set up sessions 
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}));
//we initialize passport
app.use(passport.initialize()); 
//we use passport to manage our session 
app.use( passport.session());

///mongoose network connect///
mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

//mongoose.connect("mongodb+srv://admin-jaewon:test123@cluster0-ehw4p.mongodb.net/blogDB",{useNewUrlParser: true});

//database variable// 
const postSchema = {
     title: String, 
     content:String,
};
//build userSchema used in signup
const userSchema = new mongoose.Schema({
    email: String,
    password: String, 
    googleId: String,
    secret: [postSchema], 
});

const contentSchema = {
    name: String,
    title:[postSchema],
}

//build collection of data. 
const Post = mongoose.model("post",postSchema);
const List = mongoose.model("list", contentSchema);

//이제 passport를 User모델에 사용할 수 있다. 
//we set up schema to use passportLocalMongoose as a plugin 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//build collection name 'User' to use in userDB, 
const User = new mongoose.model("User",userSchema);

// finally we use passport localMongoose to use local login Strategy 
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

//we set up serializeUser and deserializeUser
//passport for session use 
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



/*
    Notice!
    we should set the session before use serialize session and deserialize sesson 
    Also, we have to initialize our passport before use strategies.
*/



//google Oauth 2.0 

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  //google sends back accessToken allow us to use data related to user. 
  //allow us to use user's data longer period 
  //profile gets email, id etc. 
  function(accessToken, refreshToken, profile, cb) {
    console.log("show profile: ");
    console.log(profile);
    User.findOrCreate({ googleId:profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




///routes/// 

app.get("/home",function(req,res){
   console.log("home directory is underway");
   res.render("home"); 
});

//google authentication page
app.get("/auth/google",
  passport.authenticate("google", { scope:["profile"] })
);

//google authentication redirect
app.get("/auth/google/home", 
  //authenticate them locally
  passport.authenticate('google', { failureRedirect: '/signup' }),
  function(req, res) {
    //once we authenticated, 
//    if(req.isAuthenticated()){
        res.redirect("/home");
//    } else {
//        res.redirect("/login");
//    }
//    // Successful authentication, redirect home.
//    res.redirect('/secrets');
  });
//webcam routes
app.get("/webcam",function(req,res){
    console.log("webcam directory is underway");
    res.render("home2");
});

app.get("/pricing", function(req,res){
//    res.sendFile(path.join(__dirname,"../pricing.html"));
    res.render("pricing");
});
 
    //signup
app.get("/signup", function(req,res){
//    if(req.url.query){ 
//      console.log(req.url.query.email);      
//    }
    if(req.isAuthenticated()){
        res.redirect("/home");
    }else{
    res.render("signup");
    }//is null 
//    res.sendFile(path.join(__dirname,"../signup.html"));
});

//post sign up 
app.post("/signup",function(req,res){
//    let nickname =req.body.nickname; 
    let passwordcheck = req.body.passwordcheck;
    let email = req.body.username;
    let password = req.body.password;
   User.register({username:email},password,function(err,user){
     if(err){
         console.log(err);
         res.redirect('/signup');
     } else{
         console.log("before authenticate");
         passport.authenticate("local")(req,res,function(){
             console.log("after authenticate");
             res.redirect('/');
         });
     }
   });
});

//route for logout page 
app.get("/logout", function(req, res){
  console.log(req.user);
  req.logout();
  res.redirect("/");
});
//get in login page
app.get("/",function(req,res){
  res.render("login");
});
//post in login page
app.post("/login", function(req,res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    //method comes from passport 
    req.login(user,function(err){
              if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/home");
                });
            }
    });
});
//subscribe page
app.get("/subscribe_mailchimp",function(req,res){
    res.render("subscribe"); 
});
//post  subscribe 
app.post("/subscribe_mailchimp",function(req,res){
    let email = req.body.email;
    let image = req.body.image_url;
    
    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: "somebody's FNAME",
                    LNAME: "somebody's LNAME",
                    IMAGE: "",
                }
            }
        ]
    };
    //sign up 페이지에서 mailchimp 사용을 위한 코드 
    let jsonData = JSON.stringify(data);
    let options={
        url:"https://us20.api.mailchimp.com/3.0/lists/eedf70aa88",
        method: "POST",
        headers: {
            "Authorization" : "21300492@handong.edu "+ process.env.API_KEY,
        },
        body: jsonData
    };
    //sign up 페이지에서 성공과 실패를 구분하는 페이지 
    request(options, function(error, response, body){
        if(error){
            res.sendFile(path.join(__dirname,"../failure.html"));
        } else {
            if(response.statusCode===200){
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../success.html"));
                res.render("success");
            }else {
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../failure.html"));
                res.render("success");
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../failure.html"));         
                res.render("failure");
            }
        }
    });
});
//get stylerequest page
app.get("/submit_mailchimp",function(req,res){
        res.render("submit");
});
//using mailchimp submit page
app.post("/submit_mailchimp",function(req,res){
//    let firstName =req.body.fName; 
//    let lastName = req.body.lName;
    let email = req.body.email;
    let image = req.body.image_url;
    
    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: "somebody's FNAME",
                    LNAME: "somebody's LNAME",
                    IMAGE: image,
                }
            }
        ]
    };
    //sign up 페이지에서 mailchimp 사용을 위한 코드 
    let jsonData = JSON.stringify(data);
    let options={
        url:"https://us20.api.mailchimp.com/3.0/lists/eedf70aa88",
        method: "POST",
        headers: {
            "Authorization" : "21300492@handong.edu "+ process.env.API_KEY,
        },
        body: jsonData
    };
    //sign up 페이지에서 성공과 실패를 구분하는 페이지 
    request(options, function(error, response, body){
        if(error){
            res.sendFile(path.join(__dirname,"../failure.html"));
        } else {
            if(response.statusCode===200){
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../success.html"));
                res.render("success");
            }else {
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../failure.html"));
                res.render("success");
    // res.sendFile로 응답해도 되나 ejs 사용을 위해 주석처리함                
    // res.sendFile(path.join(__dirname,"../failure.html"));         
                res.render("failure");
            }
        }
    });
});

//failure
app.post("/failure", function(req,res){
    res.redirect("/home");
});

////////routes for about 페이지 
app.get("/about",function(req,res){
   console.log("test for print");
   Post.find({},function(err,foundItem){
      if(foundItem.length===0){
          console.log("no data found."); 
          
          Post.insertMany(defaultItem,function(err){
            if(!err){
                console.log("data successfully added");
            }else{
                console.log(err);
            }
          });
          
          res.redirect('/about');
          
      } else{
          console.log("data found."); 
         res.render("about", {
            startingTitle: "FAQ",
            posts: foundItem,
         }); 
      }
  });
});
//routes for dynamic route pages 
app.get("/posts/:customListName",function(req,res){
   let customListName = req.params.customListName;
    customListName = _.lowerCase(customListName);
    customListName = _.kebabCase(customListName);
    customListName = _.capitalize(customListName);
    Post.find({title: customListName}, function(err,foundItem){
        console.log(customListName);
        if(foundItem.length===0){
              console.log("Data Doesn't Exists!");
        
              res.render("post2",{
                  startingTitle: customListName,
                  post: {
                      title:customListName,
                      content: "현재 해당 주제에 대한 게시글이 없습니다! 첫번째 포스팅을 시작해보세요.",
                  }
              }); 
//            생각해보니까 list가 필요가 없다. 
//            list = new List({
//                name: "default List",
//                title: defaultItem,
//            });
        }else{
            console.log(foundItem);
            console.log("data already Exists!"); 
            res.render("post",{
                startingTitle: customListName,
                posts: foundItem,
            });
        }
    });
});

//routes for compose 페이지 
app.get("/compose",function(req,res){
    res.render("compose");
});
    
app.post("/compose",function(req,res){
//remove static variable 
//  const post = {
//    title: req.body.postTitle,
//    content: req.body.postBody
//  };
  console.log(lodash_transpose(req.body.postTitle));
  const post = new Post({
      title: lodash_transpose(req.body.postTitle),
      content: req.body.postBody,
  })
//  posts.push(post);
  post.save();
  res.redirect("/about");
});

//app.get("/posts/:postName", function(req, res){
//  const requestedTitle = _.lowerCase(req.params.postName);
//
//  posts.forEach(function(post){
//    const storedTitle = _.lowerCase(post.title);
//
//    if (storedTitle === requestedTitle) {
//      res.render("post", {
//        title: post.title,
//        content: post.content
//      });
//    }
//  });
//});




//lodash_transpose function 
var lodash_transpose = function(element){
    element = _.kebabCase(element);
    element = _.lowerCase(element);
    element =_.capitalize(element);
    return element;
}

//routes for masthead
app.post("/masthead",function(req,res){
    let email = req.body.email;
    console.log(email);
    res.redirect(url.format({
       pathname:"submit_mailchimp",
       query: {
          "email":email,
        }
     }));
});

////////////////////////////////////
//dynamic port : process.env.PORT defined by heroku
app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
});
