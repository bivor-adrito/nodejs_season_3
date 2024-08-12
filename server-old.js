const express = require('express');
const app = express()
const bodyParser = require('body-parser')

//? Parse requests
app.use(bodyParser.json())

// http://localhost:3333/
//? To Check if the app is running
app.get('/', (req, res) => {
    res.json({message: "Welcome to our app!"});
})

let users = []
let lastId = 0

//? Create a User
app.post('/users', (req, res) => {
    const user = req.body
    user.id = ++lastId // lastId = lastId + 1
    users.push(user)
    res.status(201).json(user)
})

//? Get all the users
app.get('/users',(req, res)=>{
    res.json(users)
})

//? Get One User
app.get('/users/:id', (req, res)=>{
    const id = parseInt(req.params.id)
    const user = users.find((u) => u.id === id)
    if(user){
        res.json(user)
    }else{
        res.status(404).json({message: "User not found"})
    }
})

//? Update a User
app.put('/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const updateUser = req.body
    const userIndex = users.findIndex((u) => u.id === id)
    if ( userIndex == -1){
        res.status(404).json({message: "User not found"})
    }else{
        users[userIndex] = { ...users[userIndex], ...updateUser }
        res.json(users[userIndex])
    }
})

//? Delete a user
app.delete('/users/:id', (req, res)=>{
    const id = parseInt(req.params.id)
    const userIndex = users.findIndex((u) => u.id === id)
    if ( userIndex == -1){
        res.status(404).json({message: "User not found"})
    }else{
        users.splice(userIndex,1)
        res.json({message: "User deleted"})
    }
})






const port = 3333
app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
})
