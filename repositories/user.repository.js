const {Pool} = require('pg')

// Create a new pool instance

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database:'market',
    password: 'admin',
    port: 5432
})

const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fname VARCHAR(255),
        lname VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        userType VARCHAR(50) CHECK (userType IN ('admin', 'customer')) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
    await pool.query(query)
}

const User = {
    create: async (userData) => {
        const {fname, lname, email, password, userType} = userData
        const query = `
            INSERT INTO users (fname, lname, email, password, userType) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [fname, lname, email, password, userType]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    findById: async (id) => {
        const query = `
            SELECT * FROM users WHERE id = $1;
        `;
        const values = [id]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    findOne: async(field, value) => {
        const query = `
            SELECT * FROM users WHERE ${field} = $1;
        `;
        const values = [value]
        const result = await pool.query(query, values)
        return result.rows[0]
    }, 

    findAll: async( ) =>{
        const query = `
            SELECT * FROM users;
        `;
        const result = await pool.query(query)
        return result.rows
    },

    update: async (id, userData) => {
        const {fname, lname, email, password, userType} = userData
        const query = `
            UPDATE users 
            SET fname = COALESCE($1, fname), 
                lname = COALESCE($2, lname), 
                email = COALESCE($3, email), 
                password = COALESCE($4, password), 
                userType = COALESCE($5, userType), 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 RETURNING *;
        `;
        const values = [fname, lname, email, password, userType, id]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    delete: async (id) => {
        const query = `DELETE FROM users WHERE id= $1 RETURNING *;`
        const res = await pool.query(query, [id])
        return res.rows[0]
    }






}

const init = async () => {
    await createUsersTable()
    console.log('Users table created or already exists')
}

init().catch(err => console.error(err))
module.exports = User