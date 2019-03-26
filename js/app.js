//jshint enversion: 6

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

///mongoose network connect///

mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser: true});
//mongoose.connect("mongodb+srv://admin-jaewon:test123@cluster0-ehw4p.mongodb.net/blogDB",{useNewUrlParser: true});

//database variable// 
const postSchema = {
     title: String, 
     content:String,
};

const contentSchema = {
    name: String,
    title:[postSchema],
}
//build collection of data. 
const Post = mongoose.model("post",postSchema);
const List = mongoose.model("list", contentSchema);


///routes/// 

app.get("/",function(req,res){
   console.log("home directory is underway");
   res.render("home"); 
});
app.get("/pricing", function(req,res){
    res.sendFile(path.join(__dirname,"../pricing.html"));
});
 
    //signup
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
//                res.sendFile(path.join(__dirname,"../failure.html"));
                res.render("failure");
            }
        }
    });
});

//failure
app.post("/failure", function(req,res){
    res.redirect("/");
});
////////routes for about.ejs

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
/////////routes for compose.ejs

app.get("/compose",function(req,res){
    res.render("compose");
})
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
