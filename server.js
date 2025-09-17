const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Serve static files (HTML, CSS, JS, images) from project root
app.use(express.static(__dirname));

// ----------------------
// MySQL connection setup
// ----------------------
let db;

function createDbConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'ecommerce', // updated var
        database: process.env.DB_NAME || 'ecommerce'
    });
}

function connectWithRetry(retryCount = 0) {
    db = createDbConnection();
    db.connect((err) => {
        if (err) {
            const delayMs = Math.min(10000, 1000 * Math.pow(2, Math.min(retryCount, 3)));
            console.error('Error connecting to MySQL:', err.message, `— retrying in ${delayMs}ms`);
            setTimeout(() => connectWithRetry(retryCount + 1), delayMs);
            return;
        }
        console.log('✅ Connected to MySQL database');
    });

    db.on('error', (err) => {
        console.error('MySQL connection error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
            connectWithRetry();
        }
    });
}

// Small initial delay so MySQL can start up
setTimeout(() => connectWithRetry(), 3000);

// ----------------------
// Routes
// ----------------------

// Get orders for a user
app.get('/orders', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    db.query('SELECT * FROM orders WHERE user_id = ?', [userId], (err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Error fetching orders' });
        }
        if (orders.length === 0) {
            return res.json({ orders: [] });
        }

        const orderIds = orders.map(order => order.id);
        db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, items) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return res.status(500).json({ error: 'Error fetching order items' });
            }

            const ordersWithItems = orders.map(order => ({
                id: order.id,
                total_amount: order.total,
                order_date: order.date,
                items: items.filter(item => item.order_id === order.id)
            }));

            res.json({ orders: ordersWithItems });
        });
    });
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ status: 'error', message: 'User already exists. Please use a different username or email.' });
                }
                return res.status(500).json({ status: 'error', message: 'Error registering user' });
            }
            res.json({ status: 'success', message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ status: 'error', message: 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).send('All fields are required');
    }

    const query = 'SELECT * FROM users WHERE name = ?';
    db.query(query, [name], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging in');
        }
        if (results.length === 0) {
            return res.status(401).send({ status: 'error', message: 'Invalid name or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ status: 'error', message: 'Invalid name or password' });
        }

        req.session.user = { id: user.id, name: user.name };

        res.json({
            status: 'success',
            message: 'Login successful',
            userId: user.id
        });
    });
});

// Place order endpoint
app.post('/place-order', (req, res) => {
    const { items, totalAmount, userId: bodyUserId } = req.body;
    let userId = req.session.user ? req.session.user.id : null;

    if (!userId && bodyUserId) {
        userId = bodyUserId;
    }
    if (!userId || typeof userId !== 'number' || isNaN(userId)) {
        return res.status(401).json({ status: 'error', message: 'Please log in first. No valid userId found.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Missing order details or empty items array' });
    }
    if (!totalAmount || isNaN(Number(totalAmount))) {
        return res.status(400).json({ status: 'error', message: 'Invalid total amount' });
    }

    for (const item of items) {
        if (!item.name || typeof item.price === 'undefined' || typeof item.quantity === 'undefined') {
            return res.status(400).json({ status: 'error', message: 'Each item must have name, price, and quantity.' });
        }
    }

    const query = 'INSERT INTO orders (user_id, total) VALUES (?, ?)';
    db.query(query, [userId, totalAmount], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).send({ status: 'error', message: 'Error placing order' });
        }

        const orderId = result.insertId;
        const orderItemsQuery = 'INSERT INTO order_items (order_id, product_name, price, quantity) VALUES ?';
        const orderItems = items.map(item => [orderId, item.name, item.price, item.quantity]);

        db.query(orderItemsQuery, [orderItems], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).send({ status: 'error', message: 'Error saving order items' });
            }
            res.send({ status: 'success', message: 'Order placed successfully' });
        });
    });
});

// ----------------------
// Global error handlers
// ----------------------
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

// ----------------------
// Start server
// ----------------------
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
});
