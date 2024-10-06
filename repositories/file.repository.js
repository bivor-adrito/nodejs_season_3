const {Pool } = require('pg')

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database:'market',
    password: 'admin',
    port: 5432
})

const createFilesTable = async() => {
    const query = `
    CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
    await pool.query(query)
    console.log('Files table created or already exists')
}

const File = {
    create: async (fileData) => {
        const {name, path} = fileData
        const query = `
            INSERT INTO files (name, path) 
            VALUES ($1, $2) RETURNING *;
        `;
        const values = [name, path]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    findById: async (id) => {
        const query = `
            SELECT * FROM files WHERE id = $1;
        `;
        const values = [id]
        const result = await pool.query(query, values)
        return result.rows[0]
    },
}

const init = async () => {
    await createFilesTable()
}

init().catch(err => console.error(err))

module.exports = File