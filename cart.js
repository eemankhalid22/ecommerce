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


// Custom popup for login/register first
function showLoginPopup() {
    // Create overlay
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    // Create popup
    let popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '32px 40px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
    popup.style.textAlign = 'center';
    popup.innerHTML = `<div style="font-size:1.3em;margin-bottom:18px;">Login/Register first</div><button id="popupLoginBtn" style="padding:8px 24px;background:burlywood;color:#fff;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Go to Account</button>`;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.getElementById('popupLoginBtn').onclick = function() {
        window.location.href = 'account.html';
    };
}

document.getElementById('placeOrderBtn').addEventListener('click', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    showLoginPopup();
});

