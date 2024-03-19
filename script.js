console.log("Hello script");

let productList = document.getElementById("productList");
let productDetails = document.getElementById("productDetails");
let productCart = document.getElementById("productCart");
let cart = document.getElementById("cart");
let isCartVisible = false;
printProducts();

function fetchProducts() {
    return fetch(`http://localhost:8080/api/product`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return response.json();
        });
}


function printProducts() {
    productList.innerHTML = '';
    productListByCategory.innerHTML = '';
    fetchProducts()
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
                    addToCart(product.productId, product.productName, product.price);
                });

                let infoBtn = document.createElement("button");
                infoBtn.innerText = "Mer info";
                infoBtn.addEventListener("click", function() {
                    displayProductDetails(product.productId);
                });

                let text = document.createElement("span");
                text.innerText = product.productName;
                text.className = "product-name";

                overlay.appendChild(infoBtn);
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

function addToCart(productId, productName, price) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    let existingCartItem = cartItems.find(item => item.productId === productId);
    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        cartItems.push({ productId: productId, productName: productName, quantity: 1, price: price });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    displayCart();
}

function displayCart() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    productCart.innerHTML = '';
    cartItems.forEach(item => {
        let productId = item.productId;
        let quantity = item.quantity;
        let productName = item.productName;

        let cartItem = document.createElement("li");
        cartItem.innerText = `${productName} (${quantity})`;

        let removeFromCartBtn = document.createElement("button");
        removeFromCartBtn.innerText = "[X]";
        removeFromCartBtn.addEventListener("click", function() {

            let updatedCartItems = cartItems.map(item => {
                if (item.productId === productId) {
                    item.quantity--;
                    if (item.quantity <= 0) {
                        return null;
                    }
                }
                return item;
            }).filter(Boolean);


            localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));


            displayCart();
        });

        cartItem.append(removeFromCartBtn);
        productCart.appendChild(cartItem);
    });

    let createCheckoutBtn = document.createElement("button")
    createCheckoutBtn.innerText = "Betalning"
    createCheckoutBtn.addEventListener("click", function() {
        createCheckoutSession();
    })
    productCart.appendChild(createCheckoutBtn);
}

function createCheckoutSession() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    let lineItems = cartItems.map(item => {
        return {
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
        };
    });

    fetch(`http://localhost:8080/api/product/createcheckoutsession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lineItems)
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Failed to create checkout session');
            }
        })
        .then(url => {
            window.location.href = url;
        })
        .catch(error => {
            console.error('Error creating checkout session:', error);
            alert('Failed to create checkout session. Please try again.');
        });
}

function productByCategory(category) {
    productList.innerHTML = '';

    fetch(`http://localhost:8080/api/product/category/${category}`)
        .then(res => res.json())
        .then(data => {
            productList.innerHTML = '';
            displayProducts(data);
        })
        .catch(error => {
            console.error('Misslyckads att hämta produktkategorier', error);
        });


}


function displayProducts(products) {
    let productListByCategory = document.getElementById("productListByCategory");
    productListByCategory.innerHTML = '';

    let dropdown = document.getElementById("dropDownCategory");
    let selectedCategory = dropdown.options[dropdown.selectedIndex].value;
    products.forEach(product => {
        if (product.category === selectedCategory) {
            let container = document.createElement("div");
            container.className = "product-container";

            let img = document.createElement("img");
            img.src = product.imgUrl;
            img.className = "product-image";

            let overlay = document.createElement("div");
            overlay.className = "overlay";

            let addToCartBtn = document.createElement("button");
            addToCartBtn.innerText = "Add to cart";
            addToCartBtn.addEventListener("click", function() {
                addToCart(product.productId);
            });

            let infoBtn = document.createElement("button");
            infoBtn.innerText = "Mer info";
            infoBtn.addEventListener("click", function() {
                displayProductDetails(product.productId);
            });

            let productName = document.createElement("span");
            productName.innerText = product.productName;
            productName.className = "product-name";

            overlay.appendChild(infoBtn);
            overlay.appendChild(addToCartBtn);
            overlay.appendChild(productName);

            container.appendChild(img);
            container.appendChild(overlay);

            productListByCategory.appendChild(container);
        }
    });
}

function handleCategorySelection() {
    let dropdown = document.getElementById("dropDownCategory");
    let selectedCategory = dropdown.options[dropdown.selectedIndex].value;


    if (selectedCategory === "") {
        productList.innerHTML = '';

        printProducts();

    } else {
        productList.innerHTML = '';
        productByCategory(selectedCategory);
    }
}


function displayProductDetails(productId) {
    fetch(`http://localhost:8080/api/product/${productId}`)
        .then(res => res.json())
        .then(product => {

            productList.innerHTML = "";

            let productInfoBox = document.createElement("div");
            productInfoBox.className = "product-info-box";

            let productName = document.createElement("h2");
            productName.textContent = product.productName;

            let productDetailsContainer = document.createElement("div");
            productDetailsContainer.className = "product-details";

            let productImage = document.createElement("img");
            productImage.src = product.imgUrl;
            productImage.alt = product.productName;

            let descriptionPriceContainer = document.createElement("div");
            descriptionPriceContainer.className = "description-price";

            let productDescription = document.createElement("p");
            productDescription.textContent = "beskrivning här: " + product.description;

            let productPrice = document.createElement("p");
            productPrice.textContent = "Price: " + product.price + " kr";

            let buyBtn = document.createElement("button");
            buyBtn.innerText = "Add to cart";
            buyBtn.addEventListener("click", function() {
                addToCart(product.productId);
            });

            let backBtn = document.createElement("button");
            backBtn.innerText = "Tillbaka";
            backBtn.addEventListener("click", function() {
                productList.innerHTML = "";
                printProducts();
            });

            descriptionPriceContainer.appendChild(productDescription);
            descriptionPriceContainer.appendChild(productPrice);
            descriptionPriceContainer.appendChild(buyBtn);
            descriptionPriceContainer.appendChild(backBtn);



            productDetailsContainer.appendChild(productImage);
            productDetailsContainer.appendChild(descriptionPriceContainer);

            productInfoBox.appendChild(productName);
            productInfoBox.appendChild(productDetailsContainer);

            productList.appendChild(productInfoBox);
            productList.scrollIntoView({ behavior: "smooth" });
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
        });
}

cart.addEventListener("click", toggleCart);