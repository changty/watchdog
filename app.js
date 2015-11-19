var https = 	require('https'); 
var fs =		require('fs'); 
var exec = 		require('child_process').exec;

var express =	require('express'); 
var app =		express(); 

var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser'); 

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy

var crypto = require('crypto');

var exphbs = require('express-handlebars'); 
var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		isActive: function(device) {
			return device + " moi";
		}
	}

});

var config = 	require('./config');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
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
  		console.log(crypto.createHash('sha256').update(password).digest('base64'));
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

app.get('/loginSuccess', ensureAuthenticated, function(req, res) {
	res.send('success!');
});

app.get('/loginFailure', function(req, res) {
	console.log("failure");
	res.send('failure!');
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/loginFailure', successRedirect: '/control' }),
  function(req, res) {
    res.render('login');
});

app.post('/action', ensureAuthenticated,  function(req, res) {
    console.log(req.body);

    var device = findDevice(req.body.device);
    
	var cmd = req.body.status === 'on' ? device.offCommand : device.onCommand;
	console.log(device, cmd);

	exec(cmd, function(error, stdout, stderr) {
		    res.send('ok');
	});
});

app.get('/control', ensureAuthenticated, function(req, res) {
	data = {'devices': config.devices}; 
	res.render('control', data);
});

app.post('/isActive', ensureAuthenticated, function(req, res) {
    var device = findDevice(req.body.device);

	var cmd = 'ping -c 1 ' + device.ip;  
	console.log("isActive", device, cmd);

	exec(cmd, function(error, stdout, stderr) {
		    if(stdout == '') {
		    	res.send('off');
		    }
		    else {
		    	res.send('on');
		    }
	});

});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.redirect('/');
}

function findDevice(mac) {
	for(var i=0; i<config.devices.length; i++) {
		if(mac === config.devices[i].mac) {
			return config.devices[i];
		}
	}
}

app.use(express.static('public'));
