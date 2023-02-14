<?php

$mail_to  = "youremail@email.com";  // replace it with your email

$name     = $_POST['name'];
$email    = $_POST['email'];
$phone    = $_POST['phone'];
$message  = $_POST['message'];

$subject = "Contact Request From: " . $name;

$body   = "New Message From: " . "$name " . "<$email>" . "\n\n";
$body   .= "----------------" . "\n\n";
$body   .= "Name: " . "$name" . "\n\n";
$body   .= "Email: " . "$email" . "\n\n";
$body   .= "Phone: " . "$phone" . "\n\n";
$body   .= "Message: " . "\n\n" . "$message" . "\n\n";

$from  = "From: " . "$name " . "<$email>";

if (mail($mail_to, $subject, $body, $from)) {
  echo "success";
} else {
  echo "error";
}
