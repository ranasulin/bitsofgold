'use strict';

const conf = require('../../configurations/conf');
const request = require('request');
const a = 97;
const z = 122;
const AVG_WORD_LEN= 6;
const MIN_SCORE= 6;
const Combinatorics = require('js-combinatorics');
const AsciiEnglishLetters = cretaeAllEnglishLettersArray();

function legalChar (char){
    let legal = true;

    // non printable letters
    if (char < 32 && char > 126){
        legal = false;
    } else if (char >= 35 && char <= 38){ // #,S,%
        legal = false;
    } else if (char === 42 || char === 43 || char === 64 || char === 124 || char === 126) { // *, +, $, |, ~
        legal = false;
    } else if (char >= 60 && char <= 62) { // <, =, >
        legal = false;
    }
    else if (char >= 94 && char <= 96) { // ^, _, `
        legal = false;
    }

    return legal;
}

function spaceCheck(stats){
    const spaces = stats.letters[' '] ? stats.letters[' '] : 0;
    const aproxSpaceCount = stats.sum / AVG_WORD_LEN;
    const aproxSpaceCountDeviation = aproxSpaceCount - (aproxSpaceCount * 30 )/100;

    if (spaces < aproxSpaceCountDeviation) {
        return 0;
    }

    // Give extra weight for correct space range (the letters check score is <= 26)
    return 6;
}

function extractEnglishLettersArray(letters) {
    const keys =  Object.keys(letters);
    let arr = [];
    for (let i = 0; i< keys.length; i++){
        if (keys[i].match(/[a-z]/i)) {
            arr.push(letters[keys[i]]);
        }
    }

    return arr;
}

function letterCheck(letters) {
    const lettersArr = extractEnglishLettersArray(letters);
    const descendingArr = lettersArr.sort((a, b) => parseInt(b.value) - parseInt(a.value));
    const realFrequencyLetters = conf.letters_freq;
    let result = 0;

    for (let i = 0;  i < descendingArr.length; i++) {
        if (realFrequencyLetters[i] === descendingArr[i].char) {
            result++;
        }
    }

    return result;
}

function calculateScore(stats){
    let spaceCheckResult = spaceCheck(stats),
        letterCheckResult = letterCheck(stats.letters);

    return spaceCheckResult + letterCheckResult;
}

function isEnglishLetterOrPunctuation(char) {
    return !!(isEnglishLetter(char) || char.match("[,\.!\?\(\)\";:-]"));
}

function isValidFirstLetter(char){
    return !!(isEnglishLetter(char) || char.match("[\(]"));
}

function isValidLastLetter(char){
    return !!(isEnglishLetter(char) || char.match("[,\.!\?\)\";:-]"));
}


function isEnglishLetter(char) {
    return !!char.match(/[a-z]/i);
}

function isWordOnlyDigits(word) {
    return !!word.match(/[0-9]/);
}

function legalWord(word) {
    let result = true, c;

    if (isWordOnlyDigits(word)){
        return true;
    }

    for (let i = 0; i < word.length; i++) {
         c = word[i];

         switch (i){
             case 0:
                 // The only first char that can be valid is ( or letter
                 result = isValidFirstLetter(c);
                 break;
                 // The last char can be , . : ; ? ! or a letter
             case word.length -1:
                 result = isValidLastLetter(c);
                 break;
             case word.length -2:
                 // The one before last letter can be ' or letter
                 result = isEnglishLetter(c) || c === '\'';
                 break;
             default:
                 result = isEnglishLetter(c);
         }

        /*if (i === word.length -1 || i === 0 ) {
            result = isEnglishLetterOrPunctuation(c);
        }
        else if (i === word.length -2 ) {
            result = isEnglishLetterOrPunctuation(c) || c == '\'';
        } else {
            result = isEnglishLetter(c);
        }*/

        if (!result) {
            return result;
        }
    }

    return result;

}

function calculateStats(combinationInfo){
    let forbiddenCombo =
        ['cj', 'fq', 'gx', 'hx', 'jf', 'jq', 'jx', 'jz', 'qb', 'qc', 'qj', 'qk', 'qx', 'qz', 'sx', 'vf', 'vj', 'vq', 'vx', 'wx', 'xj', 'zx'];

    let charCode, stats = {
        sum: combinationInfo.textCodes.length,
        legal: true,
        letters: {}
    }, char, decryptedData = combinationInfo.decryptedData, lastWordLen = 0, lastWord ='';


    // This letters combinations never occur in english words
    if (new RegExp(forbiddenCombo.join("|")).test(combinationInfo.decryptedData)) {
        stats.legal = false;
        return stats;
    } else {
        // Go over all the chars and check for non-printable  and illegal chars
        for (let index =0; index < combinationInfo.textCodes.length; index++){
            charCode = combinationInfo.textCodes[index];
            char = String.fromCharCode(charCode).toLowerCase();

            if (!stats.letters[char]){
                stats.letters[char] = {value: 0, char}
            }

            //space is the end of a word
            if (char === ' ') {

                if (!legalWord(lastWord) && lastWord.length > 1){
                    stats.legal = false;
                    return stats;
                }

                lastWordLen = 0;
                lastWord = '';
            } else {
                lastWord += char;
            }

            lastWordLen++;
            stats.letters[char].value++;

            if (!legalChar(charCode)){
                stats.legal = false;
                return stats;
            }
        }
    }

    return stats;
}

function xor_decrypt(encrypted_text, key){
    let decryptedData = [], xorResult, decryptedChar, codes = [];

    for (let wordIndex= 0; wordIndex < encrypted_text.length; wordIndex++){
        xorResult = encrypted_text[wordIndex] ^ key[wordIndex % key.length];
        decryptedChar = String.fromCharCode(xorResult);
        decryptedData.push(decryptedChar);
        codes.push(xorResult);
    }

    return {decryptedData: decryptedData.join(''), textCodes: codes};
}

function convertArrayToString(numArray){
    let translatedString = [], char;

    for (let index= 0; index < numArray.length; index++){
        char = numArray[index];
        translatedString.push(String.fromCharCode(char));
    }

    return translatedString.join('');
}

function tryAllKeysInRange(range, text, keySize, masterAddress){
      let allCombinations = Combinatorics.baseN(AsciiEnglishLetters, keySize - 1),
            key = [], combinationInfo, combinationResults = [], stats;

    let i =0;
    for (let firstCharIndex = +range.start; firstCharIndex <= +range.end; firstCharIndex++) {
        allCombinations.forEach(keyOption => {
            key[0] = firstCharIndex;
            key = key.concat(keyOption);

            if( i % 10000 === 0) {
                console.log('working', key)
            }
            // key = [111 ,120 ,115 ,101 ,99 ];
            // key = [103, 111, 100];
            combinationInfo = xor_decrypt(text, key);
            combinationInfo.key = key;
            stats = calculateStats(combinationInfo);

            if (stats.legal) {
                combinationInfo.score = calculateScore(stats);
                combinationInfo.key = convertArrayToString(key);

                if (combinationInfo.score > MIN_SCORE){
                    console.log(`key = ${key.join(", ")} ||| text = ${text}`);
                    combinationResults.push(combinationInfo);

                    sendEncryptedOption(combinationInfo, masterAddress);
                }
            }

            key = [];
            i++;
        });
    }

    return combinationResults;
}

function tryAllKeys (text, keySize){
    return tryAllKeysInRange({start: a, end: z}, text, keySize);
}

function cretaeAllEnglishLettersArray(){
    let letters = [];
    for (let index = a; index <= z; index ++){
        letters.push(index);
    }

    return letters;
}

function encryptData (text, key){
    let encryption = [], currentLetter, keyLetter;

    for (let index = 0; index < text.length; index++){

        currentLetter = (text[index]).charCodeAt(0);
        keyLetter = (key[index%key.length]).charCodeAt(0);

        encryption.push(currentLetter ^ keyLetter);
    }
}

function guess_key(range, encryptedMessage, keySize, masterAddress) {
    let textLetters = encryptedMessage.split(',');

    return tryAllKeysInRange(range, textLetters, keySize, masterAddress);
}

function sendEncryptedOption(decryptionResults, masterAddress){
    request({
        timeout: 1200000,
        method: 'POST',
        uri:     masterAddress,
        body:    decryptionResults,
        json: true
    }, function(error, response, body){
        // console.log(body);
    });
}

module.exports = {
    executeOnSlave: function(req){
        console.log("slave");
        const start = req.params.start;
        const end = req.params.end;
        const answerUrl = req.body.answerUrl;
        const decryptionResults = guess_key({start,end},req.body.text, req.body.keySize, req.body.answerUrl);

        console.log("done processing");

        // If there are no results for this slave - notify
        if (!decryptionResults.length){
            sendEncryptedOption(decryptionResults, answerUrl);
        }

        return decryptionResults;


    }
};

