//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
const posts = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// const mongoURI = "mongodb://localhost:27017/blogDB";

const mongoURI = process.env.DB_URI;



mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

const defaultContentSchema = {
  contentTitle: String,
  contentBody: String,
}

const Content = mongoose.model("Content", defaultContentSchema);

const defaultHome = new Content({
  contentTitle: "Home",
  contentBody: homeStartingContent
});

const defaultAbout = new Content({
  contentTitle: "About",
  contentBody: aboutContent
});

const defaultContact = new Content({
  contentTitle: "Contact Us",
  contentBody: contactContent
});

const defaultContent = [defaultHome, defaultAbout, defaultContact];

//blog collection
const blogSchema = {
  blogTitle: String,
  blogBody: String,
}

const Blog = mongoose.model("Blog", blogSchema);


app.get("/", function(req, res){

  //res.render("home", {homeContentText: homeStartingContent, submittedPost: posts});

  Content.find({}, function(err, results){

    if (err) {
        console.log(err);
    }

    if (results.length === 0){
        //saving the items using insertMany
        Content.insertMany(defaultContent, function(insertERR){
          if (err){
              console.log(insertERR)
          } else {
              console.log("Successfully added default contents to DB");
          }
        });
        res.redirect("/");
        
    } else {

        Content.findOne( { contentTitle: "Home" }, function(error, foundItems){
          if (error){
            console.log(error);
          }

          Blog.find({}, function(blogErr, blogFoundItems){
            if (blogErr){
              console.log(blogErr);
            }

            res.render("home", { homeContentTitle: foundItems.contentTitle, homeContentBody: foundItems.contentBody , submittedPost: blogFoundItems });
          });

        });

    }

  });

});

app.get("/about", function(req, res){

  Content.findOne( { contentTitle: "About" }, function(error, foundItems){

    if (error){
      console.log(error);
    }
    res.render("about", { aboutContentTitle: foundItems.contentTitle, aboutContentBody: foundItems.contentBody});
  });

});

app.get("/contactus", function(req, res){

  Content.findOne( { contentTitle: "Contact Us" }, function(error, foundItems){

    if (error){
      console.log(error);
    }
    res.render("contact", { contactContentTitle: foundItems.contentTitle, contactContentBody: foundItems.contentBody});

  });

});

app.get("/compose", function(req, res){
  res.render("compose");
})



app.post("/compose", function(req, res){

  let postTitle = req.body.postTitle;
  let postBody = req.body.postBody;
  
  const blog = new Blog({
    blogTitle: postTitle,
    blogBody: postBody
  });

  blog.save();

  res.redirect("/");

});


app.get("/posts/:post", function(req, res){
  //console.log(req.params.post)

    Blog.find({}, function(blogErr, blogFoundItems){
      if (blogErr){
        console.log(blogErr);
      }

      blogFoundItems.forEach(function (element){

        if( _.lowerCase(req.params.post) === _.lowerCase(element.blogTitle) ){

          res.render("post", {postContent: element});
    
        } else {

          console.log("Match not found");

        }

      });

    });  

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

app.listen(port, function() {
  console.log("Server started on port 5000");
});
