// Get the product ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get("id"));

// Find the product in the array
const product = products.find(item => item.id === productId);

// Populate the product page with the data
if (product) {
    document.getElementById("product-image").src = product.image;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-price").textContent = `Rs ${product.price}`;
    document.getElementById("product-description").textContent = product.description;
} else {
    document.querySelector(".single-product").innerHTML = "<p>Product not found!</p>";
}

// Show pop-up function
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    popupMessage.textContent = message;
    popup.style.display = "block"; // Show the pop-up
}

// Close pop-up logic
document.getElementById("popup-close-btn").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none"; // Hide the pop-up when close button is clicked
});

// Add to Cart Button Logic
document.getElementById("add-to-cart-btn").addEventListener("click", function () {
    const productSize = document.getElementById("product-size").value;
    const productQuantity = parseInt(document.getElementById("product-quantity").value);

    if (productSize === "Select Size" || productQuantity <= 0) {
        showPopup("Please select a valid size and quantity.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProductIndex = cart.findIndex(
        item => item.name === product.name && item.size === productSize
    );

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += productQuantity;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            size: productSize,
            quantity: productQuantity,
            image: product.image
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showPopup("Product added to cart!");
});
