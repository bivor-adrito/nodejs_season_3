Backend 
Bivor Faruque
Js Basics
React
Frontend

Saas
Design [UI/UX]
    Figma
    Adobe XD
Development
    Frontend 
    Backend
        API => Data
    Full Stack
    DevOps

Node Js => Express Js => Database => API

Database
    1. SQL => MySQL, PostgreSQL
        School
            Teacher
            Student
            Class
    2. NoSql => MongoDb 

Overview: 
    - Introduction
        - Node Js setup [DONE]
        - VS Code [DONE]
        - How to open folder in VS Code [DONE]
    - Create my first node Js app [Done]
        - npm [Done]
        - express [Done]
        - How to run a node js app using command [Done]
    - Create our first API
        - Learn Postman => How to test APIs with Postman
    - Learn CRUD operation
        - Do different APIs
        - Create a simple user management system using CRUD
    - MongoDb Atlas
        - How to connect to MongoDB with your APP

    - CRUD operations with MongoDB
        - User Management [P1]

    - Build a simple task management backend [p2]

    - User Auth

    - Code Modularize 

    - One Vendor Marketplace

    - SQL

 
    - First Req
    - Learn CRUD operation
        C => Create => POST [DONE]
        R => Read => GET
            1. GET all users [DONE]
            2. GET one user [DONE]
        U => Update => PUT || PATCH [DONE]
        D => Delete => DELETE [DONE]



    - MongoDB
        -atlas => create account => project create => cluster create [DONE]
            NOTE: save the user name and password
        -MongoDB Compass
    - Connect our app to mongodb
        - mongoose
        - create middleware
    - Learn environmental variables
    - Learn .gitignore
    - Modularization
    - Create [DONE]
        - Create a user in mongodb
            -create a model
            -create a route
            -create a post req
    - Read => GET [DONE]
        - Get all users [DONE]
        - Get one user [DONE]
    - Update => PUT [DONE]
        - Update one user [DONE]
            - Learn about {new: true} flag [DONE]
    - Delete => DELETE [DONE]
        - Delete one user

        User
            fName => John
            lName => Doe
    
    - Authentication 
        - Step 1: Adjust the create user [DONE]
            --User--
            fname => John
            lname => Doe
            email 
            password => Never directly save to database => always encrypt password
        - Step 2: Login
            1. There will be 2 types [DONE]
                a. Email
                    - email + password
                    if email and password are verified => return => accessToken and refreshToken
                b. Refresh

        - JWT - Access token and Refresh Token
            - Json Web Token

    - Refactoring [DONE]

    - ToDo app with authentication

    - MongoDB Aggregation [Done]
        - How to paginate and filter data

    - How to validate a request
        - express-validator

    - One Vendor Marketplace
    Features
        1. There will be two types of users [DONE]
            a. Admin
            b. Customer

        - Admins will be able to do the followings
            1. Admin will be able to create a product [DONE]
            2. Admin will be able to upload an image on the product [DONE]
            3. Admin will be able to update a product
            4. Admin will be able to see all the products
            5. Admin will be able to see a specific product
            6. Admin will be able to delete [amend] a product
            6. Admin will be able to make change to an order

        - Customers will be able to do the followings
            1. Customers will be able to see all the products
            2. Customers will be able to see the details of a product
            3. Customers will be able to make an order
            3. Customers will be able to cancel an order

        - Customers will NOT be able to do the followings
            1. Customers will not be able to create a product
            2. Customers will not be able to upload an image on the product
            3. Customers will not be able to update a product
            4. Customers will not be able to delete a product
    
    Database structure and changes: 

        - User {
            ...user [Means the previous schema]
            userType [Customer, Admin]
        }
        - Product {
            name: string,
            description: string,
            madeIn: string,
            price: number,
            userId: ObjectId,
            category: string,
            fileId: ObjectId
        }
        - File {
            name: string,
            path: string,
        }
        - Order {
            productId: ObjectId,
            userId: ObjectId,
            qty: number,
            total: number,
            purchaseDate: Date,
            deliveryLocation: string,
            expectedDeliveryDate: Date,
            deliveryStatus: [delivered, in-progress, canceled]
        }










Rules:
    Question
    Discord
    Sun, Mon, Wed
    9 - 10 



Commands: 
    npm init
    npm init -y
    npm i express --save
    npm run start
    npm i nodemon --save-dev
    npm i body-parser --save
    npm i mongoose --save
    npm i dotenv --save
    npm i bcrypt --save
    npm i jsonwebtoken --save
    npm i express-validator --save
    npm install --save multer

Task 1: Next Sunday
    Create a simple Todo App server:
        1. Create a task
        2. Update a task by ID
        3. Get list of all tasks
        4. Get one task by ID
        4. Delete one task by ID
    BONUS: 
        1. This should be a new project
        2. The code should be modularized
        3. It should be well commented



Class 45: [DONE]
    1. Previous Class => Mongodb user create

    read [DONE]
    update [DONE]
    delete [DONE]

Class 42: [DONE]
    1. How to use debugger

Check Projects
