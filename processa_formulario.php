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
    echo json_encode(["success" => false, "error" => "Erro na conexão com o banco de dados"]);
    exit;
}

// Recebe dados JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "JSON inválido"]);
    exit;
}

$nome = $data['nome'] ?? '';
$email = $data['email'] ?? '';
$telefone = $data['telefone'] ?? '';
$mensagem = $data['mensagem'] ?? '';

if (!$nome || !$email || !$telefone || !$mensagem) {
    echo json_encode(["success" => false, "error" => "Dados incompletos"]);
    exit;
}

// Inserir no banco
$sql = "INSERT INTO formularios (nome, email, telefone, mensagem) VALUES ($1, $2, $3, $4)";
$result = pg_query_params($conn, $sql, [$nome, $email, $telefone, $mensagem]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Formulário enviado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
}

pg_close($conn);
?>
