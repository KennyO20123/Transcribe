import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const HOST = process.env.HOST;

let button = document.getElementById("selectedButton");

let button2 = document.getElementById("submitCheckbox");

button.addEventListener("click", async () => {
  let valueOfChecked = document.querySelector(
    'input[name="language"]:checked'
  ).value;

  console.log(valueOfChecked);

  let translateText = document.getElementById("userTextInput").value;
  console.log(translateText);

  let options = {
    method: "POST",
    url: `${BASE_URL}`,
    params: {
      to: valueOfChecked, //Language
      "api-version": "3.0",
      profanityAction: "NoAction",
      textType: "html", //To Html Or to Plain? The answer is the not the same
    },
    headers: {
      "content-type": "application/json",
      "x-rapidapi-host": `${HOST}`,
      "x-rapidapi-key": `${API_KEY}`,
    },
    data: [
      {
        Text: `${translateText}`,
      },
    ],
  };

  // console.log(options);

  await axios
    .request(options)
    .then(function (response) {
      console.log(response);
      let obj = response.data[0].translations[0].text;
      console.log(obj);
      document.getElementById("heading").innerHTML = obj;
    })
    .catch(function (error) {
      console.error(error);
    });
});

/* Random stuff */

// axios
//   .request(options)
//   .then(function (response) {
//     let obj = response.data[0].translations[0].text;
//     // console.log(obj);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });

// let radios = document.getElementsByName("language");
// for (var i = 0, length = radios.length; i < length; i++) {
//   if (radios[i].checked) {
//     // do whatever you want with the checked radio
//     let valueOfChecked = radios[i].value;

//     // only one radio can be logically checked, don't check the rest
//     break;
//   }
// }

// button2.addEventListener("click", async () => {
// let valueOfChecked = document.querySelector(".language:checked").value;
// console.log(valueOfChecked);
// });
