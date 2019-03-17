//jshint enversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../')));
app.use(bodyParser.urlencoded({extended:true}));
///routes/// 

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"../index.html"));
});
app.get("/pricing", function(req,res){
    res.sendFile(path.join(__dirname,"../pricing.html"));
});
app.get("/signup", function(req,res){
    res.sendFile(path.join(__dirname,"../signup.html"));
});
app.post("/signup",function(req,res){
    var firstName =req.body.fName; 
    var lastName = req.body.lName;
    var email = req.body.email;
    var image = req.body.image;
    
    var data = {
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
    var jsonData = JSON.stringify(data);
    var options={
        url:"https://us20.api.mailchimp.com/3.0/lists/eedf70aa88",
        method: "POST",
        headers: {
            "Authorization" : "21300492@handong.edu 69763f2be51c05fd2f4cdaba8249e645-us20"
        },
        body: jsonData
    };
    request(options, function(error, response, body){
        if(error){
            res.sendFile(__dirname +'/failure.html');
        } else {
            if(response.statusCode===200){
                res.sendFile(__dirname + '/success.html');
            }else {
                res.sendFile(__dirname +'/failure.html');
            }
        }
    });
});

app.post("/failure", function(req,res){
    res.redirect("/");
});

////////////////////////////////////
//dynamic port : process.env.PORT defined by heroku
app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
});

//apikey
//69763f2be51c05fd2f4cdaba8249e645-us20

//unique id
//eedf70aa88