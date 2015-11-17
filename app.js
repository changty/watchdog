var https = 	require('https'); 
var fs =		require('fs'); 
var express =	require('express'); 
var app =		express(); 

var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser'); 

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy

var crypto = require('crypto');

var config = 	require('./config');


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false})); 
app.use(cookieParser()); 
app.use(require('express-session')( {
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 


// passport config
passport.use(new LocalStrategy(
  function(username, password, done) {
  		console.log(crypto.createHash('sha256').update(password).digest('base64'), username);
  		if(username === config.username && crypto.createHash('sha256').update(password).digest('base64') === config.pwdHash) {
	    	return done(null, true);
  		}
  		else {
  			return done(null, false);
  		}
  }
));

passport.serializeUser(function(user, done) {
  done(null, true);
});

passport.deserializeUser(function(id, done) {
    done(null, true);
});

var secureServer = https.createServer({
	key: fs.readFileSync(config.key),
	cert: fs.readFileSync(config.cert),
	ca: fs.readFileSync(config.ca),
	requestCert: true,
	rejectUnauthorized: false
}, app).listen(config.port, function() {
	console.log("Secure Express server listening on port", config.port);
}); 


app.get('/test', ensureAuthenticated, function(req, res) {
	console.log("moi");
	res.send('test!');
});

app.get('/loginSuccess', ensureAuthenticated, function(req, res) {
	res.send('success!');
});

app.get('/loginFailure', function(req, res) {
	res.send('failure!');
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/loginFailure', successRedirect: '/loginSuccess' }),
  function(req, res) {
    res.redirect('/');
});

app.post('/control', ensureAuthenticated, function(req, res) {
	res.sendfile('./public/control.html');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.redirect('/');
}

app.use(express.static('public'));
