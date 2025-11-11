if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

let totalAmount = "00,00"

function ready() {
    document.querySelectorAll(".remove-product-button").forEach(button => {
        button.addEventListener("click", removeProduct)
    })

    document.querySelectorAll(".product-qtd-input").forEach(input => {
        input.addEventListener("change", checkIfInputIsNull)
    })

    document.querySelectorAll(".button-hover-background").forEach(button => {
        button.addEventListener("click", addProductToCart)
    })

    const purchaseButton = document.querySelector(".purchase-button")
    if (purchaseButton) {
        purchaseButton.addEventListener("click", makePurchase)
    }

    loadStoredData()
}

function removeProduct(event) {
    event.target.closest("tr").remove()
    updateTotal()
}

function checkIfInputIsNull(event) {
    if (event.target.value === "0") {
        event.target.closest("tr").remove()
    }
    updateTotal()
}

function addProductToCart(event) {
    const button = event.target
    const productInfos = button.closest(".product")
    const productImage = productInfos.querySelector(".product-image").src
    const productName = productInfos.querySelector(".product-title").innerText
    const productPrice = productInfos.querySelector(".product-price").innerText
    const productCode = productInfos.getAttribute("data-codigo"); // ← Aqui pega o código do produto

    const existingProducts = document.querySelectorAll(".cart-product-title")
    for (let title of existingProducts) {
        if (title.innerText === productName) {
            const quantityInput = title.closest("tr").querySelector(".product-qtd-input")
            quantityInput.value = parseInt(quantityInput.value) + 1
            updateTotal()
            return
        }
    }

    const newRow = document.createElement("tr")
    newRow.classList.add("cart-product")
    newRow.setAttribute("data-codigo", productCode); // ← Aqui adiciona o código no carrinho
    newRow.innerHTML = `
        <td class="product-identification">
            <img src="${productImage}" alt="${productName}" class="cart-product-image">
            <strong class="cart-product-title">${productName}</strong>
        </td>
        <td><span class="cart-product-price">${productPrice}</span></td>
        <td>
            <input type="number" value="1" min="0" class="product-qtd-input">
            <button type="button" class="remove-product-button">Remover</button>
        </td>
    `
    const tableBody = document.querySelector(".cart-table tbody")
    tableBody.appendChild(newRow)

    newRow.querySelector(".remove-product-button").addEventListener("click", removeProduct)
    newRow.querySelector(".product-qtd-input").addEventListener("change", checkIfInputIsNull)

    updateTotal()
}

function updateTotal() {
    const cartProducts = document.querySelectorAll(".cart-product")
    let total = 0

    cartProducts.forEach(product => {
        const price = parseFloat(product.querySelector(".cart-product-price").innerText.replace("R$", "").replace(",", "."))
        const quantity = parseInt(product.querySelector(".product-qtd-input").value)
        total += price * quantity
    })

    totalAmount = total.toFixed(2).replace(".", ",")
    document.querySelector(".cart-total-container span").innerText = "R$" + totalAmount
}

function makePurchase() {
    const name = document.getElementById("customer-name").value.trim()
    const address = document.getElementById("customer-address").value.trim()
    const phone = document.getElementById("customer-phone").value.trim();

    if (totalAmount === "0,00") {
        alert("Seu carrinho está vazio!")
        return
    }

    if (!name || !address || !phone) {
        alert("Por favor, preencha nome e endereço.")
        return
    }

    const products = []
    const cartRows = document.querySelectorAll(".cart-product")
    cartRows.forEach(row => {
        const productName = row.querySelector(".cart-product-title").innerText
        const quantity = row.querySelector(".product-qtd-input").value
        const price = row.querySelector(".cart-product-price").innerText.replace("R$", "").replace(",", ".")
        const codigo = row.getAttribute("data-codigo"); // ← Aqui você precisa garantir que cada produto tenha o atributo data-codigo no HTML
        products.push({ name: productName, quantity: quantity, preco: parseFloat(price),codigo: codigo })
    })

    fetch("finalizar_compra.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: name,
            endereco: address,
            telefone: phone,
            valor: totalAmount.replace(",", "."),
            produtos: products
        })
    })
    .then(res => res.text())
    .then(msg => {
            // Tenta interpretar como JSON
    let response;
    try {
        response = JSON.parse(msg);
    } catch {
        response = { message: "✅ Compra registrada com sucesso!"}; // Mensagem no popap
    }

    // Exibe a mensagem final para o usuário
    alert(response.message || "✅ Compra registrada com sucesso!");
   
        window.location.href = "loja.html"
    })
    .catch(err => {
        console.error("Erro ao finalizar compra:", err)
        alert("Erro ao finalizar a compra. Tente novamente.")
    })
}

function loadStoredData() {
    const storedName = localStorage.getItem("customerName")
    const storedAmount = localStorage.getItem("totalAmount")

    if (storedName) {
        document.getElementById("customer-name").value = storedName
    }

    if (storedAmount) {
        totalAmount = storedAmount
        document.querySelector(".cart-total-container span").innerText = "R$" + totalAmount
    }
}

