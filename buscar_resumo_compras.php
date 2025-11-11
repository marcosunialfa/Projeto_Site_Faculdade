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

if (!$conn) {
    echo json_encode(["success" => false, "error" => "Erro na conexão com o banco."]);
    exit;
}

// Consulta principal para pegar as compras
$query = "
    SELECT 
        cmp.id AS compra_id,
        c.nome AS nome_cliente,
        c.telefone AS telefone,
        c.endereco AS endereco,
        cmp.valor_total AS total
    FROM compras cmp
    JOIN clientes c ON cmp.cliente_id = c.id
    ORDER BY cmp.id DESC
";

$result = pg_query($conn, $query);

if (!$result) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    exit;
}

$compras = [];

while ($row = pg_fetch_assoc($result)) {
    $compra_id = $row['compra_id'];

    // Consulta os produtos dessa compra
    $query_produtos = "SELECT nome_produto, quantidade FROM produtos_comprados WHERE compra_id = $1";
    $result_produtos = pg_query_params($conn, $query_produtos, [$compra_id]);

    $produtos = [];
    while ($prod = pg_fetch_assoc($result_produtos)) {
        $produtos[] = $prod['nome_produto'] . " (x" . $prod['quantidade'] . ")";
    }

    $compras[] = [
        "nome" => $row['nome_cliente'],
        "telefone" => $row['telefone'],
        "endereco" => $row['endereco'],
        "produtos" => implode(", ", $produtos),
        "total" => number_format($row['total'], 2, ",", ".")
    ];
}

echo json_encode(["success" => true, "compras" => $compras]);
?>
