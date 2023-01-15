// server.js
// where your node app starts

// init project
const express = require("express");
const morgan = require("morgan");
const app = express();
const request = require("request-promise");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/config.env" }); //configure env file

//load custom email module
const emailHandler = require("./Modules/emailHandler");

//URL for children data
const sources = [
  "https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json",
  "https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json",
];
let users, userProfiles;

//middleware
app.use(express.urlencoded());
app.use(express.json());

//Enable logging if ENV is development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));


//main function body
(async () => {
  try {
    //fetch children data first then move
    [users, userProfiles] = await Promise.all(
      sources.map((source) => {
        return request({
          url: source,
          json: true,
        });
      })
    );

    //read success/failure html file
    const successFailureFile = fs.readFileSync(
      __dirname + "/views/wishAcceptedRejected.html",
      "utf-8"
    );

    // http://expressjs.com/en/starter/basic-routing.html
    app.get("/", (request, response) => {
      response.sendFile(__dirname + "/views/index.html");
    });

    app.post("/", (request, response) => {
      //if userid is not send then sent a failure msg
      if (request?.body?.userid) {
        //check if user exists and fullfill the set criteria
        let checkRegistration = dataProcess(request.body.userid);

        //send response of the request
        response.send(
          successFailureFile.replace("{{%CONTENT%}}", checkRegistration.msg)
        );

        //if child credentials satisfy then send a mail to santa
        if (checkRegistration.msg.includes("Your Wish has been received!!..")) {
          emailHandler.dataPush({
            name: request.body.userid,
            msg: request.body.wish,
            address: checkRegistration.address,
          });
        }
      } else {
        response.send(
          successFailureFile.replace(
            "{{%CONTENT%}}",
            "Something is wrong, kindly resend your request"
          )
        );
      }
    });

    // listen for requests :)
    const listener = app.listen(process.env.PORT || 3000, function () {
      console.log("Your app is listening on port " + listener.address().port);
    });
  } catch (e) {
    //in case of any error
    console.log(e);
  }
})();

//function for checking whether the child's data present in database or not
//if data is present then check whether it is satisfying the condition or not
function dataProcess(username) {
  //check whether data is present in database or not
  let registeredChild = users.find((child) => child.username === username);
  if (registeredChild) {
    //check whether the fetcehd uid is matching in other database
    let childDetails = userProfiles.find(
      (child) => child.userUid === registeredChild.uid
    );
    if (childDetails) {
      //calculate age
      let age = getAge(childDetails.birthdate);
      if (age <= 10) {
        return {
          msg: "Your Wish has been received!!..",
          flag: true,
          address: childDetails.address,
        };
      } else {
        return {
          msg: "Age is greater than 10",
          flag: false,
          address: "",
        };
      }
    } else {
      return {
        msg: "Sorry No Details found",
        flag: false,
        address: "",
      };
    }
  } else {
    return {
      msg: "User Not Registered",
      flag: false,
      address: "",
    };
  }
}

//age calculator function
//date format first normalize then age is calculated
function getAge(dateString) {
  //normalize date to yyyy/mm/dd
  let processDate = dateString.split("/");
  var today = new Date(),
    birthDate = new Date(processDate[0], processDate[2], processDate[1]),
    age = today.getFullYear() - birthDate.getFullYear(),
    m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
