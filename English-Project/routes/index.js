const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Games routes
router.get('/games/word-scramble', (req, res) => {
    res.render('games/word-scramble', { user: req.user });
});

router.get('/games/food-pairs', (req, res) => {
    res.render('games/food-pairs', { user: req.user });
});

router.get('/games/food-quiz', (req, res) => {
    res.render('games/food-quiz', { user: req.user });
});

router.get('/games/food-heroes', (req, res) => {
    res.render('games/food-heroes', { user: req.user });
});

// Dashboard route (protected)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

module.exports = router; 