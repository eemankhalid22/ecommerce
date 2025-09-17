
// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
            showModal('User registered successfully!');
            // Optionally, you can redirect after a short delay:
            setTimeout(() => {
                // Save user info to localStorage for cart.js compatibility
                // Backend does not return userId on register, so fetch it by login or add to backend if needed
                window.location.href = 'account.html';
            }, 1500);
        } else if (response.status === 409 || (result.message && result.message.toLowerCase().includes('already'))) {
            showModal('Already registered!');
        } else {
            showModal(result.message || 'Error registering user.');
        }
    } catch (error) {
        showModal('Error during registration.');
        console.error('Error during registration:', error);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });
        if (!response.ok) {
            const err = await response.json();
            showModal(err.message || 'Login failed.');
            return;
        }
        const result = await response.json();
        if (result.status === 'success') {
            // Save user info to localStorage for cart.js compatibility
            localStorage.setItem('user', JSON.stringify({ id: result.userId, name: name }));
            // Check for cart items and place order if present
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length > 0) {
                // Map cart items to required structure
                const mappedItems = cart.map(item => ({
                    name: item.name || item.title || '',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1
                }));
                const orderDetails = {
                    userId: result.userId,
                    items: mappedItems,
                    totalAmount: mappedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };
                // Place the order
                fetch('http://localhost:5000/place-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderDetails)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        localStorage.removeItem('cart');
                    }
                    window.location.href = `myorders.html?userId=${result.userId}`;
                })
                .catch(() => {
                    window.location.href = `myorders.html?userId=${result.userId}`;
                });
            } else {
                window.location.href = `myorders.html?userId=${result.userId}`;
            }
        } else {
            showModal(result.message || 'Login failed.');
        }
    } catch (error) {
        showModal('Error during login.');
        console.error('Error during login:', error);
    }
}

// Modal logic for feedback
function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMsg = document.getElementById('modal-message');
    if (!modal || !modalMsg) {
        alert(message);
        return;
    }
    modalMsg.textContent = message;
    modal.style.display = 'flex';
}

