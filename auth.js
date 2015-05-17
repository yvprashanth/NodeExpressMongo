var passport = require('passport');
var fixtures = require('./fixtures');
var express = require('express');
var _ = require('lodash');
var app = express();
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {

  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
 var user = _.find(fixtures.users, 'id', id );
    if (!user) {
        return done(null, false);
    }
    done(null, user);
});

module.exports = passport;