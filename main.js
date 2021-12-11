import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// MICROSOFT API's
const BASE_URL = process.env.BASE_URL;
const URL_DETECT = process.env.URL_DETECT;
const API_KEY = process.env.API_KEY;
const HOST = process.env.HOST;

//NON-MICROSOFT API'S
const DETECT_LANG_API_KEY = process.env.DETECT_LANG_API_KEY;
const TOP_5_URL = process.env.TOP_5_URL;

// const URL_DICTIONARY = process.env.URL_DICTIONARY;
const DetectLanguage = require("detectlanguage");
const detectlanguage2NDAPI = new DetectLanguage(`${DETECT_LANG_API_KEY}`);

// Button For Switching Languages

let buttonForSwitchingLanguages = document.getElementById(
  "buttonForSwitchingLanguages"
);
//Grabs ahold of the LanguageSelectionBars, for some reason only works as a class hence the id and the class in the html tag
let selectionBar1 = document.querySelector(".languageSelectionBar");
let selectionBar2 = document.querySelector(".languageSelectionBar2");
//Disable Button for switching Languages
buttonForSwitchingLanguages.disabled = true;

// Add an event listener to take notice of when the LanguageSelectionBar changes in value and run the function switchLanguages
selectionBar1.addEventListener("change", check);

//function for checking the state of the selection bar
function check() {
  if (
    selectionBar1.options[selectionBar1.selectedIndex].value == "detectLanguage"
  ) {
    buttonForSwitchingLanguages.disabled = true; //button remains disabled if user selects detect language
  } else {
    buttonForSwitchingLanguages.disabled = false; //button is enabled if user selects a language
    buttonForSwitchingLanguages.addEventListener("click", swappingLanguages);
  }
}
// Function for swapping languages in selection bars and moving user input
function swappingLanguages() {
  /* Swapping Languages */
  let languageA = selectionBar1.options[selectionBar1.selectedIndex].value;
  let languageB = selectionBar2.options[selectionBar2.selectedIndex].value;
  let selectionBar1ID = document.getElementById("languageSelectionBar");
  let selectionBar2ID = document.getElementById("languageSelectionBar2");

  selectionBar1ID.value = languageB;
  selectionBar2ID.value = languageA;

  selectionBar1ID.options[
    selectionBar1ID.options.selectedIndex
  ].selected = true;
  selectionBar2ID.options[
    selectionBar2ID.options.selectedIndex
  ].selected = true;
  /* Swapping User Input */
  let textArea1 = document.getElementById("userTextInput");
  let textArea2 = document.getElementById("serverTranslatedText");

  let text1 = textArea2.value;
  let text2 = textArea1.value;

  textArea2.value = text2;
  textArea1.value = text1;

  //This link is below is how the selection bar is being selected
  //selected has to be added to the options on the selection bar
  //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
}
//Button for Translating
let buttonTranslate = document.getElementById("buttonForTranslate");

buttonTranslate.addEventListener("click", async () => {
  //Info for first language selection bar
  let languageSelectionBar = document.getElementById("languageSelectionBar");
  let valueChosenFromLanguageSelectionBar =
    languageSelectionBar.options[languageSelectionBar.selectedIndex].value;

  //Info for second language selection bar
  let languageSelectionBar2 = document.getElementById("languageSelectionBar2");
  let valueChosenFromLanguageSelectionBar2 =
    languageSelectionBar2.options[languageSelectionBar2.selectedIndex].value;

  //What user inputted in the first Texterea to be translated
  let translateText = document.getElementById("userTextInput").value;

  //If user selects detect language from selection bar 1 then run the following code and detect the language
  if (valueChosenFromLanguageSelectionBar == "detectLanguage") {
    //Asking the api to detect the language the user inputted
    let detectOptions = {
      method: "POST",
      url: `${URL_DETECT}`,
      params: { "api-version": "3.0" },
      headers: {
        "content-type": "application/json",
        //For some reason putting `${HOST}` breaks my code???? so I just left it like this
        "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
        "x-rapidapi-key": `${API_KEY}`,
      },
      data: [
        {
          //Text that needs to be detected for what language it is
          Text: `${translateText}`,
        },
      ],
    };
    //Once language has been detected begin to translate it but notice the responseDetect, looks funny right?
    //Yeah we're just going to ignore that. What happens in the Hood stays in the Hood
    await axios.request(detectOptions).then(function (responseDetect) {
      let translateOptions = {
        method: "POST",
        url: `${BASE_URL}`,
        params: {
          //translate to language that user wants the text to be translated to
          to: valueChosenFromLanguageSelectionBar2, //Language
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
            //Text that needs to be translated
            Text: `${translateText}`,
          },
        ],
      };

      // console.log(options);

      axios
        .request(translateOptions)
        .then(function (responseTranslate) {
          //Grabbing certain elements(Headings and textareas inputs) to reflect whats being translated to the frontend
          document.getElementById("serverTranslatedText").value =
            responseTranslate.data[0].translations[0].text;
          // document.getElementById("Detected").innerHTML =
          //   "Detected Language is " +
          //   responseTranslate.data[0].detectedLanguage.language;
          let language = document.getElementById("languageSelectionBar");
          /*A for loop that iterates to all the languages and returns the languges 
          that share the same value of the detected languages */
          for (let i = 0; i < language.options.length; i++) {
            let option = language.options[i];
            if (
              option.value ==
              responseTranslate.data[0].detectedLanguage.language
            ) {
              document.getElementById("Detected").innerHTML =
                "Detected Language is " + option.text;
              // console.log(option.text);
            }
          }
          let language2 = document.getElementById("languageSelectionBar2");
          /*A for loop that iterates to all the languages and returns the languges 
          that share the same value of given language */
          for (let j = 0; j < language2.options.length; j++) {
            let option2 = language2.options[j];

            if (
              option2.value == language2.options[language2.selectedIndex].value
            ) {
              document.getElementById("Detected2").innerHTML =
                "Language is " + option2.text;
              // console.log(option.text);
            }
          }
        })
        .catch(function (error1) {
          console.error(error1);
        });
    });
    //If user gave a language and doesnt want us to detect the language then jsut translate it
  } else if (valueChosenFromLanguageSelectionBar != "detectLanguage") {
    let translateOptions = {
      method: "POST",
      url: `${BASE_URL}`,
      params: {
        //translate to language that user wants the text to be translated to
        to: valueChosenFromLanguageSelectionBar2, //Language
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
          //text that needs to be translated
          Text: `${translateText}`,
        },
      ],
    };

    // console.log(options);

    await axios
      .request(translateOptions)
      .then(function (response) {
        //reflect on the frontend what language the user chose and the text that got translated

        document.getElementById("serverTranslatedText").value =
          response.data[0].translations[0].text;
        let language = document.getElementById("languageSelectionBar");
        for (let i = 0; i < language.options.length; i++) {
          let option = language.options[i];
          if (option.value == response.data[0].detectedLanguage.language) {
            document.getElementById("Detected").innerHTML =
              "Language is " + option.text;
            // console.log(option.text);
          }
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }
});

// DetectLanguage Endpoint
const buttonForDetectLanguage = document.getElementById("detectUsersInput");

buttonForDetectLanguage.addEventListener("click", async () => {
  let text = document.getElementById("userDetectInput").value;

  if (!text) {
    alert("Please put something in the detection");
  } else if (text) {
    detectlanguage2NDAPI.detect(text).then(function (result) {
      document.getElementById("langCodeOfDetect").innerHTML =
        "The language" +
        " is " +
        result[0].language +
        " with a confidence level of " +
        result[0].confidence;
    });
  }
});

//Top 5 languages

const Top5Lang = document.getElementById("Top5");
Top5Lang.addEventListener("click", async () => {
  let LanguageForCountry = languageSelectionBar3.value;

  let data = `${TOP_5_URL}` + LanguageForCountry;
  axios
    .request(data)

    .then(function (res) {
      let countries = [];

      for (let x = 0; x < res.data.length; x++) {
        countries.push(res.data[x].name.common);
      }
      for (i = 0; i < countries.length; i++) {
        let li = document.createElement("li");
        let text = document.createTextNode(countries[i]);
        li.appendChild(text);
        document.getElementById("myUl").appendChild(li);
      }
    });
});

// data fetched from API

// array to store lang with stats

//Useless Junk but I worked hard to think of these stuff and I don't want to redo them if theres ever a case we need it
//Detect + Translate

//   if (valueChosenFromLanguageSelectionBar2 == "detectLanguage2") {
//     let detectOptions = {
//       method: "POST",
//       url: `${URL_DETECT}`,
//       params: { "api-version": "3.0" },
//       headers: {
//         "content-type": "application/json",
//         "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
//         "x-rapidapi-key": `${API_KEY}`,
//       },
//       data: [
//         {
//           Text: `${translateText}`,
//         },
//       ],
//     };

//     await axios
//       .request(detectOptions)
//       .then(function (responseDetect) {
//         console.log(responseDetect.data[0].language);
//       })
//       .catch(function (error1) {
//         console.error(error1);
//       });
//   }

//   //TRANSLATE
//   else if (valueChosenFromLanguageSelectionBar2 != "detectLanguage2") {
//     let options = {
//       method: "POST",
//       url: `${BASE_URL}`,
//       params: {
//         to: valueChosenFromLanguageSelectionBar2, //Language
//         "api-version": "3.0",
//         profanityAction: "NoAction",
//         textType: "html", //To Html Or to Plain? The answer is the not the same
//       },
//       headers: {
//         "content-type": "application/json",
//         "x-rapidapi-host": `${HOST}`,
//         "x-rapidapi-key": `${API_KEY}`,
//       },
//       data: [
//         {
//           Text: `${translateText}`,
//         },
//       ],
//     };

//     // console.log(options);

//     await axios
//       .request(options)
//       .then(function (response) {
//         console.log(response);

//         document.getElementById("heading").innerHTML =
//           response.data[0].translations[0].text;
//         console.log(response.data[0].detectedLanguage.language);
//         document.getElementById("serverTranslatedText").value =
//           response.data[0].translations[0].text;
//       })
//       .catch(function (error) {
//         console.error(error);
//       });
//   }
// });

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

//THIS WORKS
// if (valueChosenFromLanguageSelection == "detectLanguage") {
//   let detectOptions = {
//     method: "POST",
//     url: `${URL_DETECT}`,
//     params: { "api-version": "3.0" },
//     headers: {
//       "content-type": "application/json",
//       "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
//       "x-rapidapi-key": `${API_KEY}`,
//     },
//     data: [
//       {
//         Text: `${translateText}`,
//       },
//     ],
//   };

//   await axios
//     .request(detectOptions)
//     .then(function (responseDetect) {
//       let translateOptions = {
//         method: "POST",
//         url: `${BASE_URL}`,
//         params: {
//           to: responseDetect.data[0].language, //Language
//           "api-version": "3.0",
//           profanityAction: "NoAction",
//           textType: "html", //To Html Or to Plain? The answer is the not the same
//         },
//         headers: {
//           "content-type": "application/json",
//           "x-rapidapi-host": `${HOST}`,
//           "x-rapidapi-key": `${API_KEY}`,
//         },
//         data: [
//           {
//             Text: `${translateText}`,
//           },
//         ],
//       };

//       // console.log(options);

//       axios
//         .request(translateOptions)
//         .then(function (responseTranslate) {
//           console.log(responseTranslate);

//           document.getElementById("heading").innerHTML =
//             responseTranslate.data[0].translations[0].text;
//           console.log(responseTranslate.data[0].detectedLanguage.language);
//           document.getElementById("serverTranslatedText").value =
//             responseTranslate.data[0].translations[0].text;
//         })
//         .catch(function (error) {
//           console.error(error);
//         });
//       console.log(responseDetect.data[0].language);
//     })
//     .catch(function (error1) {
//       console.error(error1);
// });
// }

// Dictionary Example Endpoint

// const buttonForDictionaryExample = document.getElementById(
//   "buttonForDictionaryExample"
// );
// let userDictionaryWord = document.getElementById("userDictionaryWord").value;

// buttonForDictionaryExample.addEventListener("click", async () => {
//   let word = document.getElementById("dictionaryWordLookUp").value;
//   let dictLang = document.getElementById("languageSelectionBar3").value;
//   console.log(dictLang);
//   let urlDictionary =
//     "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" +
//     `${DICTIONARY_API_KEY}` +
//     "&lang=" +
//     `${dictLang}` +
//     "&text=" +
//     `${word}`;
//   axios
//     .request(urlDictionary)

//     .then(function (responseDict) {
//       console.log(responseDict);
//       console.log(responseDict.data.def);
//       console.log(responseDict.data.def[0].pos); //Gives if noun or detirmner
//       console.log(responseDict.data.def[0].text); //Gives text that was inserted and is being dictionaried
//       console.log(responseDict.data.def[0].tr[0].text); //Outputs text that was inserted and translated to given language
//       console.log(responseDict.data.def[0].tr[1].text); //Outputs text that have more translations
//       console.log(responseDict.data.def[0].tr[2].text);
//       console.log(responseDict.data.def[0].tr[3].text);
//       // let wordInputtedByUser = responseDict.data.def[0].text;
//       // let nounOrDeterminer = responseDict.data.def[0].pos;
//       console.log(responseDict.data.def[0].tr[0].pos);
//       // document.getElementById("outputResults").innerHTML =
//       //   wordInputtedByUser +
//       //   " is a " +
//       //   nounOrDeterminer +
//       //   " down below are other examples of how to say the word in its respective language";
//       if (
//         responseDict.data.def[0].tr[0].text &&
//         responseDict.data.def[0].tr[1].text &&
//         responseDict.data.def[0].tr[2].text
//       ) {
//         let word1 = responseDict.data.def[0].tr[0].text;
//         let word2 = responseDict.data.def[0].tr[1].text;
//         let word3 = responseDict.data.def[0].tr[2].text;
//         document.getElementById("1stItem").innerHTML = word1;
//         document.getElementById("2ndItem").innerHTML = word2;
//         document.getElementById("3rdItem").innerHTML = word3;
//       } else if (
//         responseDict.data.def[0].tr[0].text &&
//         responseDict.data.def[0].tr[1].text
//       ) {
//         let word1 = responseDict.data.def[0].tr[0].text;
//         let word2 = responseDict.data.def[0].tr[1].text;
//         document.getElementById("1stItem").innerHTML = word1;
//         document.getElementById("2ndItem").innerHTML = word2;
//       } else if (responseDict.data.def[0].tr[0].text) {
//         let word1 = responseDict.data.def[0].tr[0].text;
//         document.getElementById("1stItem").innerHTML = word1;
//       } else {
//         document.getElementById("1stItem").innerHTML = "Nothing";
//       }
//     })

//     .catch(function (errorDict) {
//       console.error(errorDict);
//     });
// });
