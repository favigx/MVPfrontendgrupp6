function displayItems() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let cartItemList = document.getElementById("cartItemList");

    cartItemList.innerHTML = '';

    cartItems.forEach(item => {
        let cartItem = document.createElement("li");
        let itemImg = document.createElement("img");
        itemImg.src = `${item.imgUrl}`;
        
        cartItem.innerText = `${item.productName} (${item.quantity}) ${item.price} kr`;
        cartItem.appendChild(itemImg);
        cartItemList.appendChild(cartItem);
    });
}


displayItems();


localStorage.clear();