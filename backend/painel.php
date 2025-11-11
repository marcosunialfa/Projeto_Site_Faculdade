<?php
header("Content-Type: application/json");

// Conexão com o Neon
$host    = 'ep-orange-water-acsz2w5d-pooler.sa-east-1.aws.neon.tech';
$db      = 'supermercado';
$user    = 'neondb_owner';
$pass    = 'npg_yjW8wUERe9hn';
$port    = '5432';
$sslmode = 'require';

$conn = pg_connect("host=$host port=$port dbname=$db user=$user password=$pass sslmode=$sslmode");
if (!$conn) {
    echo json_encode(["success" => false, "error" => pg_last_error()]);
    exit;
}

// Função auxiliar para executar query e abortar em caso de erro
function execQuery($conn, $sql) {
    $res = pg_query($conn, $sql);
    if (!$res) {
        echo json_encode([ "success" => false, "error" => pg_last_error($conn) ]);
        exit;
    }
    return $res;
}

// 1) Totais gerais
// a) Clientes que já finalizaram compras
//$r1 = execQuery($conn, "SELECT SUM(cliente_id) AS total_clientes FROM compras");
$r1 = execQuery($conn, "SELECT COUNT(DISTINCT cliente_id) AS total_clientes FROM compras");
// b) Total de itens em estoque
$r2 = execQuery($conn, "SELECT SUM(quantidade) AS estoque_total FROM estoque");
// c) Receita total
$r3 = execQuery($conn, "SELECT SUM(valor_total) AS receita_total FROM compras");

$t1 = pg_fetch_assoc($r1);
$t2 = pg_fetch_assoc($r2);
$t3 = pg_fetch_assoc($r3);

// 2) Dados para o gráfico de estoque
$r4 = execQuery($conn, "SELECT nome, quantidade FROM estoque ORDER BY nome");
$produtosGraf = [];
while ($row = pg_fetch_assoc($r4)) {
    $produtosGraf[] = [
        "nome"       => $row["nome"],
        "quantidade" => (int)$row["quantidade"]
    ];
}

// Monta e envia o JSON
echo json_encode([
    "success"      => true,
    "totais"       => [
        "clientes" => (int)$t1["total_clientes"],
        "estoque"  => (int)$t2["estoque_total"],
        "receita"  => (float)$t3["receita_total"]
    ],
    "produtosGraf" => $produtosGraf
]);

pg_close($conn);
