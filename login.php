<?php
require_once('include/login_header.php');
?>
<?php

    require_once('include/dbcon.php');

    if(isset($_POST['login'])){

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $statement = mysqli_prepare($con, 'SELECT * FROM teacher WHERE email = ? LIMIT 1');
    mysqli_stmt_bind_param($statement, 's', $email);
    mysqli_stmt_execute($statement);
    $data = mysqli_fetch_assoc(mysqli_stmt_get_result($statement));
    mysqli_stmt_close($statement);

    // Existing demo accounts use plaintext passwords. Successful legacy logins are
    // transparently upgraded; newly created accounts must always be hashed.
    $validPassword = $data && (password_verify($password, $data['password']) || hash_equals($data['password'], $password));
    if(!$validPassword)
    {
        $_SESSION['login_failed'] = "Username Or Password Wrong";
        $login_failed = $_SESSION['login_failed'];
    }
    else{
        $name = $data['name'];
        $uid = $data['id'];
        if (!password_get_info($data['password'])['algo']) {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $upgrade = mysqli_prepare($con, 'UPDATE teacher SET password = ? WHERE id = ?');
            mysqli_stmt_bind_param($upgrade, 'si', $hash, $uid);
            mysqli_stmt_execute($upgrade);
            mysqli_stmt_close($upgrade);
        }
        session_regenerate_id(true);
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $name;
        $_SESSION['uid'] = $uid;
        header("location:admin/dashboard.php");
    }
}
?>


<?php
if(isset($_SESSION['uid']))
{
header("location:admin/dashboard.php");
}
else{
  
}

?>
  <body style="background-image:url(images/sms_bg.jpg); background-size: cover;">
    <div class="row"style="margin-top:10%; opacity: 0.8;">
        <div class="col l4 offset-l4 m6 offset-m3 s12">
            <form action="" method="POST">
                    <div class="card-panel" style="border-radius: 15px;">
                            <div class="card-content">
                                <h5 class="<?php if(isset($login_failed)) { echo "hide";} ?>" >Login Form</h5>
                            </div>
                                                            <span class="card-title container">
              <h5 class="center red-text"><?php 
              
                if(isset($login_failed)){
                  echo $login_failed; 
                }
                

              ?> </h5>
            </span>
                            <div class="input-field">
                                <i class="material-icons prefix">
                                    person
                                </i>
                                <input type="email" name="email" id="email" required="required" autocomplete="email">
                                <label for="email">Enter Your Email Address</label>
                            </div>
                            <div class="input-field">
                                <i class="material-icons prefix">
                                    lock
                                </i>                    
                                <input type="password" name="password" id="password" required="required" autocomplete="current-password">
                                <label for="password">Enter Your Password</label>
                            </div>
                            <div class="">
                            <input type="checkbox" name="checkbox" id="checkbox">
                            <label for="checkbox">Remember Me!</label>
                        </div>
                        <br>
                            <div>
                            <button type="submit" name="login" class="btn" style="width: 100%; border-radius: 15px;">Login</button>
                        </div>
                        </div>
            </form>
        </div>
    </div>
  
                    
    <!--Import jQuery before materialize.js-->
    <script type="text/javascript" src="js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="js/materialize.min.js"></script>
</body>
</html>
