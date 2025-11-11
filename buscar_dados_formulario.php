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

// Consulta todos os dados do formulário
$query = "SELECT nome, email, telefone, mensagem FROM formularios ORDER BY id DESC";
$result = pg_query($conn, $query);

if (!$result) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    exit;
}

$dados = [];

while ($row = pg_fetch_assoc($result)) {
    $dados[] = $row;
}

echo json_encode(["success" => true, "dados" => $dados]);
?>
