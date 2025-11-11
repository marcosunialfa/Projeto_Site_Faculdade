<?php
// Informações do banco Neon
$host = 'ep-orange-water-acsz2w5d-pooler.sa-east-1.aws.neon.tech';
$db = 'supermercado';
$user = 'neondb_owner';
$pass = 'npg_yjW8wUERe9hn';
$port = '5432';
$sslmode = 'require';

// Conexão com PostgreSQL usando pg_connect
$conn = pg_connect("host=$host port=$port dbname=$db user=$user password=$pass sslmode=$sslmode");

if (!$conn) {
    die("❌ Erro na conexão com o banco de dados.");
}

// Recebe os dados JSON enviados pelo JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    error_log("❌ Nenhum dado recebido ou JSON inválido.");
    echo json_encode(["success" => false, "error" => "JSON inválido"]);
    exit;
}

$nome = $data['nome'] ?? '';
$endereco = $data['endereco'] ?? '';
$valorTotal = floatval($data['valor']);
$produtos = $data['produtos']; // array de produtos

// Insere a compra
$query = "INSERT INTO compras (nome_cliente, endereco_cliente, valor_total) VALUES ($1, $2, $3) RETURNING id";
$result = pg_query_params($conn, $query, array($nome, $endereco, $valorTotal));

if ($result) {
    $row = pg_fetch_assoc($result);
    $compraId = $row['id'];

    // Insere os produtos comprados
    foreach ($produtos as $produto) {
        $nomeProduto = $produto['name'];
        $qtd = intval($produto['quantity']);

        $queryProduto = "INSERT INTO produtos_compra (compra_id, nome_produto, quantidade) VALUES ($1, $2, $3)";
        pg_query_params($conn, $queryProduto, array($compraId, $nomeProduto, $qtd));
    }

    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Erro ao registrar compra."]);
}
?>
