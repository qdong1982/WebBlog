

const express               = require('express'),
      bodyParser            = require('body-parser'),
      mongoose              = require('mongoose'),
      ejs                   = require("ejs"),
      _                     = require("lodash"),

      //npm install for passport js
      passport              = require('passport'),
      localStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      session               = require('express-session');
      
      //===Modules===//
      User                  = require('./models/user');
      Post                  = require('./models/post');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//==== Connecting Mongoose ====//
mongoose.connect("mongodb://localhost:27017/blog2DB", {
  useNewUrlParser: true,
  useFindAndModify: false
});

//====Telling the app.js to use passport - always require if use passport js
app.use(session({
  secret:'My boss lady is the best and awesome wife.',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});



//===========
//ROUTES
//==========

  app.get("/", function(req, res) {
    res.render('home');

  });

  app.get("/secrets", isLoggedIn, function(req, res) {

    //Using the model.find from mongoose to fetch the post from compose.ejs
    Post.find({}, function(err, posts) {
      if (err) {
        console.log(err);
      } else {
        
        res.render("secrets", {
          startingContent: homeStartingContent,
          posts: posts
        });
      }
    });
  });



// ===== AUTH ROUTES =====///
app.get('/register', function(req, res){
  res.render('register');
});

//====Handling user sign up ===///
app.post('/register', function(req, res){
  User.register(new User({username:req.body.username}), req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect('register');
  }else{
    passport.authenticate('local')(req, res, function(){
      res.redirect('secrets');
    });
  }
});
});

//LOGIN ROUTES
//render login form
app.get('/login', function(req, res){
  res.render('login');
});

//Login logic
app.post('/login', passport.authenticate('local',{
  successRedirect: '/secrets',
  failureRedirect: '/login'
  //middleware
}), function(req, res){
});

//Logout
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  } res.redirect('/login');
}

app.get("/compose", isLoggedIn, function(req, res) {
  res.render('compose');
});

app.post("/compose", isLoggedIn, function(req, res) {
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  const post = new Post({
    title: postTitle,
    content: postBody
  });

  //add a callback function to save method. Only redirect if there is no err
  post.save(function(err) {
    if (!err) {
      res.redirect('/secrets');
    }
  });
});


//Link to the whole post page; express route parameter
app.get('/posts/:postTitle', isLoggedIn, function(req, res) {
  
  Post.findOne({
    title: req.params.postTitle,
  }, function(err, post) {

    res.render('post', {
      title: post.title,
      content: post.content

    });
  });
});


app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactContent: contactContent
  });
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
