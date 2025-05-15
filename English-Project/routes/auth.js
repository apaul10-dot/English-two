const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation');

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login', { 
        title: 'Login',
        active: 'login',
        error: req.flash('error')
    });
});

router.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register', { 
        title: 'Register',
        active: 'register',
        error: req.flash('error')
    });
});

router.post('/register', isNotAuthenticated, validateRegistration, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/register');
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();
        
        req.login(user, (err) => {
            if (err) {
                req.flash('error', 'Error logging in after registration');
                return res.redirect('/login');
            }
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Error creating account');
        res.redirect('/register');
    }
});

router.get('/logout', isAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router; 