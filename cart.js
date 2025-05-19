// Fetch the cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to display the cart items
// Function to display the cart items
function displayCart() {
    const cartTable = document.querySelector('#cart-table tbody');
    const subtotalElem = document.getElementById('subtotal');
    const totalElem = document.getElementById('total');
    let subtotal = 0;

    // Clear the table before adding items
    cartTable.innerHTML = '';

    // Check if cart is empty
    if (cart.length === 0) {
        const emptyMessage = document.createElement('tr');
        emptyMessage.innerHTML = ` 
            <td colspan="4" style="text-align: center;">Your cart is empty.</td>
        `;
        cartTable.appendChild(emptyMessage);
        subtotalElem.innerText = 'Rs 0';
        totalElem.innerText = 'Rs 0';
        return;
    }

    // Render each cart item
    cart.forEach(item => {
        const row = document.createElement('tr');
        const subtotalForItem = item.price * item.quantity;
        subtotal += subtotalForItem;

        row.innerHTML = `
            <td>
                <div class="cart-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <span>${item.name}(${item.size})</span>
                </div>
            </td>
            <td>
                <input type="number" value="${item.quantity}" min="1" class="quantity" data-id="${item.id}">
            </td>
            <td>Rs ${subtotalForItem}</td>
            <td><button class="remove" data-id="${item.id}">Remove</button></td>
        `;
        cartTable.appendChild(row);
    });

    // Update subtotal and total
    subtotalElem.innerText = `Rs ${subtotal}`;
    totalElem.innerText = `Rs ${subtotal}`;
}

// Handle quantity change
document.querySelector('#cart-table').addEventListener('input', function(e) {
    if (e.target.classList.contains('quantity')) {
        const id = e.target.getAttribute('data-id');
        const quantity = e.target.value;

        // Update the cart with new quantity
        const cartItem = cart.find(item => item.id == id);
        if (cartItem) {
            cartItem.quantity = parseInt(quantity);
            localStorage.setItem('cart', JSON.stringify(cart));  // Update localStorage
            displayCart(); // Re-render the cart
        }
    }
});

// Handle removing item from the cart
document.querySelector('#cart-table').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('remove')) {
        const id = e.target.getAttribute('data-id');

        // Remove item from the cart
        cart = cart.filter(item => item.id !== id);  // Filter out the removed item
        localStorage.setItem('cart', JSON.stringify(cart));  // Update localStorage
        displayCart(); // Re-render the cart
    }
});


// Initial render of the cart
window.onload = displayCart;

// Handle "Place Order" button click
document.getElementById('placeOrderBtn').addEventListener('click', function() {
    const user = JSON.parse(localStorage.getItem('user'));  // Get user from localStorage
    if (!user) {
        // User is not logged in, redirect to the login page
        alert("Please log in or register to place an order.");
        window.location.href = 'account.html';  // Redirect to the account page
        return;
    }

    // Proceed to place the order for the logged-in user
    const orderDetails = {
        userId: user.id,  // Assuming 'user' object has 'id'
        items: cart,
        totalAmount: document.getElementById('total').innerText.replace('Rs ', '')
    };

    // Send order details to the server
    fetch('http://localhost:5000/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Order placed successfully!');
            // Clear the cart and redirect to the orders page
            localStorage.removeItem('cart');
            window.location.href = `orders.html?userId=${user.id}`;
        } else {
            alert('Error placing order');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

localStorage.clear();