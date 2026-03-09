<?php
$conn = new mysqli("127.0.0.1", "root", "");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected to MySQL successfully.\n";

if ($conn->select_db("crm-comanda")) {
    echo "Database crm-comanda exists.\n";
} else {
    echo "Database crm-comanda DOES NOT exist.\n";
}
?>
