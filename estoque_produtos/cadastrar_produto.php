<?php
header("Content-Type: application/json");

// Conexão com o banco
$host = 'ep-orange-water-acsz2w5d-pooler.sa-east-1.aws.neon.tech';
$db = 'supermercado';
$user = 'neondb_owner';
$pass = 'npg_yjW8wUERe9hn';
$port = '5432';
$sslmode = 'require';

$conn = pg_connect("host=$host port=$port dbname=$db user=$user password=$pass sslmode=$sslmode");

// Recebe os dados do JSON
$data = json_decode(file_get_contents("php://input"), true);

$nome = $data['nome'] ?? '';
$codigo = $data['codigo'] ?? '';
$quantidade = intval($data['quantidade'] ?? 0);

if (!$nome || !$codigo || $quantidade <= 0) {
    echo json_encode(["success" => false, "error" => "Dados inválidos."]);
    exit;
}

// Verifica se já existe o produto
$check = pg_query_params($conn, "SELECT quantidade FROM estoque WHERE codigo = $1", [$codigo]);

if (pg_num_rows($check) > 0) {
    // Produto já existe, atualiza quantidade
    $row = pg_fetch_assoc($check);
    $novaQuantidade = intval($row['quantidade']) + $quantidade;

    $update = pg_query_params($conn, "UPDATE estoque SET quantidade = $1 WHERE codigo = $2", [$novaQuantidade, $codigo]);

    if ($update) {
        echo json_encode(["success" => true, "message" => "Quantidade atualizada com sucesso!"]);
    } else {
        echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    }
} else {
    // Produto não existe, insere
    $insert = pg_query_params($conn, "INSERT INTO estoque (nome, codigo, quantidade) VALUES ($1, $2, $3)", [$nome, $codigo, $quantidade]);

    if ($insert) {
        echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
    } else {
        echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    }
}

pg_close($conn);
?>