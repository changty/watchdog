var https = 	require('https'); 
var fs =	require('fs'); 
var express =	require('express'); 
var app =	express(); 
var port= 	5443

var secureServer = https.createServer({
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.crt'),
	ca: fs.readFileSync('./ssl/ca.crt),
	requestCert: true,
	rejectUnauthorized: false
}, app).listen(port, function() {
	console.log("Secure Express server listening on port", port);
}); 
