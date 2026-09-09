<?php
$dbname = "if0_42873520_sms";
$dbusername ="if0_42873520";
$dbpassword = "Collagemanag12";
$dbhost = "sql209.infinityfree.com";

$con = mysqli_connect($dbhost,$dbusername,$dbpassword,$dbname);
if (!$con) {
    http_response_code(500);
    exit('Database connection failed.');
}

mysqli_set_charset($con, 'utf8mb4');
?>
