console.log("Hello script");

let productList = document.getElementById("productList");
let productDetails = document.getElementById("productDetails");
let productCart = document.getElementById("productCart");
let cart = document.getElementById("cart");
let isCartVisible = false;
printProducts();


function printProducts() {
    fetch(`http://localhost:8080/api/product/`)
        .then(res => res.json())
        .then(data => {
            data.forEach(product => {
                let container = document.createElement("div");
                container.className = "product-container";

                let img = document.createElement("img");
                img.src = product.imgUrl;
                img.className = "product-image";

                let overlay = document.createElement("div");
                overlay.className = "overlay";

                let button = document.createElement("button");
                button.innerText = "Add to cart";
                button.addEventListener("click", function() {
                    addToCart(product.productId);
                });

                let text = document.createElement("span");
                text.innerText = product.productName;
                text.className = "product-name";

                overlay.appendChild(button);
                overlay.appendChild(text);

                container.appendChild(img);
                container.appendChild(overlay);

                productList.appendChild(container);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function addToCart(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    fetch(`http://localhost:8080/api/product/addtocart/${productId}`, {

            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                alert('Produkten har lagts till i kundvagnen!');
                let existingCartItem = cartItems.find(item => item.productId === productId);
                if (existingCartItem) {
                    existingCartItem.quantity++;
                    localStorage.setItem('cartItems', JSON.stringify(cartItems));
                    displayCart();
                } else {
                    cartItems.push({ productId: productId, quantity: 1 });
                    localStorage.setItem('cartItems', JSON.stringify(cartItems));
                    displayCart();
                }
            }
        })
        .catch(error => {
            console.error('Misslyckades att lägga till i kundvagn', error);
        });

}

function displayCart() {
    fetch(`http://localhost:8080/api/product/cart`)

    .then(res => res.json())
        .then(cartItems => {
            productCart.innerHTML = '';
            cartItems.forEach(item => {
                let productId = item.productId;
                let quantity = item.quantity;
                fetch(`http://localhost:8080/api/product/${productId}`)
                    .then(res => res.json())
                    .then(product => {
                        let cartItem = document.createElement("li");
                        cartItem.innerText = `${product.productName} (${quantity})`;
                        let removeFromCartBtn = document.createElement("button");
                        removeFromCartBtn.innerText = "[X]";
                        removeFromCartBtn.addEventListener("click", function() {
                            fetch(`http://localhost:8080/api/product/decrease/${productId}`, {
                                    method: 'PUT'
                                })
                                .then(response => {
                                    if (response.ok) {
                                        let existingCartItem = cartItems.find(item => item.productId === productId);
                                        if (existingCartItem) {
                                            existingCartItem.quantity--;
                                            if (existingCartItem.quantity === 0) {

                                                cartItems = cartItems.filter(item => item.productId !== productId);
                                            }
                                            localStorage.setItem('cartItems', JSON.stringify(cartItems));
                                            productCart.innerHTML = '';
                                            displayCart();
                                        } else {
                                            throw new Error('Produkten kunde ej hittas i kundvagnen');
                                        }
                                    } else {
                                        throw new Error('Misslyckades att ta bort från kundvagnen');
                                    }
                                })
                                .catch(error => {
                                    console.error('Misslyckades(error) att ta bort från kundvagnen', error);
                                });
                        });
                        cartItem.append(removeFromCartBtn);
                        productCart.appendChild(cartItem);

                    })
            });
            let createCheckoutBtn = document.createElement("button")
            createCheckoutBtn.innerText = "Betalning"
            createCheckoutBtn.addEventListener("click", function() {
                createCheckoutSession()
                    .then(url => {
                        window.location.href = url
                    })
                    .catch(error => {
                        console.error('Kunde ej skapa betalning', error)
                        alert('Fel när betalning skapades')
                    })
            })
            productCart.appendChild(createCheckoutBtn);

        })
        .catch(error => {
            console.error('Misslyckades att hämta kundvagn', error);
        });
}

function createCheckoutSession() {
    return fetch(`http://localhost:8080/api/product/createcheckoutsession`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Misslyckades att skapa betalning');
            }
        });
}


function productByCategory(category) {
    fetch(`http://localhost:8080/api/product/category/${category}`)
        .then(res => res.json())
        .then(data => {
            displayProducts(data);
        })
        .catch(error => {
            console.error('Misslyckads att hämta produktkategorier', error);
        });
}

function displayProducts(products) {
    let productListByCategory = document.getElementById("productListByCategory");
    productListByCategory.innerHTML = '';

    products.forEach(product => {
        let li = document.createElement("li");
        li.innerText = product.productName;
        productListByCategory.appendChild(li);
    });
}

function handleCategorySelection() {
    let dropdown = document.getElementById("dropDownCategory");
    let selectedCategory = dropdown.options[dropdown.selectedIndex].value;
    productByCategory(selectedCategory);
}

handleCategorySelection();

function toggleCart() {
    isCartVisible = !isCartVisible;

    if (isCartVisible) {
        displayCart();
    } else {
        productCart.innerHTML = '';
    }
}

cart.addEventListener("click", toggleCart);