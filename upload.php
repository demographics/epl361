<?php
    /*
        We get all the variables passed via ajax and receives them from
        _POST variable. From the eventType variable we determine the action
        to be taken based on the switch statement for each event type.
        Later we call the _storeEvent() function to store the event in database.
    */
	
    session_start();

    $eventType = $_POST['event-type-input'];
    $eventTitle = $_POST['event-title-input'];
    $eventDate = $_POST['event-date-input'];
    $userEmail =  $_SESSION["email"];
    $eventContent = null;
    $tags = $_POST['event-tags-input'];

    switch($eventType){
        case "memoir":
            $eventContent=$_POST['memoir-content-input'];
            break;
        
        case "photo":
            $eventContent='<p class="photo-description">'.$_POST['photo-description-input'].'</p>';
            for($i=0; $i<count($_FILES['file']['name']); $i++) {
                move_uploaded_file($_FILES["file"]["tmp_name"][$i],
                "markers/events/" . $_FILES["file"]["name"][$i]);
                $eventContent.='<img class="photo-container" src="markers/events/'.$_FILES["file"]["name"][$i].'"></img>';
            }
            
            break;
        
        case "property":
            $eventContent='<p class="property-type"><b>Type:</b></br> '.$_POST['property-type-string'].'</p><p class="property-description"><b>Descrition:</b></br> '.$_POST['property-description-input'].'</p>';
            break;
        
        case "article":
            $eventContent=$_POST['summernote'];
            break;
        
        default:
            ;
    }
    
    _storeEvent($eventTitle,$eventType,$eventDate,$eventContent, $tags);
        
    /*
        We establish a connection with the database and retrieve the 
        member's ID based on their email from _SESSION variable, then
        we call the query to insert the event in the database. If 
        successfull, we return in the ajax caller function the newly
        stored event's ID.
    */
    function _storeEvent($title,$type,$date,$content,$tags){
        require("phpsqlajax_dbinfo.php");  
        
        $email= $_SESSION['email'];
        $userID=null;
        $eventID=null;
        $connection=mysql_connect ($host, $username, $password);
        
        if (!$connection) {
          die('Not connected : ' . mysql_error());
        }

        $db_selected = mysql_select_db($database, $connection);

        if (!$db_selected) {
          die ('Can\'t use db : ' . mysql_error());
        }
        $query = "SELECT id FROM $database.member WHERE email='$email'";
        $result = mysql_query($query);
        while ($row = @mysql_fetch_assoc($result)){
            $userID=$row['id'];
        }

        $query = "INSERT INTO $database.event(title,`type`,content,`datetime`,`date`,`view`,`like`,member, tags) VALUES ('$title','$type','$content',NOW(),STR_TO_DATE('$date', '%d/%m/%Y'),0,0,'$userID', '$tags')";
        $result = mysql_query($query);        
        
        if (!$result) {
            die('Invalid query: ' . mysql_error());
        }
        else{
            $query = "SELECT id FROM $database.event WHERE title='$title' AND `type`='$type' AND `date`=STR_TO_DATE('$date', '%d/%m/%Y')";
            $result = mysql_query($query);        
            while ($row = @mysql_fetch_assoc($result)){
               $eventID=$row['id'];
            }
            echo $eventID;
        }
    }
?>