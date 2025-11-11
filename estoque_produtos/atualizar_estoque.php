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

$data = json_decode(file_get_contents("php://input"), true);

$codigo = $data['codigo'] ?? '';
$quantidade = intval($data['quantidade'] ?? 0);
$operacao = $data['operacao'] ?? '';

if (!$codigo || $quantidade <= 0 || !in_array($operacao, ['adicionar', 'retirar'])) {
    echo json_encode(["success" => false, "message" => "Dados inválidos."]);
    exit;
}

// Verifica se o produto existe
$check = pg_query_params($conn, "SELECT quantidade FROM estoque WHERE codigo = $1", [$codigo]);

if (pg_num_rows($check) === 0) {
    echo json_encode(["success" => false, "message" => "Produto não encontrado."]);
    exit;
}

$row = pg_fetch_assoc($check);
$quantidadeAtual = intval($row['quantidade']);

if ($operacao === 'adicionar') {
    $novaQuantidade = $quantidadeAtual + $quantidade;
} elseif ($operacao === 'retirar') {
    if ($quantidadeAtual < $quantidade) {
        echo json_encode(["success" => false, "message" => "Estoque insuficiente para retirada."]);
        exit;
    }
    $novaQuantidade = $quantidadeAtual - $quantidade;
}

$update = pg_query_params($conn, "UPDATE estoque SET quantidade = $1 WHERE codigo = $2", [$novaQuantidade, $codigo]);

if ($update) {
    echo json_encode(["success" => true, "message" => "Estoque atualizado com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => pg_last_error($conn)]);
}

pg_close($conn);
?>
