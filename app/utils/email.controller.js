const nodemailer = require("nodemailer");
const sql = require("../models/models");
let count = Math.round(Math.random() * 100000);

// FOR SENDING RECEIPTS TO CLIENTS ON SUCESSFUL PAYMENT
exports.generatePdf = async (data, result) => {
  var today = new Date();
  var date =
    +today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

  let message =
    `<center>` +
    `<div style="background-image: linear-gradient(to right, red, red), url(https://nexgoldfinance.com/images/log.png) height="100" style="height:300px" width:300px"; background-size: contain; background-repeat: no-repeat; background-position-x: center;">` +
    `<img src="https://nexgoldfinance.com/images/log.png"  style="width:300px; "/>` +
    `<h3> WITHDRAWAL APPROVED</h3>` +
    `<table width="100%" border="0" cellspacing="5" cellpadding="10"  style="background-image: url(https://nexgoldfinance.com/images/log.png); background-size: contain; background-repeat: no-repeat; background-position-x: center;">` +
    `<tbody style="text-align: left;">` +
    `<tr>` +
    `<th scope="row"  style="border-width: medium; border-style: outset;height: 40px; ">` +
    `Date` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset; height: 40px;">` +
    date +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th scope="row"  style="border-width: medium; border-style: outset;height: 40px; ">` +
    `Account Name` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset; height: 40px;">` +
    data.username +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px" scope="row">` +
    `Payment Type` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px">` +
    `Bitcoin` +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; " scope="row">` +
    `Requested Amount` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; ">` +
    `$` +
    data.roi +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; " scope="row">` +
    `Withdrawal Fee` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; ">` +
    `$0` +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; " scope="row">` +
    `Payment Account` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; ">` +
    data.wallet +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; " scope="row">` +
    `Credited Amount` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; ">` +
    `$` +
    data.roi +
    `</th>` +
    `</tr>` +
    `<tr>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; " scope="row">` +
    `Payment Status` +
    `</th>` +
    `<th style="border-width: medium; border-style: outset;height: 40px; ">` +
    `Approved` +
    `</th>` +
    `</tr>` +
    `</tbody>` +
    `</table>` +
    `<p style="padding: 20px;">` +
    `<b>` +
    `Enjoy your earnings and also get 10% referral commission when you refer your friends and colleagues.` +
    `</b>` +
    `</p>` +
    ` </div>` +
    ` </center>`;

  var mailOption = {
    from: `info@nexgoldfinance.com`,
    to: `${data.email}`,
    subject: `WITHDRAWAL RECEIPT`,
    html: message,
    // attachments: [
    //     {
    //         filename: `invoice${id}.pdf`,
    //         contentType: `application/pdf`,
    //         encoding: `base64`,
    //         content: fs.createReadStream(pathToFile),
    //         path: `${pathToFile}`,

    //     }
    // ]
  };
  var transporter = nodemailer.createTransport({
    host: `nexgoldfinance.com`,
    port: 465,
    secure: true,
    auth: {
      user: `info@nexgoldfinance.com`,
      pass: `info@nexgoldfinance.com`,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log("Error occured while sending withdrawal email");
      console.log(error);
      return result(error, null);
    } else {
      console.log("Sending receiptssssss. SENT");
      return result(null, info);
    }
  });
};

exports.sendOtp = async (email, otp, result) => {
  let message =
    `<center>` +
    `<img src="https://nexgoldfinance.com/images/log.png" height="100px" style="margin-bottom: -35px; height:100px; width:100px;" />` +
    `<div style="border-top-color: red; width: 100%; margin: 20; padding: 10; border-width: thick; border-style: outset;">` +
    `<h1 style="font-family:Arial, Helvetica, sans-serif ;">` +
    " Verification needed" +
    `</h1>` +
    `<div style="text-align: left; padding: 20px;">` +
    `<p>` +
    `<b>` +
    "Please confirm your reset password code request" +
    `</b>` +
    `</p>` +
    ` <p>` +
    "We have detected an account password request from a device about your NexGold Finance account." +
    ` </p>` +
    `<p>` +
    "To verify your account is safe, please use the following code to enable you reset your password:" +
    `</p>` +
    `</div>` +
    `<div style="background-color: #f2f2f2; height: 40px; text-align: center;">` +
    `<p style="padding: 10px;">` +
    otp +
    `</p>` +
    `</div>` +
    `<div style="text-align: left; padding: 20px;">` +
    `<h3>` +
    "That wasn't me ?" +
    `</h3>` +
    "If the above sign-in attempt wasn't you, please quickly login to your NexGold Finance account and change your password." +
    `</div>` +
    `</div>` +
    `</center>`;

  var mailOption = {
    from: `info@nexgoldfinance.com`,
    to: `${email}`,
    subject: `RESET PASSWORD OTP CODE`,
    html: message,
    // attachments: [
    //     {
    //         filename: `invoice${id}.pdf`,
    //         contentType: `application/pdf`,
    //         encoding: `base64`,
    //         content: fs.createReadStream(pathToFile),
    //         path: `${pathToFile}`,

    //     }
    // ]
  };
  var transporter = nodemailer.createTransport({
    host: `nexgoldfinance.com`,
    port: 465,
    secure: true,
    auth: {
      user: `info@nexgoldfinance.com`,
      pass: `info@nexgoldfinance.com`,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  transporter.sendMail(mailOption, (error, info) => {
    if (!error) {
      // console.log(error)
      console.log("otp code  receiptssssss. SENT");
      return result(null, info);
    } else {
      console.log("Error occured while sending otp code");
      return result(error, null);
    }
  });
};

exports.sendBonusSms = async (email, bouns, result) => {
  let message =
    `<center>` +
    `<img src="https://nexgoldfinance.com/images/log.png" height="100px" style="margin-bottom: -35px; height:100px; width:100px;" />` +
    `<div style="border-top-color: rgba(37, 104, 239, 1); width: 100%; margin: 20; padding: 10; border-width: thick; border-style: outset;">` +
    `<h1 style="font-family:Arial, Helvetica, sans-serif ;">` +
    " NexGold Finance " +
    `</h1>` +
    `<div style="text-align: left; padding: 20px;">` +
    `<p>` +
    `<b>` +
    "Bonus  Confirmation" +
    `</b>` +
    `</p>` +
    ` <p>` +
    "Hello  valued investor , we appreciate your endless effort towards investing in our platform this far" +
    ` </p>` +
    `<p>` +
    "In accordance to this, your trading portfolio has been funded with a bonus profits of " +
    `</p>` +
    `</div>` +
    `<div style="background-color: #f2f2f2; height: 40px; text-align: center;">` +
    `<p style="padding: 10px;">` +
    "$" +
    bouns +
    `</p>` +
    `</div>` +
    `<div style="text-align: left; padding: 20px;">` +
    "Thanks for unlimited trust and investment. Enjoy your earnings and also get 10% referral commission when you refer your friends and colleagues." +
    `</div>` +
    `</div>` +
    `</center>`;

  var mailOption = {
    from: `info@nexgoldfinance.com`,
    to: `${email}`,
    subject: `Bonus Confirmation`,
    html: message,
    // attachments: [
    //     {
    //         filename: `invoice${id}.pdf`,
    //         contentType: `application/pdf`,
    //         encoding: `base64`,
    //         content: fs.createReadStream(pathToFile),
    //         path: `${pathToFile}`,

    //     }
    // ]
  };
  var transporter = nodemailer.createTransport({
    host: `nexgoldfinance.com`,
    port: 465,
    secure: true,
    auth: {
      user: `info@nexgoldfinance.com`,
      pass: `info@nexgoldfinance.com`,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  transporter.sendMail(mailOption, (error, info) => {
    if (!error) {
      // console.log(error)
      console.log("otp code  receiptssssss. SENT");
      return result(null, info);
    } else {
      console.log("Error occured while sending otp code");
      return result(error, null);
    }
  });
};


// generatePdf(dummyData, (err, output) => {
//   if (err) {
//     console.log("error");
//   }
//   console.log("email sent");
// });
