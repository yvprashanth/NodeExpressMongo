var express = require('express');
var fixtures = require('./fixtures');
var app = express();

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

var server = app.listen(3000, '127.0.0.1');
module.exports = server;