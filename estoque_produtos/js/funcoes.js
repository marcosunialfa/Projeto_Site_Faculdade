//-----------------------------------------------------------------------------------------------------------
// Função: validarProduto(idNomeProduto, idCodProduto, idQtidadeProduto)
// Verifica se foram informados o nome e o código do produto
// Parâmetros:
// - idNomeProduto: id do campo que contém o nome do produto
// - idCodProduto: id do campo que contém o código do produto
// - idQtidadeProduto: id do campo que contém a quantidade do produto
// OBS: Se faltar alguma informação (nome ou código do produto) aparecerá uma mensagem de erro. Em caso de 
// sucesso (todas as informações preenchidas), chama a função cadastrarProduto(...)
// Retorno: nenhum
//-----------------------------------------------------------------------------------------------------------
function validarProduto(idNomeProduto, idCodProduto, idQtidadeProduto) {
    let nome = document.getElementById(idNomeProduto).value;
    let codigo = document.getElementById(idCodProduto).value;
    let qtidade = document.getElementById(idQtidadeProduto).value;

    if (nome == "")
        alert("Nome do produto não pode estar em branco. Favor preenchê-lo!");
    else if (codigo == "")
        alert("Código do produto não pode estar em branco. Favor preenchê-lo!");
    else cadastrarProduto(nome, codigo, parseInt(qtidade));
}
//-----------------------------------------------------------------------------------------------------------
// Função: cadastrarProduto(produto, codig, qtidade)
// Cadastra um novo produto (nome, código e quantidade) no estoque
// Parâmetros:
// - produto: nome do produto a ser cadastrado no estoque (Ex: arroz)
// - codig: código do produto a ser cadastrado no estoque (Ex: a01)
// - qtidade: quantidade do produto a ser cadastrado no estoque (Ex: 7)
// OBS: Apos cadastrar o novo produto no estoque, atualiza a quantidade de itens no carrinho, ou seja, chama 
// a função atualizarTotalEstoque()
// Retorno: nenhum
//-----------------------------------------------------------------------------------------------------------
function cadastrarProduto(produto, codig, qtidade) {
    let novoProduto = {nome: produto, codigo: codig, quantidade: qtidade};

    if (typeof(Storage) !== "undefined") {
        let produtos = localStorage.getItem("produtos");
        if (produtos == null) produtos = []; // Nenhum produto ainda foi cadastrado
        else produtos = JSON.parse(produtos);

        // Verifica se o produto com o mesmo código já existe
        let produtoExistente = produtos.find(p => p.codigo === codig);

        if (produtoExistente) {
            // Incrementa a quantidade ao produto existente
            produtoExistente.quantidade += qtidade;
            alert(`Foram adicionadas ${qtidade} unidades ao produto existente: ${produto}!`);
        } else {
            // Adiciona um novo produto
            produtos.push(novoProduto);
            alert(`Foram cadastradas com sucesso ${qtidade} unidades do produto ${produto}!`);
        }

        // Salva o array atualizado no localStorage
        localStorage.setItem("produtos", JSON.stringify(produtos));
        atualizarTotalEstoque("totalEstoque");
        location.reload();
    } else {
        alert("A versão do seu navegador é muito antiga. Por isso, não será possível executar essa aplicação");
    }
}

//-----------------------------------------------------------------------------------------------------------
// Função: atualizarTotalEstoque(idCampo)
// Incrementa a quantidade de itens cadastrado no estoque (carrinho localizado no canto superior da tela)
// Parâmetros:
// - idCampo: identificador do campo que contem a quantidade de itens no estoque
// Retorno: nenhum
//-----------------------------------------------------------------------------------------------------------
function atualizarTotalEstoque(idCampo) {
    localStorage.setItem("totalEstoque",++document.getElementById(idCampo).innerHTML)
}
//-----------------------------------------------------------------------------------------------------------
// Função: carregarTotalEstoque(idCampo)
// Incrementa a quantidade de itens cadastrado no estoque (carrinho localizado no canto superior da tela)
// Parâmetros:
// - idCampo: identificador do campo que contem a quantidade de itens no estoque
// Retorno: nenhum
//-----------------------------------------------------------------------------------------------------------
function carregarTotalEstoque(idCampo) {
    if (typeof(Storage) !== "undefined") {
        let totalEstoque = localStorage.getItem("totalEstoque");
        if (totalEstoque == null) totalEstoque = 0;
        document.getElementById(idCampo).innerHTML = totalEstoque;
    }
    else alert("A versão do seu navegador é muito antiga. Por isso, não será possível executar essa aplicação");
}

//-----------------------------------------------------------------------------------------------------------
// Exibe todos os itens do estoque (nome, código e quantidade)
// Retorno: nenhum
//-----------------------------------------------------------------------------------------------------------
function listarEstoque() {
    if (typeof(Storage) !== "undefined") {
        let produtos = localStorage.getItem("produtos");
        let tabelaEstoque = document.getElementById("estoqueTable").getElementsByTagName("tbody")[0];

        if (produtos == null) {
            tabelaEstoque.innerHTML = "<tr><td colspan='3'>Ainda não há nenhum item no estoque</td></tr>";
        } else {
            produtos = JSON.parse(produtos);
            tabelaEstoque.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

            produtos.forEach(produto => {
                let linha = tabelaEstoque.insertRow(); // Adiciona uma nova linha

                let cellNome = linha.insertCell(0);
                let cellCodigo = linha.insertCell(1);
                let cellQuantidade = linha.insertCell(2);

                cellNome.innerText = produto.nome;
                cellCodigo.innerText = produto.codigo;
                cellQuantidade.innerText = produto.quantidade;
            });
        }
    } else {
        alert("A versão do seu navegador é muito antiga. Por isso, não será possível visualizar o estoque!");
    }
}
//-------------------------
// Adiciona o evento no campo de código do produto
document.addEventListener("DOMContentLoaded", function () {
    carregarTotalEstoque("totalEstoque");
    listarEstoque();
});

// Função para adicionar quantidade ao produto existente ou exibir mensagem de erro
function adicionarQuantidade() {
    let codigo = document.getElementById("codProdutoAtualizar").value.trim();
    let quantidade = parseInt(document.getElementById("qtidadeProdutoAtualizar").value.trim());

    if (!codigo) {
        alert("Por favor, insira o código do produto.");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
    }

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    let produtoEncontrado = produtos.find(produto => produto.codigo === codigo);

    if (produtoEncontrado) {
        // Atualiza a quantidade do produto
        produtoEncontrado.quantidade += quantidade;
        localStorage.setItem("produtos", JSON.stringify(produtos));
        alert(`Foram adicionadas ${quantidade} unidades ao produto "${produtoEncontrado.nome}".`);
        atualizarTabela();
    } else {
        alert("Produto não encontrado. Por favor, cadastre o produto primeiro.");
    }
}

// Função para atualizar a tabela com os dados mais recentes do localStorage
function atualizarTabela() {
    let tabelaEstoque = document.getElementById("estoqueTable").getElementsByTagName("tbody")[0];
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    tabelaEstoque.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

    produtos.forEach(produto => {
        let linha = tabelaEstoque.insertRow();

        let cellNome = linha.insertCell(0);
        let cellCodigo = linha.insertCell(1);
        let cellQuantidade = linha.insertCell(2);

        cellNome.innerText = produto.nome;
        cellCodigo.innerText = produto.codigo;
        cellQuantidade.innerText = produto.quantidade;
    });
}

// Outras funções já existentes, como carregarTotalEstoque, listarEstoque, etc.
// ...

