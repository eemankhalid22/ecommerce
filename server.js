const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session'); // To manage sessions

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all origins (or specify a particular origin)
app.use(cors());  // This will allow all origins to access your API

// Session middleware setup
app.use(session({
    secret: 'your_secret_key',  // Use a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if you're using https
}));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ecommerce'
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Register endpoint with password hashing
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error registering user');
            }
            res.send('User registered successfully');
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint with password comparison and session handling
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('All fields are required');
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging in');
        }

        if (results.length === 0) {
            return res.status(401).send({ status: 'error', message: 'Invalid username or password' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ status: 'error', message: 'Invalid username or password' });
        }

        // Store user data in session after successful login
        req.session.user = { id: user.id, username: user.username };

        res.json({
            status: 'success',
            message: 'Login successful',
            userId: user.id  // Send the userId to the frontend for further use
        });
    


        app.post('/place-order', (req, res) => {
            const { items, totalAmount } = req.body;
          
            // Log the incoming request data for debugging
            console.log('Items:', items);
            console.log('Total Amount:', totalAmount);
          
            // Get userId from session (ensure user is logged in)
            const userId = req.session.user ? req.session.user.id : null;
          
            if (!userId) {
                return res.status(401).send({ status: 'error', message: 'Please log in first' });
            }
          
            if (!items || items.length === 0 || !totalAmount) {
                return res.status(400).send({ status: 'error', message: 'Missing order details or empty items array' });
            }
          
            // Insert the order into the database
            const query = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';
            db.query(query, [userId, totalAmount], (err, result) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    return res.status(500).send({ status: 'error', message: 'Error placing order' });
                }
          
                const orderId = result.insertId;  // Get the inserted order ID
          
                // Insert the items for the order
                const orderItemsQuery = 'INSERT INTO order_items (order_id, product_name, price, quantity) VALUES ?';
                const orderItems = items.map(item => [
                    orderId,
                    item.name,
                    item.price,
                    item.quantity
                ]);
          
                console.log('Order Items:', orderItems);  // Log the items being inserted
          
                db.query(orderItemsQuery, [orderItems], (err, result) => {
                    if (err) {
                        console.error('Error inserting order items:', err);
                        return res.status(500).send({ status: 'error', message: 'Error saving order items' });
                    }
          
                    res.send({ status: 'success', message: 'Order placed successfully' });
                });
            });
          });
          
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
});
});
