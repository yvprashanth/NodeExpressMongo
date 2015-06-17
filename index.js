var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fixtures = require('./fixtures');
var childprocess = require('child_process');
var shortid = require('shortid');
var methodOverride = require('method-override');
var _ = require('lodash');
var session  = require('express-session')
var passport  = require('./auth');
var ensureAuthentication = require('./ensureAuthentication');

app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(bodyParser.urlencoded({extended : false}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

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
		};

// My Solution - Step 7
//app.post('/api/tweets', ensureAuthentication(), function(req, res){
//    
//	var tweet = req.body.tweet;
//    
//      if (req.user.id !== req.params.userId) {
//        return res.sendStatus(403)
//      }
//    
//	
//	var tweetData = req.body.tweet;
////	 tweetData.userId = req.user.id;
//	
////	console.log(tweetData); 
//	if(_.find(fixtures.tweets, 'userId', tweet.userId)){
//		return res.sendStatus(409);
//	};	
//	tweet.id = parseInt(sortedTweets(fixtures)[0].id) + 1;
//	tweet.id = tweet.id.toString();
//	tweet.created = Math.round((new Date()).getTime() / 1000);
//	
//	fixtures.tweets.push(tweet);
//	var result = {tweet : tweet};
//	res.send(result);
//});
//

app.post('/api/tweets', ensureAuthentication(), function(req, res) {
    var tweet = req.body.tweet;
    tweet.userId = req.user.id;
    tweet.id = Math.random();
    tweet.created = Date.now() / 1000 | 0;

    fixtures.tweets.push(tweet);

    //console.log(fixtures.tweets);
    res.send({ tweet: tweet })
});



app.post('/api/auth/login', function(req, res) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.sendStatus(500)
        }
        if (!user) {
            return res.sendStatus(403)
        }
        req.login(user, function(err) {
            if (err) {
                return res.sendStatus(500)
            }
            return res.send({ user: user })
        })
    })(req, res)
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

		
// Task 9 
app.delete('/api/tweets/:id',  ensureAuthentication(), function(req, res) {
	var tweetid = _.find(fixtures.tweets, 'id', req.params.id);
	if(req.user.id !== tweetid.userId){
		return res.sendStatus(403);
	}
	if(tweetid){
		fixtures.tweets = _.without(fixtures.tweets, _.findWhere(fixtures.tweets, tweetid));
		return res.sendStatus(200);
	}
	else		
		return res.sendStatus(404);
});

// Given Solution
//app.delete('/api/tweets/:tweetId', function(req, res) {
//  var removedTweets = _.remove(fixtures.tweets, 'id', req.params.tweetId)
//
//  if (removedTweets.length == 0) {
//    return res.sendStatus(404)
//  }
//
//  res.sendStatus(200)
//})

// Task 8
app.get('/api/tweets/:tweetId', function(req, res){
	var tweetId = req.params.tweetId;
	var tweet = null;
	for(var i = 0; i < fixtures.tweets.length; i++){
		if(fixtures.tweets[i].id === tweetId)
			tweet = fixtures.tweets[i];
	}
	
	if(!tweet){
		return res.sendStatus(404);
	}
	return res.send({
		tweet : tweet
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

app.post('/api/auth/login', function(req, res, next){	
	passport.authenticate('local', function(err, user, info) {
		if(err) {
            return res.sendStatus(500);
        } 
        if(info) {
            return res.sendStatus(403);
        }

	    req.login(user, function(err) {			
	      	if (err) {
                return res.sendStatus(500);
            }
			if (!user) { return res.redirect('/login'); }
			 return res.send({ user: user });
	    });
	  })(req, res, next);
});

var server = app.listen(3000, '127.0.0.1', function(req, res){
	console.log('Started on port 3000 for 127');
});
module.exports = server;