const verificationEmailTemplate = (username,verificationCode)=>{
  const htmlvalue = `<!DOCTYPE html>
<html>
<head>
  <title>Email Verification</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f0f0f0;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }

    p {
      margin-bottom: 15px;
    }

    .code {
      font-weight: bold;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification</h1>
    <p>Hi ${username},</p>
    <p>Thank you for registering! To verify your email address, please enter the following verification code:</p>
    <p class="code">${verificationCode}</p>
    <p>This code will expire in 1 hour.</p>
    <p>If you did not request this verification, please ignore this email.</p>
    <p>Sincerely,</p>
    <p>Unity Group</p>
  </div>
</body>
</html>`

             return htmlvalue;
}

export default verificationEmailTemplate