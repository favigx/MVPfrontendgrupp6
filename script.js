console.log("Hello script");

let productList = document.getElementById("productList");

printProducts();

function printProducts(){
    fetch("http://localhost:8080/api/product/")
    .then(res => res.json())
    .then(data =>{
        data.forEach(product =>{
            let li = document.createElement("li");
            li.innerText = product.productName;
            
            productList.appendChild(li);
        })
    })
}

