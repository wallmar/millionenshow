<?php

include 'credentials.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

if (!isset($secret)) {
    http_response_code(500);
    return;
}

if (!empty($_POST)) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header('Content-type: application/json');

    $firstname = $_POST['Vorname'];
    $lastname = $_POST['Nachname'];
    $email = $_POST['E-Mail-Adresse'];
    $message = $_POST['Anfrage'];
    $consent = $_POST['Datenschutz'];
    $recaptchaResponse = $_POST['g-recaptcha-response'];

    $recaptchaUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$recaptchaResponse}";
    $verify = json_decode(file_get_contents($recaptchaUrl));

    if (!$verify->success || empty($firstname) || empty($lastname) || empty($email) || empty($message) || empty($consent) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        return;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->Host = 'localhost';

        //Recipients
        $mail->setFrom($email, "$firstname $lastname");
        $mail->addAddress('groyerhof@aon.at');
        $mail->addReplyTo($email, "$firstname $lastname");

        // Content
        $mail->isHTML(false);
        $mail->Subject = 'Groyerhof - Neue Kontaktanfrage';
        $bodyParagraphs = [];
        $mail->Body    = "Von {$firstname} {$lastname}:" . PHP_EOL . PHP_EOL . $message;

        if (!$mail->send()) {
            http_response_code(500);
            echo json_encode(["Error" => $mail->ErrorInfo]);
        } else {
            http_response_code(200);
        }
    }
    catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["Error" => $mail->ErrorInfo]);
    }
}
