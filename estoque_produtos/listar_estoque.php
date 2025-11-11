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

$query = "SELECT id, nome, codigo, quantidade FROM estoque ORDER BY id ASC";
$result = pg_query($conn, $query);

if (!$result) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    exit;
}

$estoque = [];

while ($row = pg_fetch_assoc($result)) {
    $estoque[] = [
        "id" => $row['id'],
        "nome" => $row['nome'],
        "codigo" => $row['codigo'],
        "quantidade" => $row['quantidade']
    ];
}

echo json_encode(["success" => true, "estoque" => $estoque]);

pg_close($conn);
?>
