const nodemailer = require("nodemailer");

//set variables
let accountSetupComplete = false;
let testAccount;
let transporter;
let childrenData = [];

//get from address & to address from env file
const fromAddress = process.env.EMAIL_FROM || `"Fred Foo 👻" <foo@example.com>`;
const toAddress = process.env.EMAIL_TO || `bar@example.com, baz@example.com`;

async function main() {
  // Generate test SMTP service account from ethereal.email
  // only one time it will be created once app is launched
  if (!accountSetupComplete) {
    console.log("Email Account creation");
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
  accountSetupComplete = true;

  //this fragment will be called after an interval of 15secs
  //main fragment for sending mail
  setTimeout(async () => {
    try {
      //checking if child data is in pedning/newly added state
      if (childrenData.length) {
        //send mails to all the added children
        //don't move ahead until the process is complete
        let info = await Promise.all(
          childrenData.map((ele) => {
            return transporter.sendMail({
              from: `${fromAddress}`, // sender address
              to: `${toAddress}`, // list of receivers
              subject: `${ele.name}'s wish`,
              text: `[Name of child]: ${ele.name} \n \n [Wish]: ${ele.msg} \n \n [Address]: ${ele.address}`, // plain text body
              html: `<h2>[Name of child]: ${ele.name}</h2><br><h2>[Wish]: ${ele.msg}</h2><br><h2>[Address]: ${ele.address}</h2>`, // html body
            });
          })
        );
        console.log("sending email complete");
        //after sending all the mails, reset the childrenData array
        childrenData = [];
        //log all the sent mail's preview links
        info.forEach((el) => {
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(el));
        });
      } else {
        //if there is no data present then do nothing but just observe
        console.log("Email: no data");
      }
    } catch (e) {
      //in case of any error while sending mails
      console.log("error", e);
    }
    //call the main function again so that we keep process alive
    main();
  }, 15000);
}
//initialize main fun once the modules loads
main();

//function for receiving data from client module
//and pass it to fellow methods
function dataPush(data) {
  childrenData.push(data);
}

//export list
module.exports = {
  dataPush,
};
