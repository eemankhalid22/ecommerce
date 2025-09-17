const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',     // MySQL server address (use 'localhost' for local servers)
  user: 'root',          // Your MySQL username
  password: 'root',      // Your MySQL password (empty if none)
  database: 'ecommerce'  // The database you created earlier
});

// Connect to the database
db.connect(function(err) {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL!');
});

module.exports = db;  // Export the connection so other files can use it
