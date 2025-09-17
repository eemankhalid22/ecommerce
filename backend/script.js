const orderDetails = {
    customer_name: 'John Doe', // Replace with user input
    product_name: 'Sample Product',
    quantity: 2,
    price: 19.99
};

fetch('http://localhost:5000/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderDetails)
})
.then(response => response.text())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));


