const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config({ path: "./src/.env" })

const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   port: process.env.DB_PORT, // ⬅️ INI YANG PENTING
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
})

pool.getConnection()
   .then(connection => {
      console.log(`Berhasil terhubung Ke database`);
      connection.release()
   })
   .catch(err => {
      console.log(err)
   })

module.exports = pool;
