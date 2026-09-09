<?php
require_once('../include/header.php');
?>

<?php

    require_once('../include/dbcon.php');

    if(isset($_POST['submit'])){
    $rollno = trim($_POST['rollno'] ?? '');
    $standerd = $_POST['standerd'] ?? '';
    $username = trim($_POST['username'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $gender = $_POST['gender'] ?? '';
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $city = trim($_POST['city'] ?? '');
    $allowedPrograms = ['1', '2', '3', '4', '5', '6'];

    if ($rollno === '' || !in_array($standerd, $allowedPrograms, true) || !preg_match('/^[A-Za-z0-9_.-]{3,40}$/', $username) || $name === '' || !in_array($gender, ['male', 'female'], true) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || $city === '') {
      $student_added_failed = 'Please enter valid details. Username must be 3–40 characters and password at least 8 characters.';
    } else {
      $image_name = 'user.png';
      if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        $file = $_FILES['image'];
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $mime = $file['error'] === UPLOAD_ERR_OK ? (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) : false;
        if ($file['error'] !== UPLOAD_ERR_OK || !isset($extensions[$mime]) || $file['size'] > 2 * 1024 * 1024) {
          $student_added_failed = 'Upload a JPG, PNG, or WebP image smaller than 2 MB.';
        } else {
          $image_name = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
          if (!move_uploaded_file($file['tmp_name'], '../img/' . $image_name)) {
            $student_added_failed = 'Unable to save the profile image.';
          }
        }
      }

      if (!isset($student_added_failed)) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $statement = mysqli_prepare($con, 'INSERT INTO students (rollno, standerd, username, name, gender, contact, email, password, city, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        mysqli_stmt_bind_param($statement, 'ssssssssss', $rollno, $standerd, $username, $name, $gender, $contact, $email, $passwordHash, $city, $image_name);
        $run = mysqli_stmt_execute($statement);
        mysqli_stmt_close($statement);
        if ($run) {
          $student_added = 'Student added successfully.';
        } else {
          $student_added_failed = 'Unable to add student. Roll number, username, or email may already be in use.';
        }
      }
    }
}
?>
      <!-- The Coding Has Been Started From Here -->

      <nav class="teal">
        <div class="container">
          <div class="nav-wrapper">
            <a href="" class="brand-logo center">Social Learnia</a>
            <a href="" class="sidenav-trigger show-on-large" data-target="slide-out"><i class="material-icons">menu</i></a>
          </div>        
        </div>
      </nav>


      <!-- The Dashboard Coding Started From Here -->

        <div class="row main">
            <div class="col l12 m12 s12">
              <form action="" method="POST" enctype="multipart/form-data">
                <div class="card-panel">
                <div class="cente">
                <h5 class="center red-text"><?php 
              
              if(isset($student_added)){
                echo $student_added; 
              }
              elseif(isset($student_added_failed)){
                echo $student_added_failed;
              }
              

            ?> </h5></div>
                    <div class="row">
                      <div class="col l4 m12 s12 center">
                     <div class="input-field file-field">
                     <input type="file" name="image" class="dropify" data-show-remove="false" data-default-file="../images/user.png" />
                     </div>
                      </div>
                        <div class="col l4">
                            <div class="input-field">
                                    <i class="material-icons prefix">person</i>
                                <input type="text" name="rollno" id="rollno" required="required">
                                <label for="rollnow">Enter Roll Number</label>
                            </div>
                            <div class="input-field">
                                <i class="material-icons prefix">person</i>
                                    <input type="text" name="name" id="name" required="required">
                                    <label for="name">Enter Name</label>
                                </div>
                                <div class="input-field">
                                    <i class="material-icons prefix">account_circle</i>
                                    <input type="text" name="username" id="username" required="required" pattern="[A-Za-z0-9_.-]{3,40}">
                                    <label for="username">Username</label>
                                </div>
                                <div class="input-field">
                                        <i class="material-icons prefix">call</i>
                                        <input type="text" name="contact" id="contact" required="required">
                                        <label for="contact">Enter Mobile Number</label>
                                    </div>
                        </div>
                        <div class="row">
                            <div class="col l4">
                                <div class="input-field">
                                    <select name="standerd" required="required">
                                            <option value="">Choose Standerd </option>
                                            <option value="1">Btech</option>
                                            <option value="2">BBA</option>
                                            <option value="3">BCA</option>
                                            <option value="4">MBA</option>
                                            <option value="5">MCA</option>
                                            <option value="6">Mtech</option>
                                            

                                    </select>
                                </div>
                                <div class="input-field">
                                        <i class="material-icons prefix">location_city</i>
                                        <input type="text" name="city" id="city" required="required">
                                        <label for="city">Enter City Name</label>
                                    </div>
                                  <div class="input-field">
                                      <i class="material-icons prefix">email</i>
                                      <input type="email" name="email" id="email" required="required">
                                      <label for="email">Enter Email Address</label>
                                  </div>
                                  <div class="input-field">
                                      <i class="material-icons prefix">lock</i>
                                      <input type="password" name="password" id="password" required="required" minlength="8" autocomplete="new-password">
                                      <label for="password">Password (8 characters minimum)</label>
                                  </div>

                            </div>
                        </div>
                        <div class="col l4 center">
                          
                        </div>
                        <div class="col l8 center large">
                          <input type="radio" name="gender" id="male" value="male" required="required">
                          <label for="male">Male</label>
                          <input type="radio" name="gender" id="female" value="female" required="required">
                          <label for="female">Female</label>
                        </div>
                    </div>
                     
                    <button type="submit" name="submit" style="width:100%" class="btn">Add Students</button>
                </div>
              </form>

            </div>
        </div>

      <!-- The Navbar Menu Collection List -->

      <?php
require_once('../include/sidenav.php');
?>


      <?php
require_once('../include/footer.php');
?>
