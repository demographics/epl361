<?php
     /*
        We receive the information from the login form and
        if we can match a member from the database with the 
        email and the password, we then start a session with 
        these information, else we flash.
    */
    session_start();
    
    require("../../phpsqlajax_dbinfo.php");   

    $connection=mysql_connect ($host, $username, $password);

    if (!$connection) {
        die('Not connected : ' . mysql_error());
    }

    $db_selected = mysql_select_db($database, $connection);

    if (!$db_selected) {
        die ('Can\'t use db : ' . mysql_error());
    }  
                               
    $email = $_POST['email-input'];
    $user_password = $_POST['password-input'];

    $email = stripslashes($email);
    $email = mysql_real_escape_string($email);
    $user_password = stripslashes($user_password);
    $user_password = mysql_real_escape_string($user_password);
    $user_password = md5($user_password);

    $query = "SELECT * from $database.MEMBER WHERE email='$email' AND password='$user_password'";
    $result = mysql_query($query);
    $mple=0;
    $prasino=0;
    $poios=-1;
    while ($row = mysql_fetch_assoc($result)) {
        $mple=$row['pre74'];
        $prasino=$row['post74'];
        $poios=$row['id'];
    }

    if(mysql_num_rows($result)==1){
        $_SESSION["email"]=$email;
        $_SESSION["password"]=$user_password;
        $_SESSION["logged_in"]=1;
        $_SESSION["errorLogin"]=null;
        $_SESSION["pre74"]=$mple;
        $_SESSION["post74"]=$prasino;
        $_SESSION["member"]=$poios;
        header("location:login_success.php");
    }else{
        $_SESSION["errorLogin"]=1;
        header("location:../../index.php");
    }
    ob_end_flush();
?>