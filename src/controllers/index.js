/*
* This module provides the functions to render each page. As well as 
* what to do when a user logs out. 
*/

// const passport = require('passport')

const { Task_List,
        User,
        Task } = require('../models')()

// const Pjax = require('pjax')
// const express_pjax = require('express-pjax')


/* ******************** 
* UTILITY FUNCTIONS
********************** */

const getUser = (req, res) => {
    return req.session.passport.user
}

const renderTaskLists = async (req, res, returnLists=false) => {

    /**
    * * Acuire the task lists from the current authenticated user and
    * * pass them to res.locals.
    * @param  {boolean} [returnLists=false] - Return the object containing the task lists 
    */

    const user = getUser(req, res)

    const taskLists = await Task_List.findAll({
        where: {user_id: user},
        attributes: ['list_name', 'list_id'],
        raw: true
    })

    // console.log('Successful: ', taskLists)

    if (taskLists) { 
        res.locals.taskLists = taskLists
    } else {
        res.locals.taskLists = null
    }

    if (returnLists) {
        return taskLists
    }
}

const renderTasks = (req, res, listId, returnTasks=false) => {
    // TODO: Acquire the tasks
}

/* ******************** 
* FUNCTIONS: Render the pages, then export them 
********************** */

exports.loginPage = (req, res) => {
    res.render('auth/login')
}

exports.registerPage = (req, res) => {
    res.render('auth/register')
}

exports.homePage = async (req, res) => {

    if (req.isAuthenticated()) {
        console.log('WELCOME TO THE HOME PAGE, THE USER IS AUTHENTICATED')

        // * If they're authed, we should have access to their id.

        try {
            // Access the task lists, render them.
            const { user } = req.session.passport
            const taskLists = await Task_List.findAll({
                where: {user_id: user},
                attributes: ['list_name', 'list_id'],
                raw: true
            })

            // Add it to locals

            // If they already have task lists created
            if (taskLists) { 
                res.locals.taskLists = taskLists
            } else {
                res.locals.taskLists = null
            }

            res.render('home', {
                sessionID: req.sessionID,
                isAuthenticated: req.isAuthenticated(),
            })
            console.log(res.locals)

        }
        catch(err) {
            console.log(err)
        }
    }
}

exports.profilePage = (req, res) => {
    res.render('profile', {
        user: req.user  
    })
}

exports.taskListPage = async (req, res) => {

    // * Display the task list page, DYNAMICALLY 
    const listId = req.params.list_id

    // Render the Task lists if they have them
    await renderTaskLists(req, res, listId)

    // await renderTasks(req, res)
    res.render('task-list')
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
            })
            // req.session.destroy()
            res.clearCookie('connect.sid')

            return res.redirect('/')
            
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
