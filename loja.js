if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

var totalAmount = "0,00"

function ready() {
    const removeCartProductButtons = document.getElementsByClassName("remove-product-button")
    for (var i = 0; i < removeCartProductButtons.length; i++) {
        removeCartProductButtons[i].addEventListener("click", removeProduct)
    }

    const quantityInputs = document.getElementsByClassName("product-qtd-input")
    for (var i = 0; i < quantityInputs.length; i++) {
        quantityInputs[i].addEventListener("change", checkIfInputIsNull)
    }

    const addToCartButtons = document.getElementsByClassName("button-hover-background")
    for (var i = 0; i < addToCartButtons.length; i++) {
        addToCartButtons[i].addEventListener("click", addProductToCart)
    }

    const purchaseButton = document.getElementsByClassName("purchase-button")[0]
    purchaseButton.addEventListener("click", makePurchase)

    loadStoredData()
}

function removeProduct(event) {
    event.target.parentElement.parentElement.remove()
    updateTotal()
}

function checkIfInputIsNull(event) {
    if (event.target.value === "0") {
        event.target.parentElement.parentElement.remove()
    }
    updateTotal()
}

function addProductToCart(event) {
    const button = event.target
    const productInfos = button.parentElement.parentElement
    const productImage = productInfos.getElementsByClassName("product-image")[0].src
    const productName = productInfos.getElementsByClassName("product-title")[0].innerText
    const productPrice = productInfos.getElementsByClassName("product-price")[0].innerText

    const productsCartNames = document.getElementsByClassName("cart-product-title")
    for (var i = 0; i < productsCartNames.length; i++) {
        if (productsCartNames[i].innerText === productName) {
            productsCartNames[i].parentElement.parentElement.getElementsByClassName("product-qtd-input")[0].value++
            updateTotal()
            return
        }
    }

    let newCartProduct = document.createElement("tr")
    newCartProduct.classList.add("cart-product")

    newCartProduct.innerHTML =
      `
        <td class="product-identification">
          <img src="${productImage}" alt="${productName}" class="cart-product-image">
          <strong class="cart-product-title">${productName}</strong>
        </td>
        <td>
          <span class="cart-product-price">${productPrice}</span>
        </td>
        <td>
          <input type="number" value="1" min="0" class="product-qtd-input">
          <button type="button" class="remove-product-button">Remover</button>
        </td>
      `
    
    const tableBody = document.querySelector(".cart-table tbody")
    tableBody.append(newCartProduct)
    updateTotal()

    newCartProduct.getElementsByClassName("remove-product-button")[0].addEventListener("click", removeProduct)
    newCartProduct.getElementsByClassName("product-qtd-input")[0].addEventListener("change", checkIfInputIsNull)
}

function makePurchase() {
    const customerName = document.getElementById("customer-name").value.trim();
    const customerAddress = document.getElementById("customer-address").value.trim();

    if (totalAmount === "0,00") {
        alert("Seu carrinho está vazio!");
        return;
    }

    if (customerName === "" || customerAddress === "") {
        alert("Por favor, insira seu nome e endereço.");
        return;
    }

    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

    // Capturar produtos do carrinho
    const cartProducts = document.getElementsByClassName("cart-product");
    let products = [];
    for (let i = 0; i < cartProducts.length; i++) {
        const productName = cartProducts[i].getElementsByClassName("cart-product-title")[0].innerText;
        const productQuantity = cartProducts[i].getElementsByClassName("product-qtd-input")[0].value;
        products.push({ name: productName, quantity: productQuantity });
    }

    // Adicionar nova compra com produtos ao array
    purchases.push({ name: customerName, address: customerAddress, amount: totalAmount, products: products });

    // Armazenar no localStorage
    localStorage.setItem("purchases", JSON.stringify(purchases));

    alert(`
        Obrigado pela sua compra, ${customerName}!
        Endereço de entrega: ${customerAddress}
        Valor do pedido: R$${totalAmount}
        Volte sempre :)
    `);

    document.querySelector(".cart-table tbody").innerHTML = "";
    document.getElementById("customer-name").value = "";
    document.getElementById("customer-address").value = "";
    updateTotal();
    window.location.href = "loja.html";
}

function updateTotal() {
    const cartProducts = document.getElementsByClassName("cart-product")
    let total = 0

    for (let i = 0; i < cartProducts.length; i++) {
        const productPrice = cartProducts[i].getElementsByClassName("cart-product-price")[0].innerText.replace("R$", "").replace(",", ".")
        const productQuantity = cartProducts[i].getElementsByClassName("product-qtd-input")[0].value

        total += productPrice * productQuantity
    }
    
    totalAmount = total.toFixed(2).replace(".", ",")
    document.querySelector(".cart-total-container span").innerText = "R$" + totalAmount
}

function loadStoredData() {
    const storedName = localStorage.getItem("customerName");
    const storedAmount = localStorage.getItem("totalAmount");

    if (storedName) {
        document.getElementById("customer-name").value = storedName;
    }

    if (storedAmount) {
        addToPurchaseSummary(storedName);
    }
}
