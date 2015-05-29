'use strict';

module.exports = function() {
    return function auth(req, res, next) {        
        if (!req.isAuthenticated()) {
            return res.sendStatus(403);
        }
        next();
    };
};