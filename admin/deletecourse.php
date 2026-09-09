<?php
session_start();
require_once('../include/dbcon.php');

if (!isset($_SESSION['uid'])) {
    http_response_code(403);
    exit('Access denied.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
    http_response_code(400);
    exit('Invalid delete request.');
}

$courseId = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$courseId) {
    http_response_code(400);
    exit('Invalid course.');
}

$statement = mysqli_prepare($con, 'DELETE FROM course WHERE course_id = ?');
mysqli_stmt_bind_param($statement, 'i', $courseId);
mysqli_stmt_execute($statement);
mysqli_stmt_close($statement);
header('Location: course.php');
exit;
?>
