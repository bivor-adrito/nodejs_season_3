const {Pool} = require('pg')

// Create a new pool instance

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database:'market',
    password: 'admin',
    port: 5432
})

const createProductsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        made_in VARCHAR(255),
        category VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        file_id INTEGER REFERENCES files(id),
        user_id INTEGER REFERENCES users(id),
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
    await pool.query(query)
}

const Product = {
    create: async (productData) => {
        const {name, description, madeIn, category, price, fileId, userId} = productData
        const query = `
            INSERT INTO products (name, description, made_in, category, price, file_id, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `;
        const values = [name, description, madeIn, category, price, fileId, userId]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    findById: async (id) => {
        const query = `
            SELECT * FROM products WHERE id = $1;
        `;
        const values = [id]
        const result = await pool.query(query, values)
        return result.rows[0]
    },

    findByIdPopulated : async (id) => {
        const query = `
        SELECT 
        p.*, 
        u.*, 
        f.id AS file_id, 
        f.name AS file_name, 
        f.path AS file_path

        FROM products p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN files f ON p.file_id = f.id

        WHERE p.id = $1;
        
        `;

        const res = await pool.query(query, [id])
        if(res.rows.length === 0){
            return null
        }else{
            return res.rows[0]
        }
    }
}

const init = async () => {
    await createProductsTable()
    console.log('Products table created or already exists')
}

init().catch(err => console.error(err))
module.exports = Product