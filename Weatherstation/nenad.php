<?php
    $server = 'localhost';
    $username = 'root';
    $password = 'root';
    $database = 'nenad';

    $mysql_connection = new mysqli($server, $username, $password, $database);
    // check connection
    if(  $mysql_connection->connect_errno) {
        printf('Connect failed: %s\n', $mysql_connection->connect_error);
        exit();
    }

    //=======How to create new entries=======
    //This will insert a fully populated new row with UPC, name, and price
    mysqli_query($mysql_connection, "INSERT INTO product_info (upc,name,price) VALUES(1231231,'Marija delicious cake',1000.00);");
    //This will insert a new row with missing UPC and price
    mysqli_query($mysql_connection, "INSERT INTO product_info (name) VALUES('Nenad awesome coffee');");

    //======How to access that entry======
    $results = mysqli_query($mysql_connection, "SELECT * FROM product_info WHERE id < 10);");

    //======How to edit that entry======
    mysqli_query($mysql_connection, "UPDATE product_info SET price='12.53' WHERE name='Nenad awesome coffee';");


    //How to delete that entry
    mysqli_query($mysql_connection, "DELETE FROM product_info WHERE name='Nenad awesome coffee';");
    mysqli_query($mysql_connection, "DELETE FROM product_info WHERE name='Marija delicious cake';");
?>