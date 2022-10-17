/*
* This module provides the functions to render each page. As well as 
* what to do when a user logs out. 
*/

// const passport = require('passport')

/* ******************** 
* FUNCTIONS: Render the pages, then export them 
********************** */

exports.loginPage = (req, res) => {

    res.render('auth/login')
}

exports.registerPage = (req, res) => {
    res.render('auth/register')
}

exports.homePage = (req, res) => {

    res.render('home', {
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    })
    // console.log(req)

    if (req.isAuthenticated()) {
        console.log('WELCOME TO THE HOME PAGE, THE USER IS AUTHENTICATED')
    }
}

exports.profilePage = (req, res) => {

    res.render('profile', {
        user: req.user  
    })
}


/* ******************** 
* Logout 
********************** */

exports.logout = (req, res, next) => {

    try {
        // calling the logout function associated with passport
        if (req.isAuthenticated()) {
            req.logout((err) => {
                if (err) { return next(err) }
                res.redirect('/')
                console.log(req)
            })
        } else {
            // res.send(`<h2>The page you're looking for can't be found</h2>`)
        }
    } catch (err) {
        if (err) {
            console.log(err)
        }
    }
    // Destroy the session
    // req.session.destroy((err) => {
    //     if (err) {
    //         console.log(err)
    //     }
    // })
}
