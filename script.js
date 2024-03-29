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
                    addToCart(product.productId, product.productName, product.price, product.imgUrl);
                });

                let infoBtn = document.createElement("button");
                infoBtn.innerText = "See details";
                infoBtn.addEventListener("click", function() {
                    displayProductDetails(product.productId);
                });

                let text = document.createElement("span");
                text.innerText = product.productName;
                text.className = "product-name";
                text.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";

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


function addToCart(productId, productName, price, imgUrl) { 

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    let existingCartItem = cartItems.find(item => item.productId === productId);
    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {

        cartItems.push({ productId: productId, productName: productName, quantity: 1, price: price, imgUrl: imgUrl}); 

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
        cartItem.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
        cartItem.style.fontWeight = "900";
        cartItem.style.color = "rgb(109, 141, 156)"


        let removeFromCartBtn = document.createElement("button");
        removeFromCartBtn.innerText = "X";
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

    if (cartItems.length > 0) {
        let createCheckoutBtn = document.createElement("button")
        createCheckoutBtn.innerText = "Checkout"
        createCheckoutBtn.addEventListener("click", function() {
            createCheckoutSession();     
        })
        productCart.appendChild(createCheckoutBtn);
        }
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
        window.open(url);
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
                addToCart(product.productId, product.productName, product.price, product.imgUrl);
            });

            let infoBtn = document.createElement("button");
            infoBtn.innerText = "See details";
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
    productListByCategory.innerHTML = '';
    fetch(`http://localhost:8080/api/product/${productId}`)
        .then(res => res.json())
        .then(product => {

            productList.innerHTML = "";

            let upperhalf = document.getElementById("upper-half");
            upperhalf.innerHTML = "";

            document.body.style.fontFamily = "Roboto, sans-serif";

            let imageTextContainer = document.createElement("div");
            imageTextContainer.style.position = "relative";

            let productInfoBox = document.createElement("div");
            productInfoBox.className = "product-info-box";

            let productName = document.createElement("h2");
            productName.textContent = product.productName;

            let productDetailsContainer = document.createElement("div");
            productDetailsContainer.className = "product-details";

            let productImage = document.createElement("img");
            productImage.src = product.imgUrl;
            productImage.alt = product.productName;
            productName.style.position = "absolute"; 
            
            productName.style.bottom = "1150px"; 
            productName.style.left = "110px"; 
            productName.style.color = "Red";
            productName.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
            
            productImage.style.width = "100%";
            productImage.style.height = "100%"; 

           

            let productDescription = document.createElement("p");
            productDescription.textContent = product.description;
            productDescription.style.position = "absolute"; 
            
        
            productDescription.style.top = "200px"; 
            productDescription.style.left = "70px"; 
            productDescription.style.color = "white";
            productDescription.style.maxWidth = "600px";
            productDescription.style.fontSize = "40px"
            productDescription.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";

            let productPrice = document.createElement("p");
            productPrice.textContent = "Price: " + product.price + " kr";
            productPrice.style.position = "absolute"; 
            
        
            productPrice.style.top = "750px"; 
            productPrice.style.left = "110px"; 
            productPrice.style.color = "white";
            productPrice.style.fontSize = "20px"
            productPrice.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";

            imageTextContainer.appendChild(productImage);
            imageTextContainer.appendChild(productName);
            imageTextContainer.appendChild(productDescription);
            imageTextContainer.appendChild(productPrice);


            

            let descriptionPriceContainer = document.createElement("div");
            descriptionPriceContainer.className = "description-price";

            

            let buyBtn = document.createElement("button");
            buyBtn.style.position = "absolute"; 
            buyBtn.style.top = "710px"; 
            buyBtn.style.left = "70px";
            buyBtn.style.padding = "15px 34px";
            buyBtn.style.textDecoration = "none";
            buyBtn.style.display = "inline-block";
            buyBtn.style.margin = "4px 2px";
            buyBtn.style.cursor = "pointer";
            buyBtn.style.borderRadius = "15px";
            buyBtn.style.width = "70px"; 
            buyBtn.style.height = "70px"; 
            buyBtn.style.backgroundImage = "url('cart1.jpg')";
            buyBtn.style.backgroundSize = "cover"; 
            buyBtn.style.backgroundRepeat = "no-repeat"; 

             
                buyBtn.addEventListener("click", function() {
                    addToCart(product.productId, product.productName, product.price, product.imgUrl);
                
                });


            let backBtn = document.createElement("button");
            backBtn.innerText = "Back";
            backBtn.addEventListener("click", function() {
                upperhalf.innerHTML = '<img src="background2.jpg">';
                productList.innerHTML = "";
                printProducts();
            });

            imageTextContainer.appendChild(buyBtn);
    
            descriptionPriceContainer.appendChild(productPrice);
      
            descriptionPriceContainer.appendChild(backBtn);



            productDetailsContainer.appendChild(productImage);
            productDetailsContainer.appendChild(descriptionPriceContainer);

            productInfoBox.appendChild(productName);
            productInfoBox.appendChild(productDetailsContainer);
            productList.appendChild(imageTextContainer);

            productList.appendChild(productInfoBox);
            productList.scrollIntoView({ behavior: "smooth" });
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
        });
}

function toggleCart() {
    isCartVisible = !isCartVisible;

    if (isCartVisible) {
        displayCart();
    } else {
        productCart.innerHTML = '';
    }
}

cart.addEventListener("click", toggleCart);