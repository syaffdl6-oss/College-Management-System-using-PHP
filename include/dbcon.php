<?php
$dbname = "if0_42885023_sms";
$dbusername ="if0_42885023";
$dbpassword = "Collagemanag22";
$dbhost = "sql113.infinityfree.com";

$con = mysqli_connect($dbhost,$dbusername,$dbpassword,$dbname);
if (!$con) {
    http_response_code(500);
    exit('Database connection failed.');
}

mysqli_set_charset($con, 'utf8mb4');
?>
