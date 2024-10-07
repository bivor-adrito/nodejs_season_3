const { Pool } = require("pg");

// Create a new pool instance

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "market",
  password: "admin",
  port: 5432,
});

const createOrdersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        purchase_date TIMESTAMP,
        expected_delivery_date TIMESTAMP,
        delivery_location VARCHAR(255),
        qty INTEGER,
        total DECIMAL(10, 2),
        delivery_status VARCHAR(20) DEFAULT 'in-progress',
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
  await pool.query(query);
};

const Order = {
  create: async (orderData) => {
    const {
      purchaseDate,
      expectedDeliveryDate,
      deliveryLocation,
      qty,
      total,
      deliveryStatus,
      userId,
      productId,
    } = orderData;
    const query = `
            INSERT INTO orders (purchase_date, expected_delivery_date, delivery_location, qty, total, delivery_status, user_id, product_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
    const values = [
      purchaseDate,
      expectedDeliveryDate,
      deliveryLocation,
      qty,
      total,
      deliveryStatus,
      userId,
      productId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findById: async (id) => {
    const query = `
            SELECT * FROM orders WHERE id = $1;
        `;
    const values = [id];
    const result = await pool.query(query, values);
    return result;
  },

  findByIdPopulated: async (id) => {
    const query = `
            SELECT o.*, 
                u.fname AS user_fname, u.lname AS user_lname, u.email AS user_email, u.userType AS user_userType,
                p.name AS product_name, p.price AS product_price, p.description AS product_description
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            WHERE o.id = $1;
        `;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findAllByUserId: async (userId, current, pageSize, sort) => {
    let orderQuery = `
        SELECT o.*,
            u.fname AS user_fname, u.lname AS user_lname, u.email AS user_email, u.userType AS user_userType,
            p.name AS product_name, p.price AS product_price, p.description AS product_description
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN products p ON o.product_id = p.id
        WHERE o.user_id = $1
    `
    if(sort === 'asc'){
        orderQuery += " ORDER BY o.created_at ASC";
    }else{
        orderQuery += " ORDER BY o.created_at DESC";
    }
    
    orderQuery += " LIMIT $2 OFFSET $3;"

    const values = [userId, pageSize, (current - 1) * pageSize]
    const {rows: orders} = await pool.query(orderQuery, values)
    return orders
  },

  update: async (id, orderData) => {
    const {
      purchaseDate,
      expectedDeliveryDate,
      deliveryLocation,
      qty,
      total,
      deliveryStatus,
      userId,
      productId,
    } = orderData;
    const query = `
            UPDATE orders 
            SET purchase_date=COALESCE($1, purchase_date), 
                expected_delivery_date=COALESCE($2,expected_delivery_date), 
                delivery_location=COALESCE($3,delivery_location), 
                qty=COALESCE($4,qty), 
                total=COALESCE($5,total), 
                delivery_status=COALESCE($6,delivery_status), 
                user_id=COALESCE($7,user_id), 
                product_id=COALESCE($8,product_id) ,
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$9 RETURNING *;
        `;
    const values = [
      purchaseDate,
      expectedDeliveryDate,
      deliveryLocation,
      qty,
      total,
      deliveryStatus,
      userId,
      productId,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM orders WHERE id= $1 RETURNING *;`
    const res = await pool.query(query, [id])
    return res.rows[0]
}
};

const init = async () => {
  await createOrdersTable();
  console.log("Orders table created or already exists");
};

init().catch((err) => console.error(err));
module.exports = Order;
