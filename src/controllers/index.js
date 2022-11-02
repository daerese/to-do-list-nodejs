/*
* This module provides the functions to render each page. As well as 
* what to do when a user logs out. 


* Notes about user data (Tasks, Task lists):

* - Certain data items need to be globally accessed on each page.
* - These are stored in req.app.locals. EX:
*   - app.locals.taskLists --> All the lists created by users.
*   - app.locals.allTasks --> All the tasks from every list.

* - Certain data items should be locally accessed only within certain pages.
* - These are stored in res.locals. (Variables stored here only last within each req, res cycle.):
*   - app.locals.currentList --> The specific task list being accessed by the user.
*   - app.locals.currentTasks --> The tasks associated with the current Task List.
*/

const { get } = require('../routes');

// const passport = require('passport')

const { Task_List,
        User,
        Task } = require('../models')()

// const Pjax = require('pjax')
// const express_pjax = require('express-pjax')


/* ******************** 
* UTILITY FUNCTIONS
********************** */

const getUser = (req, res, returnFullUser=false) => {
    console.log('User?: ', req.session.passport.user)

    if (returnFullUser) {
        return req.user;
    }

    return req.session.passport.user
}

const getTaskList = (listId, taskLists) => {

    /**
     * * Get a specific task list from the current user
     */

    try {
        for (let list of taskLists) {
            // console.log('THE LIST ID:', list.list_id)
            if (list.list_id == listId) {
                // console.log('\nFOUND THE LIST\n: ', list)
                return list
            }
        }
    } catch(e) {
        console.log(e)
    }
}

const getTasks = (listId, tasks) => {

    try {
        return tasks.filter(task => task.list_id == listId )
    }
    catch(e) {
        console.log(e)
    }

}

const renderTaskLists = async (req, res, returnLists=false) => {

    /**
    * * Acuire the task lists from the current authenticated user and
    * * pass them to app.locals.
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
        req.app.locals.taskLists = taskLists
        // res.locals.taskLists = taskLists
    } else {
        req.app.locals.taskLists = null
    }

    if (returnLists) {
        return taskLists
    }
}

const renderTasks = async (req, res, listId=null, returnTasks=false) => {
    
    /**
    * * Acuire the tasks from the current authenticated user and
    * * pass them to app.locals.
    * @param {integer} [listId=null] - If set to null, simply pass all user's tasks to locals
    * @param  {boolean} [returnLists=false] - Return the object containing the task lists 
    */

    try {
        // // TODO: Acquire and pass the tasks to req.app.locals.
        // TODO: Fetch other data from other tables related to tasks: subtasks, tags, 
    
        /* 
        ? Elements, such as tasks, are rendered on the page by passing them
        ? through app.locals. This makes their information accessible to views, and renderable. 
        */

        const tasks = await Task.findAll({
            where: {user_id: getUser(req, res)},
            raw: true
        })
    
        if (tasks) {
            req.app.locals.allTasks = tasks
        
        } else {
            // If the user doesn't have tasks created already.
            req.app.locals.allTasks = null
            console.log('NO TASKS FOR THIS USER')
        }

        // ? Maybe delete this functionality. It's not needed
        if (returnTasks) {
            return allTasks
        }
        
    } catch(err) {
        console.log(err)
    }
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

            
            if (!req.app.locals.taskLists) {
                
                await renderTaskLists(req, res)
            }
            if (!req.app.locals.allTasks) {

                await renderTasks(req, res)
            }
            res.render('home', {
                sessionID: req.sessionID,
                isAuthenticated: req.isAuthenticated(),
            })

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
    const listId = req.params.id

    // const user = getUser(req, res, true)

    // console.log('User name: ', user.name)

    // * If the task lists haven't been imported to locals for the views, import them.
    if (!req.app.locals.taskLists) {      
        await renderTaskLists(req, res)
    } 
    else {
        // TODO: Acquire the specific task list of this page.
        const currentList = getTaskList(listId, req.app.locals.taskLists)
        
        // * If the tasks haven't been imported to locals for the views, import them.
        if (!req.app.locals.allTasks) {
            await renderTasks(req, res)
        } else {
            console.log('APP.LOCALS.ALLTASKS TASKS IS NOT UNDEFINED')
        }

        // * Filter for tasks with the current list id.
        const currentTasks = getTasks(listId, req.app.locals.allTasks)

        req.app.locals.currentList = currentList
        req.app.locals.currentTasks = currentTasks
        // res.locals.username = await user.name
        
    }
    
    res.render('task-list')
    
    if (req.app.locals.allTasks) {
        console.log('STILL DEFINED AFTER RENDERING.')
    } else {
        console.log('\nAFTER RENDERING, ITS UNDEFINED\n')
    }
    console.log('\nTHE CURRENT LIST: ', req.app.locals.currentList)
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
            
            // TODO: Place all user related data in ONE object, then delete it.
            // TODO: Find a way to reference app locals in a shorter way. 
            delete req.app.locals.taskLists
            delete req.app.locals.currentList

            delete req.app.locals.allTasks
            delete req.app.locals.currentTasks

            res.clearCookie('connect.sid')

            return res.redirect('/')
            
        } else {
            return res.redirect('*')
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