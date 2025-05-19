// Handle register form submission
async function handleRegister(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.text();
        alert(result); // Show the message to the user
    } catch (error) {
        console.error('Error during registration:', error);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.status === 'success') {
            // Redirect to orders page if login is successful
            window.location.href = `orders.html?userId=${result.userId}`;
        } 
    } catch (error) {
        console.error('Error during login:', error);
    }
    } 

