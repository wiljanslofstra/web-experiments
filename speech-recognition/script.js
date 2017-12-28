
const SpeechRecognitionInstance = typeof SpeechRecognition !== 'undefined' ? SpeechRecognition : webkitSpeechRecognition;
const SpeechGrammarListInstance = typeof SpeechGrammarList !== 'undefined' ? SpeechGrammarList : webkitSpeechGrammarList;
const SpeechRecognitionEventInstance = typeof SpeechRecognitionEvent !== 'undefined' ? SpeechRecognitionEvent : webkitSpeechRecognitionEvent;

// Add grammar list, although I've no idea if it does anything
const grammar = '#JSGF V1.0 utf-8 en; grammar name; public <bitcoin> = bitcoin; public <ethereum> = ethereum; public <cryptos> = (<bitcoin> | <ethereum>); public <crypto_cap> = <cryptos> cap; public <crypto_value> = <cryptos> (worth | value | price); public <greeting> = (hello | hey | sup); public <hello_world> = <greeting> world;'

// Create speech recognizer
const recognition = new SpeechRecognitionInstance();

// Create Grammar list
const speechRecognitionList = new SpeechGrammarListInstance();

// Add grammar to the list
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;

// Controls wether continuous results are returned or only a single recognition
recognition.continuous = false;

// Set the language
recognition.lang = 'en-US';

// Return non-finished results
recognition.interimResults = false;

// Maximum number of alternatives returned for a result
recognition.maxAlternatives = 1;

// Output text
const diagnostic = document.querySelector('.output');

// Button that handles the starting and stopping of speech recognition
const listenButton = document.getElementById('listen');

// Keeps track of the recognition state
let isStarted = false;

// Start speech recognition
listenButton.onclick = () => {
    // Abort or start recognition
    recognition[isStarted ? 'abort' : 'start']();
    
    // Switch button text
    listenButton.textContent = isStarted ? 'Start listening' : 'Stop listening';

    // Switch button color
    listenButton.classList.toggle('btn-success', isStarted);
    listenButton.classList.toggle('btn-danger', !isStarted);

    // Keep track of the recognition state
    isStarted = !isStarted;
};

/**
 * Display text in the DOM
 * @param {String} txt 
 * @return {Void}
 */
function display(txt) {
    diagnostic.textContent = txt;
}

/**
 * Handle the text from the speech recognizer
 * @param {String} text 
 * @return {Void}
 */
function handleResult(text) {
    const simplified = text.trim().toLowerCase();

    // Get the Bitcoin price
    if (simplified.indexOf('bitcoin') >= 0) {
        fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json')
            .then(res => res.json())
            .then((json) => {
                if (typeof json.bpi !== 'undefined' && typeof json.bpi.USD !== 'undefined') {
                    display(`${json.bpi.USD.code} ${json.bpi.USD.rate}`);
                }
            });
    
    // Get the Ethereum price
    } else if (simplified.indexOf('ethereum') >= 0) {
        fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&extraParams=speech_recognition')
            .then(res => res.json())
            .then((json) => {
                if (typeof json.USD !== 'undefined') {
                    display(`USD ${json.USD}`);
                }
            });
    
    // Handle hello messages :)
    } else if (simplified.indexOf('hello') >= 0) {
        display('Hello! ✋');
    } else {
        display('Don\'t know what you\'re trying to tell me, please try again');
    }
}

// Handle onresult events
recognition.onresult = (event) => {
    // Get the last available result
    const lastResult = event.results[event.results.length - 1];

    // Get the text from the first alternative in the last result
    const text = lastResult[0].transcript;
    
    // Handle the text
    handleResult(text);
};

