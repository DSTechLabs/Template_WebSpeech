//=========================================================
//
//     FILE : webSpeech.js
//
//  PROJECT : Web Speech Template
//            https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
//
//   AUTHOR : Bill Daniels
//            Copyright 2024, D+S Tech Labs, Inc.
//            MIT License
//
//=========================================================

//--- Globals ---------------------------------------------

const SpeechRecognition      = window.SpeechRecognition      || window.webkitSpeechRecognition;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const dataWindow = document.getElementById ('dataWindow');
let   listener   = null;
let   speaker    = null;
let   canListen  = false;
let   canSpeak   = false;
let   voices     = [];
let   numResults = 0;


//--- Startup ---------------------------------------------

try
{
  // Check for speech support
  if (SpeechRecognition      == undefined || SpeechRecognition      == null ||
      SpeechRecognitionEvent == undefined || SpeechRecognitionEvent == null)
    throw 'This browser does not support speech.\nPlease use the Chrome browser.';

  //-----------------
  // Create listener
  //-----------------
  listener = new SpeechRecognition ();
  if (listener == undefined || listener == null)
    addToLog ('This browser cannot recognize speech.');
  else
  {
    canListen = true;

    listener.continuous      = true;
    listener.lang            = 'en-US';  // Many languages are supported
    listener.interimResults  = false;
    listener.maxAlternatives = 1;

    listener.onresult = function (event)
    {
      // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
      // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
      // It has a getter so it can be accessed like an array
      // The first [0] returns the SpeechRecognitionResult at the last position.
      // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
      // These also have getters so they can be accessed like arrays.
      // The second [0] returns the SpeechRecognitionAlternative at position 0.
      // We then return the transcript property of the SpeechRecognitionAlternative object

      const output = event.results[numResults][0].transcript + ' (' + event.results[numResults][0].confidence + ')';
      ++numResults;

      addToLog (output);
    }

    listener.onnomatch = () =>
    {
      addToLog ('((( I did not recognise that )))');
    }

    listener.onend = () =>
    {
      addToLog ('((( I stopped listening )))');

      // Even though the listener was set to continous, listening may stop
      // You can start it up again by calling startListening()
    }

    listener.onerror = (event) =>
    {
      addToLog ('((( Error occurred in recognition ))) ' + event.error);
    }
  }

  //----------------
  // Text-to-Speech
  //----------------
  speaker = window.speechSynthesis;
  if (speaker == undefined || speaker == null)
    addToLog ('This browser cannot speak.');
  else
  {
    canSpeak = true;

    // In Chrome, voices are not loaded immediately with page load.
    // So it is necessary to wait for voices to load asynchronously.
    speaker.onvoiceschanged = populateVoiceList;

    // Other browsers
    populateVoiceList ();
  }

  //-----------------
  // Start listening
  //-----------------
  startListening ();
}
catch (ex)
{
  alert (ex);
}

//--- startListening ---------------------------------------

function startListening ()
{
  try
  {
    if (canListen)
    {
      numResults = 0;
      listener.start ();
      addToLog ('Listening ...');
    }
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- stopListening ---------------------------------------

function stopListening ()
{
  try
  {
    if (canListen)
      listener.stop ();
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- populateVoiceList -----------------------------------

function populateVoiceList ()
{
  try
  {
    if (canSpeak)
    {
      const voiceSelect = document.getElementById ("voiceList");
      voiceSelect.innerText = null;

      voices = speaker.getVoices ();

      for (const voice of voices)
      {
        const option = document.createElement ("option");
        option.textContent = `${voice.name} (${voice.lang})`;

        if (voice.default)
          option.textContent += " — DEFAULT";

        option.setAttribute ("data-lang", voice.lang);
        option.setAttribute ("data-name", voice.name);

        voiceSelect.appendChild (option);
      }
    }
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- speakIt ---------------------------------------------

function speakIt (textInput)
{
  try
  {
    const text = textInput.value;

    if (canSpeak && text.length > 0)
    {
      addToLog ('speaking: ' + text);

      const utterance     = new SpeechSynthesisUtterance (text);
      const selectedIndex = document.getElementById ("voiceList").selectedIndex;

      utterance.voice = voices[selectedIndex];                    // use selected voice
      utterance.pitch = document.getElementById ("pitch").value;  // pitch is a floating point number from 0.0 to  2.0, 1.0 = default
      utterance.rate  = document.getElementById ("rate" ).value;  // rate  is a floating point number from 0.1 to 10.0, 1.0 = default

      // // Stop listening while speaking
      // stopListening ();

      speaker.speak (utterance);

      // startListening ();
    }
  }
  catch (ex)
  {
    alert (ex);
  }
}

//--- addToLog --------------------------------------------

function addToLog (htmlMessage)
{
  try
  {
    dataWindow.innerHTML += htmlMessage + '<br>';
    dataWindow.scrollTop = Number.MAX_SAFE_INTEGER;
  }
  catch (ex)
  {
    alert (ex);
  }
}
