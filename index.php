<?php
require_once('include/login_header.php');
?>
<?php
    require_once('include/dbcon.php');
    ?>
  
<!-- Session Checking -->
<?php
if(isset($_SESSION['name']))
{

}
else{
  
}

?>
<?php


?>

<nav class="brown darken-4">
    <div class="container">
        <a class="brand-logo hide-on-med-and-down" href="">College Management System</a>
    <ul class="right">
        <li class="waves-effect waves-light"><a href="">About Us</a></li>
        <li class="waves-effect waves-light"><a href="login.php">Teacher Login</a></li>
        <li class="waves-effect waves-light"><a href="students">Student Login</a></li>
    </ul>
</div>
</nav>

   <body style="background-image:url(images/sms_bg.jpg); background-size: cover; background-repeat: no-repeat; ">
    <div class="row">
            <div class="col l4 offset-l4 m12 s12">
                <div class="card-panel with-header" style="border-radius: 15px; opacity: 0.9; margin-top: 25%;">
                    <div class="card-header center">
                        <h5>Student information</h5>
                    </div>
                    <form action="" method="POST">
                    <div class="input-field">
                       <!-- <select name="standerd" class="browser-default" > -->
                        <select name="standerd" required>
                            <option value="" class="disabled" selected>Select Programme</option>
                            <option value="Btech">Btech</option>
                            <option value="BBA">BBA</option>
                            <option value="BCA">BCA</option>
                            <option value="MBA">MBA</option>
                            <option value="MCA">MCA</option>
                            <option value="Mtech">Mtech</option>
                        </select>
                    </div>
                    <div class="input-field">
                        <input type="text" name="rollno" id="rollno">
                        <label for="rollno">Enter Your Roll Number</label>
                    </div>
                    <div class="center">
                        <button class="btn waves-effect waves-light" name="submit" style="width: 100%; border-radius: 15px;">Show Information</button>
                    </div>
                </form>
                </div>
            </div>
    </div>

<?php
 if(isset($_POST['submit'])){

    $standerd = trim($_POST['standerd'] ?? '');
    $rollno = trim($_POST['rollno'] ?? '');
    $programCodes = ['Btech' => '1', 'BBA' => '2', 'BCA' => '3', 'MBA' => '4', 'MCA' => '5', 'Mtech' => '6'];

    $data = null;
    if ($standerd !== '' && $rollno !== '' && isset($programCodes[$standerd])) {
        $code = $programCodes[$standerd];
        $statement = mysqli_prepare($con, 'SELECT * FROM students WHERE rollno = ? AND (standerd = ? OR standerd = ?) LIMIT 1');
        mysqli_stmt_bind_param($statement, 'sss', $rollno, $standerd, $code);
        mysqli_stmt_execute($statement);
        $result = mysqli_stmt_get_result($statement);
        $data = mysqli_fetch_assoc($result);
        mysqli_stmt_close($statement);
    }


      

    if(!$data)
    {
        echo "<script> alert('No such student found!')</script>";
    }
    else{

        $image = $data['image'];
        $name = $data['name'];
        $rollno = $data['rollno'];
        $standerd = $data['standerd'];
        $gender = $data['gender'];
        $city  = $data['city'];
        $contact = $data['contact'];
?>

    <!-- Table Coding-->

        <div class="row">
            <div class="col l6 offset-l3 m12 s12">
                <div class="card-panel" style="border-radius: 20px; opacity: 0.91">
                    <div class="row">
                      <div class="col l4 m12 s12 center">
                        <img src="img/<?php echo $image; ?>" alt="" class=" responsive-img circle" >
                        <h5 style="font-family:Impact, Charcoal, sans-serif; ">
                            <?php echo $name; ?>
                        </h5>
                    </div>
                        <div class="col l8 m12 s12" >
                            <ul class="collection" style="border-radius: 25px;" >
                                <li class="collection-item" >
                                    <table class="striped" >
                                        <tr >
                                            <th>Roll No</th>
                                            <td><?php  echo $rollno; ?></td>
                                        </tr>
                                        <tr>
                                            <th>Name</th>
                                            <td><?php  echo $name; ?></td>
                                        </tr>
                                        <tr>
                                            <th>Standerd</th>
                                            <td><?php  echo $standerd; ?></td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td><?php  echo $contact; ?></td>
                                        </tr>                                                              <tr>
                                            <th>City</th>
                                            <td><?php  echo $city; ?></td>
                                        </tr>
                                    </table>
                                </li>
                            </ul>
                        </div>
                    </div>
               </div>
        </div>
    </div>
<?php
    }
}
?>

                    
    <!--Import jQuery before materialize.js-->
    <script type="text/javascript" src="js/jquery-3.4.1.min.js"></script>
<script type="text/javascript" src="js/materialize.min.js"></script>
<!-- Compiled and minified JavaScript --> 
<script>
 $(document).ready(function(){

$('select').formSelect();
});
</script>
</body>
</html>




