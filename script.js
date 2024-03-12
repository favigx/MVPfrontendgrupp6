console.log("Hello script");

let productList = document.getElementById("productList");
let productDetails = document.getElementById("productDetails");
let productCart = document.getElementById("productCart")
let cart = document.getElementById("cart");

printProducts();

function printProducts() {
    fetch(`http://localhost:8080/api/product/`)
    .then(res => res.json())
    .then(data => {
        data.forEach(product => {
            let li = document.createElement("li");
            li.innerText = product.productName;
            let button = document.createElement("button")
            button.innerText = "add to cart"
            button.addEventListener("click", function () {
                addToCart(product.productId);
            })
            productList.appendChild(li);
            productList.appendChild(button);
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });
}

function addToCart(productId) {
    fetch(`http://localhost:8080/api/product/addtocart/${productId}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            alert('Product added to cart successfully!');
            let cartItems = new Set(JSON.parse(localStorage.getItem('cartItems')) || []);
            cartItems.add(productId);
            localStorage.setItem('cartItems', JSON.stringify(Array.from(cartItems)));
            displayCart(); 
        } else {
            throw new Error('Failed to add product to cart');
        }
    })
    .catch(error => {
        console.error('Error adding product to cart:', error);
    });
}

function displayCart() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems.length === 0) {
        productCart.innerHTML = '<p>Your cart is currently empty</p>';
    } else {
        productCart.innerHTML = '';
        cartItems.forEach(productId => {
            fetch(`git http://localhost:8080/api/product/${productId}`)
            .then(res => res.json())
            .then(product => {
                
                let cartItem = document.createElement("li");
                cartItem.innerText = product.productName + " ";
                
                let removeFromCartBtn = document.createElement("button");
                removeFromCartBtn.innerText = "Delete";
                removeFromCartBtn.addEventListener("click", function () {
                    fetch(`http://localhost:8080/api/product/remove/${productId}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            let cartItems = new Set(JSON.parse(localStorage.getItem('cartItems')) || []);
                            cartItems.delete(productId);
                            localStorage.setItem('cartItems', JSON.stringify(Array.from(cartItems)));
                            displayCart();
                        } else {
                            throw new Error('Failed to remove product from cart');
                        }
                    })
                    .catch(error => {
                        console.error('Error removing product from cart:', error);
                    });
                });
                
                cartItem.append(removeFromCartBtn);
                productCart.appendChild(cartItem);
            })
            .catch(error => {
                console.error('Error fetching product:', error);
            });
        });
    }
}

function productByCategory(category) {
    fetch(`http://localhost:8080/api/product/category/${category}`)
        .then(res => res.json())
        .then(data => {
            displayProducts(data);
        })
        .catch(error => {
            console.error('Error fetching products by category:', error);
        });
}

function displayProducts(products) {
    let productListt = document.getElementById("productListByCategory");
    productListt.innerHTML = '';

    products.forEach(product => {
        let li = document.createElement("li");
        li.innerText = product.productName;
        productListt.appendChild(li);
    });
}

function handleCategorySelection() {
    let dropdown = document.getElementById("dropDownCategory");
    let selectedCategory = dropdown.options[dropdown.selectedIndex].value;
    productByCategory(selectedCategory);
}

handleCategorySelection();

cart.addEventListener("click", displayCart);
