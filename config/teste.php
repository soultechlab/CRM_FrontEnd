<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config/db.php';

try {
    echo "Conexão com o banco de dados está funcionando!";
} catch (PDOException $e) {
    echo "Erro ao conectar: " . $e->getMessage();
}
?>

