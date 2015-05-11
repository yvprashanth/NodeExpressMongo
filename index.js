var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fixtures = require('./fixtures');
var methodOverride = require('method-override');
var _ = require('lodash');
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function(req, res){
	res.sendFile("index.html", {"root": __dirname});
});

//app.use(function (req, res, next) {
//  console.log(req.body); // populated!
//  next();
//});

// create application/json parser
var jsonParser = bodyParser.json();

app.post('/login', function(req,res){
	var userName = req.body.user;
	console.log(req.body.user);
	res.send(userName);
});

// Given Solution
//var _ = require('lodash')
//  , bodyParser = require('body-parser')
//
//app.use(bodyParser.json())
//
//app.post('/api/users', function(req, res) {
//  var user = req.body.user
//
//  if (_.find(fixtures.users, 'id', user.id)) {
//    return res.sendStatus(409)
//  }
//
//  user.followingIds = []
//  fixtures.users.push(user)
//
//  res.sendStatus(200)
//})

// Sort the tweets by created time
		var sortedTweets = function(data){
			return data.tweets.sort(function(t1, t2){
				if(t1.id > t2.id){
					return -1;
				}else if(t1.id === t2.id){
					return 0;
				} else {
					return 1;
				}
			});
		}

// My Solution - Step 7
app.post('/api/tweets', function(req, res){
	var tweet = req.body.tweet;
	if(_.find(fixtures.tweets, 'userId', tweet.userId)){
		return res.sendStatus(409);
	};	
	tweet.id = parseInt(sortedTweets(fixtures)[0].id) + 1;
	console.log(tweet.id);
	tweet.id = tweet.id.toString();
	tweet.created = Math.round((new Date()).getTime() / 1000);
	
//	console.log(idExists);
//	if(idExists)
//			tweet.id = (parseInt(idExists) + 1);
//	console.log(tweet.id);
//	var ifFound = _.findIndex(sortedTweets, { 'user': 'fred', 'active': false });
	
	fixtures.tweets.push(tweet);
	
	var result = {tweet : tweet};
	res.send(result);
});


// My Solution - Step 6
app.post('/api/users', function(request, response){
	if (!request.body)
			return response.sendStatus(400);
		var tempFixtures = fixtures;
		if(userIdExists(request.body.user.id, tempFixtures)){
			response.sendStatus(409);
		}
		else{
			if(!request.body.user.followingIds){
				var fIds = [];
				request.body.user.followingIds = fIds;
			}
			 tempFixtures.users.push(request.body.user);
			 fixtures = tempFixtures;
			 response.send(fixtures.users);
		}
});

function userIdExists(id, tempFixtures) {
	var userIdExists = tempFixtures.users.filter(function( obj ) {
  				return obj.id == id;
		});
	return userIdExists.length;
}

app.get('/api/tweets', function(req, res){
	var userId = req.query.userId;	
	if(typeof userId === "undefined" || userId === null || userId === ""){
		return res.status(400).send("Bad Request");
	}
	
	var tweets = [];
	
	var userIdExists = fixtures.tweets.filter(function( obj ) {
  				return obj.userId == userId;
		});
	
	// If user id does not exist send empty array
	if(userIdExists.length === 0)
		return res.status(200).send({
			tweets : []
		});
	
	for(var i = 0; i < fixtures.tweets.length; i++){
		tweets.push(fixtures.tweets[i]);	
	}
	
		// Sort the tweets by created time
		var sortedTweets = tweets.sort(function(t1, t2){
			if(t1.created > t2.created){
				return -1;
			}else if(t1.created === t2.created){
				return 0;
			} else {
				return 1;
			}
		});
		
		function userIdMatch(value) {
		  return value.userId == userId;
		}
		var filtered = sortedTweets.filter(userIdMatch);
		
		return res.send({
			tweets : filtered
		});
		
	return res.send({
		tweets : sortedTweets
	});
});


// Task 5

app.get('/api/users/:userId', function(req, res){
	var userId = req.params.userId;
	var user = null;
	for(var i = 0; i < fixtures.users.length; i++){
		if(fixtures.users[i].id === userId)
			user = fixtures.users[i];
	}
	
	if(!user){
		return res.sendStatus(404);
	}
	return res.send({
		user : user
	});
});

var server = app.listen(3000, '127.0.0.1', function(req, res){
	console.log('Started on port 3000 for 127');
});
module.exports = server;