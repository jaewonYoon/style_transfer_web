//jshint enversion: 6

//require module 
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
const ejs = require("ejs");
const load = require("lodash");
const app = express();
const url = require('url');    

//use module , set ejs module
app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../')));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

///variables///
let posts =[]; 
const homeStartingContent ="It's your own board. feel free to ask any questions in your board and we wiil reply you ASAP";
///routes/// 

app.get("/",function(req,res){
   console.log("home directory is underway");
   res.render("home"); 
});
app.get("/pricing", function(req,res){
    res.sendFile(path.join(__dirname,"../pricing.html"));
});
 
app.get("/signup", function(req,res){
    if(req.url.query){ 
      console.log(req.url.query.email);
      res.render("signup",{email_req: req.url.query.email});
    }
    else res.render("signup",{email_req: ''}); //is null 
//    res.sendFile(path.join(__dirname,"../signup.html"));
});
app.post("/signup",function(req,res){
    let firstName =req.body.fName; 
    let lastName = req.body.lName;
    let email = req.body.email;
    let image = req.body.image;
    
    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                    IMAGE: image,
                }
            }
        ]
    };
    let jsonData = JSON.stringify(data);
    let options={
        url:"https://us20.api.mailchimp.com/3.0/lists/eedf70aa88",
        method: "POST",
        headers: {
            "Authorization" : "21300492@handong.edu 594e723fbd4165a11a82a403db72d4d0-us20"
        },
        body: jsonData
    };
    request(options, function(error, response, body){
        if(error){
            res.sendFile(path.join(__dirname,"../failure.html"));
        } else {
            if(response.statusCode===200){
//                res.sendFile(path.join(__dirname,"../success.html"));
                res.render("success");
            }else {
                res.sendFile(path.join(__dirname,"../failure.html"));
            }
        }
    });
});

app.post("/failure", function(req,res){
    res.redirect("/");
});
////////routes for about.ejs

app.get("/about",function(req,res){
   console.log("test for print");
   res.render("about",{
       context:homeStartingContent,
       posts:posts,
   });
    
});
app.get("/posts/:postName",function(req,res){
   const requestedTitle=req.params.postName
   console.log(req.params.postName); 
   posts.forEach(function(element){
       if(convert(element.title)===convert(requestedTitle))
           res.render("post",{title:element.title, body: element.content});
       else console.log("No match!");
   });
});
/////////routes for compose.ejs

app.get("/compose",function(req,res){
    res.render("compose");
})
app.post("/compose",function(req,res){
   const post ={
   title : req.body.postTitle,
   content : req.body.postBody
   };
   posts.push(post);
   res.redirect("/");
});
//////////routes for masthead
app.post("/masthead",function(req,res){
    let email = req.body.email;
    console.log(email);
    res.redirect(url.format({
       pathname:"signup",
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
