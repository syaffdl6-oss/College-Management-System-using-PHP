<?php
$dbname = "sms";
$dbusername ="root";
$dbpassword = "";
$dbhost = "localhost";

$con = mysqli_connect($dbhost,$dbusername,$dbpassword,$dbname);
if (!$con) {
    http_response_code(500);
    exit('Database connection failed.');
}

mysqli_set_charset($con, 'utf8mb4');
?>
