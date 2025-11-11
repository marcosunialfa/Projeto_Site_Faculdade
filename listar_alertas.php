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
    echo json_encode(["success" => false, "error" => "❌ Erro na conexão com o banco de dados."]);
    exit;
}

// Query para buscar alertas de estoque
$query = "
    SELECT ae.id, ae.codigo_produto, ae.nome_produto, ae.quantidade_solicitada, 
           ae.quantidade_disponivel, to_char(ae.data, 'DD/MM/YYYY HH24:MI') as data,
           c.nome AS nome_cliente, c.telefone, cmp.id AS compra_id
    FROM alertas_estoque ae
    JOIN compras cmp ON ae.compra_id = cmp.id
    JOIN clientes c ON cmp.cliente_id = c.id
    ORDER BY ae.data DESC
";

$result = pg_query($conn, $query);

if (!$result) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    pg_close($conn);
    exit;
}

$alertas = [];

while ($row = pg_fetch_assoc($result)) {
    $alertas[] = [
        "id" => $row['id'],
        "cliente" => $row['nome_cliente'],
        "telefone" => $row['telefone'],
        "codigo_produto" => $row['codigo_produto'],
        "nome_produto" => $row['nome_produto'],
        "quantidade_solicitada" => $row['quantidade_solicitada'],
        "quantidade_disponivel" => $row['quantidade_disponivel'],
        "compra_id" => $row['compra_id'],
        "data" => $row['data']
    ];
}

echo json_encode(["success" => true, "alertas" => $alertas]);

pg_close($conn);
?>
