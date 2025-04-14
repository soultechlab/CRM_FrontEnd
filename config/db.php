<?php
$host = 'localhost';
$dbname = 'testecrm';
$user = 'root'; // Ou 'crm_user'
$password = '27610596';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Remove o echo para evitar exibir mensagens em produção
    // echo "Conexão com o banco de dados bem-sucedida!";
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}
?>
