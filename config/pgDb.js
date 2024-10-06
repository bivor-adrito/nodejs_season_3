const {Pool} = require('pg')

const connectionString = 'postgres://admin:admin@localhost:5432/market'

const pool = new Pool({
    connectionString: connectionString
})

const connectPgDb = async() => {
    try {
        await pool.connect()
        console.log('Postgresql Connected')
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}

module.exports = connectPgDb