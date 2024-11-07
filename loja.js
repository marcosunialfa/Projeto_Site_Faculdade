if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
  } else {
    ready()
  }
  
  var totalAmount = "0,00"
  
  function ready() {
    // Botão remover produto
    const removeCartProductButtons = document.getElementsByClassName("remove-product-button")
    for (var i = 0; i < removeCartProductButtons.length; i++) {
      removeCartProductButtons[i].addEventListener("click", removeProduct)
    }
  
    // Mudança valor dos inputs
    const quantityInputs = document.getElementsByClassName("product-qtd-input")
    for (var i = 0; i < quantityInputs.length; i++) {
      quantityInputs[i].addEventListener("change", checkIfInputIsNull)
    }
  
    // Botão add produto ao carrinho
    const addToCartButtons = document.getElementsByClassName("button-hover-background")
    for (var i = 0; i < addToCartButtons.length; i++) {
      addToCartButtons[i].addEventListener("click", addProductToCart)
    }
  
    // Botão comprar
    const purchaseButton = document.getElementsByClassName("purchase-button")[0]
    purchaseButton.addEventListener("click", makePurchase)

    // Carregar dados armazenados
    loadStoredData();

    // Carregar dados armazenados
    loadStoredData();
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
  //Mesagem final 
  //Mesagem final 
  function makePurchase() {
    const customerName = document.getElementById("customer-name").value.trim();
    const customerAddress = document.getElementById("customer-address").value.trim(); // Captura o valor do endereço

    if (totalAmount === "0,00") {
        alert("Seu carrinho está vazio!");
        return;
    }

    if (customerName === "" || customerAddress === "") { // Verifica se o nome e o endereço estão preenchidos
        alert("Por favor, insira seu nome e endereço.");
        return;
    }

    // Obter compras armazenadas do localStorage
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

    // Adicionar nova compra ao array
    purchases.push({ name: customerName, address: customerAddress, amount: totalAmount });

    // Armazenar o array atualizado no localStorage
    localStorage.setItem("purchases", JSON.stringify(purchases));

    // Mensagem de agradecimento
    alert(`
        Obrigado pela sua compra, ${customerName}!
        Endereço de entrega: ${customerAddress}
        Valor do pedido: R$${totalAmount}
        Volte sempre :)
    `);

    // Limpar o carrinho após a compra
    document.querySelector(".cart-table tbody").innerHTML = ""; // Limpa todos os itens no carrinho
    document.getElementById("customer-name").value = ""; // Limpar o campo de nome
    document.getElementById("customer-address").value = ""; // Limpar o campo de endereço
    updateTotal(); // Atualiza o total (fica "0,00")

    // Redirecionar para a página de resumo (ou qualquer outra que você preferir)
    window.location.href = "loja.html"; // Atualize o caminho se necessário
}

    // Se um endereço foi armazenado, exibi-lo no campo de entrada
    if (storedAddress) {
        document.getElementById("customer-address").value = storedAddress;
    }


    
    // Adicionar produtos à tabela de resumo
    addToPurchaseSummary(customerName);

    // Limpar o carrinho
    document.querySelector(".cart-table tbody").innerHTML = "";
    document.getElementById("customer-name").value = ""; // Limpar o campo de nome
    updateTotal();


  // Atualizar o valor total do carrinho
  function updateTotal() {
    const cartProducts = document.getElementsByClassName("cart-product")
    totalAmount = 0
  
    for (var i = 0; i < cartProducts.length; i++) {
      const productPrice = cartProducts[i].getElementsByClassName("cart-product-price")[0].innerText.replace("R$", "").replace(",", ".")
      const productQuantity = cartProducts[i].getElementsByClassName("product-qtd-input")[0].value
  
      totalAmount += productPrice * productQuantity
    }
    
    totalAmount = totalAmount.toFixed(2)
    totalAmount = totalAmount.replace(".", ",")
    document.querySelector(".cart-total-container span").innerText = "R$" + totalAmount
  }
  function loadStoredData() {
    const storedName = localStorage.getItem("customerName");
    const storedAmount = localStorage.getItem("totalAmount");

    // Se um nome foi armazenado, exibi-lo no campo de entrada
    if (storedName) {
        document.getElementById("customer-name").value = storedName;
    }

    // Se um valor foi armazenado, você pode usar a mesma lógica para o total
    if (storedAmount) {
        addToPurchaseSummary(storedName);
    }
}