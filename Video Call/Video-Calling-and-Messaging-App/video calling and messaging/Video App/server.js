const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require('path')
var passport = require('passport');
var cors = require('cors');
const { v4: uuidv4 } = require("uuid");
// for authentication -->
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;
const cookieSession = require('cookie-session');
// -->
const http = require('http');
const server = http.createServer(app);
// starting socket server
const io = require("socket.io")(server);
const { generateMessage, generateLocationMessage } = require('./utils/messagetemplate')
const viewsPath = path.join(__dirname, '/views')

app.set('view engine','ejs');
app.set('view options', { layout: false});
app.set('views', viewsPath)

app.use(cookieSession({
  name: 'session-name',
  keys: ['key1', 'key2']
}))
app.use("/", express.static(__dirname + "/views"));
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// Middleware ( for cheking whether user is already logged in )
// Used for protecting routes
const checkUserLoggedIn = (req, res, next) => {
  req.user ? next(): res.redirect('/');
}

// Routes begin -->
app.get("/",(req,res) => {
  res.render('home');
})

// used for accessing dashboard
app.get('/dashboard', checkUserLoggedIn, (req,res) => {
  res.render("dashboard");
})

// used for creating new meet
app.get("/create",checkUserLoggedIn, (req, res) => {
    res.redirect(`/meet/${uuidv4()}`);
});
  
// used for joining a meet
app.get("/meet/:room", checkUserLoggedIn, (req, res) => {
  console.log(req.params.room);
  res.render("room", { roomId: req.params.room });
});

// all the functionalities related to socket 
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId , userName) => {
    socket.join(roomId)

    socket.emit("createMessage",generateMessage('Admin','Welcome to Mulaqat'))
    socket.broadcast.to(roomId).emit("createMessage",generateMessage('Admin',`${userName} has joined`))
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", generateMessage(userName,message));
    });
    socket.on('sendLocation', (coords) => {
      io.to(roomId).emit('locationMessage', generateLocationMessage(userName, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
   });
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      socket.broadcast.to(roomId).emit("createMessage",generateMessage('Admin',`${userName} left`))
    })
  })
})
// Routes end -->



// Authentication begins -->
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null,id);
});

// GOOGLE AUTH
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    return cb(null,profile);
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/dashboard', failureRedirect: '/' }));


// FACEBOOK AUTH
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null,profile);
  }
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/dashboard',  failureRedirect: '/' }));


// GITHUB AUTH
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/github/callback"
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  return done(null,profile);
}
));

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { successRedirect: '/dashboard',failureRedirect: '/' }));



// SERVER
const port = 5000;
server.listen(port, ()=>{
    console.log(`Server running at ${port}`);
}) 