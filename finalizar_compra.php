<?php
header("Content-Type: application/json");

// Conecta no banco
require("conexao.php");

// Receber dados JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "JSON inválido"]);
    exit;
}

$nome = $data['nome'] ?? '';
$endereco = $data['endereco'] ?? '';
$valor_total = $data['valor'] ?? 0;
$produtos = $data['produtos'] ?? [];
$telefone = $data['telefone'] ?? '';

if (!$nome || !$endereco || !$telefone || empty($produtos)) {
    echo json_encode(["success" => false, "error" => "Dados incompletos"]);
    exit;
}

try {
    // Iniciar transação
    pg_query($conn, "BEGIN");

    // Inserir cliente
    $sql_cliente = "INSERT INTO clientes (nome, endereco, telefone) VALUES ($1, $2, $3) RETURNING id";
    $result_cliente = pg_query_params($conn, $sql_cliente, [$nome, $endereco, $telefone]);

    if (!$result_cliente) {
        throw new Exception("Erro ao inserir cliente: " . pg_last_error($conn));
    }

    $cliente = pg_fetch_assoc($result_cliente);
    $cliente_id = $cliente['id'];

    // Inserir compra
    $sql_compra = "INSERT INTO compras (cliente_id, valor_total) VALUES ($1, $2) RETURNING id";
    $result_compra = pg_query_params($conn, $sql_compra, [$cliente_id, $valor_total]);




    if (!$result_compra) {
        throw new Exception("Erro ao inserir compra: " . pg_last_error($conn));
    }

    $compra = pg_fetch_assoc($result_compra);
    $compra_id = $compra['id'];

    // Processar cada produto
    foreach ($produtos as $produto) {
        $nome_produto = $produto['name'];
        $codigo_produto = $produto['codigo'];
        $quantidade = (int)$produto['quantity'];

        // Inserir na tabela produtos_comprados
        $sql_produto = "INSERT INTO produtos_comprados (compra_id, nome_produto, quantidade) VALUES ($1, $2, $3)";
        $result_produto = pg_query_params($conn, $sql_produto, [$compra_id, $nome_produto, $quantidade]);

        if (!$result_produto) {
            throw new Exception("Erro ao inserir produto: " . pg_last_error($conn));
        }

        // Verificar estoque
        $sql_check = "SELECT quantidade FROM estoque WHERE codigo = $1";
        $result_check = pg_query_params($conn, $sql_check, [$codigo_produto]);

        if ($row = pg_fetch_assoc($result_check)) {
            $quantidade_estoque = (int)$row['quantidade'];

            if ($quantidade_estoque >= $quantidade) {
                // Baixa normalmente
                $sql_update = "UPDATE estoque SET quantidade = quantidade - $1 WHERE codigo = $2";
                pg_query_params($conn, $sql_update, [$quantidade, $codigo_produto]);
            } else {
                // Estoque insuficiente → zera e gera alerta
                $sql_update = "UPDATE estoque SET quantidade = 0 WHERE codigo = $1";
                pg_query_params($conn, $sql_update, [$codigo_produto]);

                $sql_alerta = "INSERT INTO alertas_estoque (compra_id, codigo_produto, nome_produto, quantidade_solicitada, quantidade_disponivel) 
                               VALUES ($1, $2, $3, $4, $5)";
                pg_query_params($conn, $sql_alerta, [
                    $compra_id,
                    $codigo_produto,
                    $nome_produto,
                    $quantidade,
                    $quantidade_estoque
                ]);
            }
        } else {
            // Produto não encontrado → gera alerta de inexistente
            $sql_alerta = "INSERT INTO alertas_estoque (compra_id, codigo_produto, nome_produto, quantidade_solicitada, quantidade_disponivel) 
                           VALUES ($1, $2, $3, $4, 0)";
            pg_query_params($conn, $sql_alerta, [
                $compra_id,
                $codigo_produto,
                $nome_produto,
                $quantidade
            ]);
        }
    }

    // Commit da transação

    // Finaliza a transação
    pg_query($conn, "COMMIT");

    // Retorna apenas a mensagem simplificada
    echo json_encode(["success" => true, "message" => "✅ Compra registrada com sucesso!"]);

} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

pg_close($conn);
?>