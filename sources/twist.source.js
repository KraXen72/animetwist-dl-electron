const 
    electron = require('electron').remote,
    dialog = electron.dialog,
    YoutubeDlWrap = require("youtube-dl-wrap"),
    crypto = require('crypto-js'),
    aes = require('crypto-js/aes'),
    util = require('util'),
    exec = util.promisify(require('child_process').exec),
    os = require('os')

//constants
//TODO add aircdn url
const 
    baseUrl = 'https://twist.moe',
    cdnUrl = "https://cdn.twist.moe",
    aesKey = '267041df55ca2b36f2e322d05ee2c9cf',
    accessToken = '0df14814b9e590a1f26d3071a4ed7974',
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'

var 
    allAnime = {},
    downloadQueue = [],
    currentSlug = "",
    youtubeDlWrap,
    //elements
    genButton,
    searchElem,
    yugenurl

//inital get Anime
async function init() {

    let isDone = false;
    let retryCount = 0;
    let timeout
    while (!isDone && retryCount < 20) { //20 tries
        try {
          retryCount++;
          timeout = setTimeout(() => {throw "5 second timeout"}, 5000) //retry in 5 seconds
          allAnime = await getJSON('/api/anime') //request
          isDone = true;
        } catch (e) {
            clearTimeout(timeout)
            console.log(`failed (${retryCount}), retrying. reason:`, e);
        }
    }
    clearTimeout(timeout)
    console.log("twist: allAnime", allAnime)
    return isDone
}

function fetchAnime(index) {
    return allAnime[index]
}

//helper functions from twist-dl. credits to them: https://github.com/vignedev/twist-dl or npm install twist-dl

function decryptSource(source){
    return aes.decrypt(source, aesKey).toString(crypto.enc.Utf8).trim()
}

function getJSON(endpoint){ //intereact with the twist.moe api
    return new Promise((resolve,reject) => {
        fetch(baseUrl + endpoint, {
            headers: { 'x-access-token': accessToken, 'user-agent': userAgent }
        }).then(res => {
            if(!res.ok) return reject(`Server responded with ${res.status} (${res.statusText})`)
            return res.json()
        }).then(resolve).catch(reject)
    })
}




module.exports = { init }