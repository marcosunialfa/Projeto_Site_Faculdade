document.addEventListener("DOMContentLoaded", () => {
    listarEstoque();

    document.getElementById("btnCadastrar").addEventListener("click", () => {
        const nome = document.getElementById("nomeProduto").value.trim();
        const codigo = document.getElementById("codProduto").value.trim();
        const quantidade = parseInt(document.getElementById("qtidadeProduto").value);

        if (!nome || !codigo || quantidade <= 0) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        fetch('cadastrar_produto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, codigo, quantidade })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                listarEstoque();
                limparCampos();
            } else {
                alert("Erro: " + data.error);
            }
        });
    });
});

function listarEstoque() {
    fetch('listar_estoque.php')
    .then(response => response.json())
    .then(data => {
        const tabelaEstoque = document.getElementById('estoqueTable').getElementsByTagName('tbody')[0];
        tabelaEstoque.innerHTML = ''; // Limpa a tabela antes de adicionar os dados

        if (data.success) {
            if (data.estoque.length === 0) {
                tabelaEstoque.innerHTML = "<tr><td colspan='3'>Ainda não há nenhum item no estoque</td></tr>";
            } else {
                data.estoque.forEach(produto => {
                    const linha = tabelaEstoque.insertRow();

                    const cellNome = linha.insertCell(0);
                    const cellCodigo = linha.insertCell(1);
                    const cellQuantidade = linha.insertCell(2);

                    cellNome.textContent = produto.nome;
                    cellCodigo.textContent = produto.codigo;
                    cellQuantidade.textContent = produto.quantidade;
                });
            }
        } else {
            tabelaEstoque.innerHTML = "<tr><td colspan='3'>Erro ao carregar estoque</td></tr>";
            console.error("Erro:", data.error);
        }
    })
    .catch(error => {
        console.error("Erro na requisição:", error);
        const tabelaEstoque = document.getElementById('estoqueTable').getElementsByTagName('tbody')[0];
        tabelaEstoque.innerHTML = "<tr><td colspan='3'>Erro ao conectar ao servidor</td></tr>";
    });
}

function limparCampos() {
    document.getElementById("nomeProduto").value = "";
    document.getElementById("codProduto").value = "";
    document.getElementById("qtidadeProduto").value = "";
}
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

    fetch('atualizar_estoque.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            codigo: codigo,
            quantidade: quantidade,
            operacao: 'adicionar'
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao atualizar estoque.");
    });
}

function retirarQuantidade() {
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

    fetch('atualizar_estoque.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            codigo: codigo,
            quantidade: quantidade,
            operacao: 'retirar'
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao atualizar estoque.");
    });
}
function validarProduto(idNomeProduto, idCodProduto, idQtidadeProduto) {
    const nome = document.getElementById(idNomeProduto).value.trim();
    const codigo = document.getElementById(idCodProduto).value.trim();
    const qtidade = parseInt(document.getElementById(idQtidadeProduto).value.trim());

    if (!nome) {
        alert("Nome do produto não pode estar vazio.");
        return;
    }

    if (!codigo) {
        alert("Código do produto não pode estar vazio.");
        return;
    }

    if (!qtidade || qtidade <= 0) {
        alert("A quantidade deve ser maior que zero.");
        return;
    }

    fetch('cadastrar_produto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: nome,
            codigo: codigo,
            quantidade: qtidade
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.reload();
        } else {
            alert("❌ Erro: " + data.error);
        }
    })
    .catch(error => {
        console.error("Erro ao cadastrar:", error);
        alert("❌ Erro ao cadastrar o produto.");
    });
}