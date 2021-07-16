//imports
const 
    electron = require('electron').remote,
    dialog = electron.dialog,
    YoutubeDlWrap = require("youtube-dl-wrap"),
    crypto = require('crypto-js'),
    aes = require('crypto-js/aes'),
    util = require('util'),
    exec = util.promisify(require('child_process').exec),
    os = require('os')

//defining of varialbes
var 
    allAnime = {},
    downloadQueue = [],
    currentSlug = "",
    youtubeDlWrap,
    //elements
    genButton,
    searchElem,
    yugenurl

//constants
const
    baseUrl = 'https://twist.moe',
    cdnUrl = "https://cdn.twist.moe",
    aesKey = '267041df55ca2b36f2e322d05ee2c9cf',
    accessToken = '0df14814b9e590a1f26d3071a4ed7974',
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'

var keys = {
  ESC: 27,
  TAB: 9,
  RETURN: 13,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

youtubeDlWrap = new YoutubeDlWrap();
window.addEventListener('DOMContentLoaded', () => {
  (async () => {
    console.log("loaded")

    //search
    searchElem = document.getElementById('search')
    searchElem.addEventListener('input', displayMatches);

    searchElem.addEventListener('keydown', (event) => {
      doKeypress(keys, event)
    })
    
    //when search in english checkbox is checked or unchecked, suggestions will be reset
    document.getElementById("langselect").addEventListener("change", () => {
      document.getElementById('suggestions-ul').innerHTML = ""
      searchElem.value = ""
    })

    //yugenanime stuff
    //checkbox
    /*document.getElementById("yugenselect").addEventListener("change", () => {
      let check = document.getElementById("yugenselect")
      let yugenwrap = document.getElementById("yugen-wrapper")
      if (check.checked) {
        yugenwrap.style.display="block"
      } else {
        yugenwrap.style.display="none"
      }
    })*/
    //search
    /*
    document.getElementById("yugensearch").addEventListener("click", async () => {
      let inpval = document.getElementById("search").value
      let query = inpval.replaceAll(" ", "+")
      let url = `https://yugenani.me/search/?q=${query}`
      let response = await fetch(url)
      let html = await response.text()
      let searchdom = new DOMParser().parseFromString(html, "text/html")
      let resultshtml = searchdom.querySelectorAll(".anime-meta")
      let results = []
      resultshtml.forEach(result => {
        let url = result.href.toString().split("/anime/")

        let parsediv = new DOMParser().parseFromString(result.innerHTML, "text/html").body.firstElementChild.querySelector("img")
        //console.log(parsediv)
        let img = parsediv.getAttribute("data-src")
        let title = parsediv["title"]
        let alt = parsediv["alt"]

        let item = {
          title: title,
          img: img,
          alt: alt,
          url: "https://yugenani.me/anime/" + url[1]
        }
        results.push(item)
      })
      document.getElementById("yugen-results-num").innerText = `Searched yugenani.me: ${results.length} results found for '${shortenFilename(inpval, 19)}'.`
      if (results.length > 0){document.getElementById("pickresult").style.display = "inline-block";}
      console.log(results)

      let pick = document.getElementById("pickresult")
      pick.replaceWith(pick.cloneNode(true));
      pick = document.getElementById("pickresult")
      pick.addEventListener("click", () => {displayYugenResults(results)})
    })
    document.getElementById("yugen-whats-this").addEventListener("click", () => {
      let text = "in the event of some episode not being available on twist.moe, this will try to download them from yugenanime" + "\n" + 
      `this only works as long as select your anime also on yugenani.me and the missing episode is available on yugenani.me`
      alert(text)
    })
    */
    //generate links button
    genButton = document.getElementById('gen')
    genButton.addEventListener('click',() => {
      let animename = searchElem.value
      if (currentSlug != "") {
        let fromep = document.getElementById("first-ep").value
        let toep = document.getElementById("last-ep").value

        //let yugencheck = document.getElementById('yugenselect')

        console.log(`animename: ${animename}, fromep: ${fromep}, toep: ${toep}`)
        generateAndDownload(currentSlug, fromep, toep)

      } else {
        console.log("can't generate, no anime selected.")
      }
    })

    //select folder
    document.getElementById('path').addEventListener('click', async () => {
      let path = await dialog.showOpenDialog({ properties: ['openDirectory'] })
      let dlpath = document.getElementById('dlpath')
      dlpath.innerHTML = shortenFilename(path.filePaths[0], 55)
      dlpath.setAttribute('path', path.filePaths[0])
    })

    //info
    document.querySelector('.info-button').addEventListener('click', () => {
      let info = `
      twist.moe / AnimeTwist downloader
      Made with electron, cryptojs, youtube-dl-wrap and with the help of twist-dl. 
      Author: KraXen72 (KraXen72#9190)

      css libraries used: 
      matter.css - https://github.com/finnhvman/matter
      w3.css - https://www.w3schools.com/w3css/

      licence: ISC licence

      Disclaimer: 
      THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

      By using this software you agree with the ISC licence and with the above disclaimer.
      `
      alert(info)
    })

    //try to see if youtube is installed
    console.log("testing if youtube-dl is installed")
    let ytdl = await getYoutubeDl()
    console.log(ytdl == true ? "youtube-dl is installed" : "youtube-dl is not installed")
    if (ytdl == false) {
      let platform = os.platform()

      if (platform.includes("win") == false) {
        let notice = document.createElement("div")
        notice.innerHTML = 
        `
        <div class="notice-bg">
          <div class="notice">
            <h1>Non-windows os detected. (<code>${platform}</code>)</h1>
            The internal installation of the <code>youtube-dl</code> package doesen't work reliably on non-windows operating systems. <br>
            Please install <code>youtube-dl</code> through <code>pip</code> using <code>pip install youtube-dl</code> <br>
            (requires python) or any other method so <code>youtube-dl</code> is recognized as a global command.
          </div>
        </div>
        `
        document.body.appendChild(notice)
      } else {
        console.log(`installing youtube-dl for ${platform}...`)
        let variant = platform.includes("win") ? "youtube-dl.exe" : "youtube-dl"
        await YoutubeDlWrap.downloadFromWebsite(variant, platform);
        console.log(`installed ${variant}`)
        window.location.reload() //reload after install
      }
    }

    //get all anime from twist.moe
    getAnime()
  })();
})

//display the results from yugenanime search
function displayYugenResults(results) {
  let notice = document.createElement("div")
  let res = ""
  results.forEach(result => {
    res += `
    <div class="yugen-result" url="${result.url}">
      <div class="yugen-img">
        <a class="yugen-a">
          <img src="${result.img}" draggable="false">
        </a>
      </div>
      <p class="yugen-result-title">${result.title}</p>
    </div>
    
    `
  })
  notice.innerHTML = 
  `
  <div class="notice-bg">
    <div class="notice">
      <h3>Select your your anime on yugenani.me <strong id="yugen-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</strong></h3>
      <div class="yugen-scroller">
        <div class="yugen-results">
        ${res}
        </div>
      </div>
    </div>
  </div>
  `
  document.body.appendChild(notice)

  let as = document.querySelectorAll(".yugen-result").forEach(a => {
    a.addEventListener('click', () => {
      yugenurl = a.getAttribute("url")
      document.getElementById("yugen-url").innerText = "Selected: " + shortenFilename(a.querySelector('p').innerText, 50)
      document.getElementById("yugen-results-num").innerHTML = ""
      document.getElementById('pickresult').style.display = "none";
      document.getElementById("yugen-close").click()
    })
  })
}

//inital get Anime
async function getAnime() {
  //wait 5seconds to get anime, otherwise retry
  let retry = setTimeout(() => {window.location.reload()}, 5000)
  allAnime = await getJSON('/api/anime')
  clearTimeout(retry)
  document.getElementById('wait-msg').remove()
  document.getElementById('search').removeAttribute('disabled')
}

//see if youtube-dl is installed
async function getYoutubeDl() {
  var installed = true
  try {
    const { stdout, stderr } = await exec('youtube-dl --version');
    console.log("youtube-dl version: " + stdout)
  } catch (e) {
    installed = false
  }
  return installed
}

//find matches in an array
function findMatches(wordToMatch, all, lang) {
  let searchTitle = lang == "j" ? "title" : "alt_title"
  return all.filter(name => {
    const regex = RegExp(wordToMatch, 'gi');
    if (name.alt_title == null){name.alt_title = name.title}
    return name[searchTitle].match(regex)
  })
}

//autocomplete: display matches from findmatches()
function displayMatches() {
  //search in english selection
  let checkbox = document.getElementById("langselect")
  const lang = checkbox.checked == true ? "e" : "j"
  let searchTitle = lang == "j" ? "title" : "alt_title"

  var matchArray = findMatches(this.value, allAnime, lang)
  if (this.value == "") {matchArray = [];}

  const html = matchArray.slice(0, 10).map((anime, index) => { //only return first 10 anime
    const regex = new RegExp(this.value, 'gi') //global, case-insensitive
    if (anime.alt_title == null){anime.alt_title = anime.title} //if english isnone, then just use the japanese one
    const query = anime[searchTitle].replace(regex, `<span class="hl">${anime[searchTitle].match(new RegExp(this.value, 'i'))}</span>`) //highlight the part of the word that we searched
    return `<li class="inline-suggestion" anime-index="${allAnime.indexOf(anime)}" mal-id="${anime.mal_id}" kitsu-id="${anime.hb_id}">
      ${query}
    <li/>`
  })
  const suggestUl = document.getElementById('suggestions-ul')
  suggestUl.innerHTML = html.join("")
  document.getElementById("preview-img").setAttribute("src","")

  //handle clicking on search suggestions
  const currSuggestions = document.getElementsByClassName('inline-suggestion')
  for (let i = 0; i < currSuggestions.length; i++) {
    currSuggestions[i].addEventListener("click", async () => {
      var animeObj = allAnime[parseInt(currSuggestions[i].getAttribute("anime-index"))]
      currentSlug = animeObj.slug.slug
      let sourceList = await getJSON(`/api/anime/${currentSlug}/sources`)
      //console.log(sourceList)
      let kitsuid = currSuggestions[i].getAttribute("kitsu-id");
      getThumb(kitsuid, currSuggestions[i])

      let startlabel = document.getElementById("first-ep-label")
      let endlabel = document.getElementById("last-ep-label")
      let startinp = document.getElementById('first-ep')
      let endinp = document.getElementById("last-ep")

      startinp.value = ""
      endinp.value = ""

      startlabel.innerText = `first episode (1-${sourceList.length})`
      endlabel.innerText = `last episode (1-${sourceList.length})`
      
      searchElem.value = currSuggestions[i].innerText
      suggestUl.innerHTML = ""
      /*if (document.getElementById("yugenselect").checked) {
        document.getElementById("yugensearch").click()
      }*/
    })
  }


}

//handle search input keypresses
function doKeypress(keys, event) {
  if (event.which == keys.UP) {
    event.preventDefault();
    moveSelect("up")
  } else if(event.which == keys.DOWN) {
    event.preventDefault();
    moveSelect("down")
  } else if (event.which == keys.RETURN || event.which == keys.TAB) { //tab or enter selects it
    if (document.getElementById('suggestions-ul').innerHTML != "" && event.which == keys.TAB) {
      event.preventDefault();
    }
    if (document.querySelector('.highlight') != null) {
      
      document.querySelector('.highlight').click()
    } //click on the highlighted element
  } else {
    return
  }
}

//move up or down the selection in autocomplete
async function moveSelect(mode) {
  let highlight = document.querySelector('.highlight')
  const currSuggestions = document.getElementsByClassName('inline-suggestion')
  var highlightIndex
  var newIndex

  if (highlight == null) {
    //if nothing is highlitened
    if (mode == "up") {
      highlight = currSuggestions[currSuggestions.length-1]
      highlight.classList.add("highlight")
    } else if (mode == "down") {
      highlight = currSuggestions[0]
      highlight.classList.add("highlight")
    }
    highlightIndex = [...currSuggestions].indexOf(highlight)
    newIndex = [...currSuggestions].indexOf(highlight)
  } else  {
    //move up or down accordingly
    highlightIndex = [...currSuggestions].indexOf(highlight)
    newIndex = mode == "up" ? highlightIndex - 1 : mode == "down" ? highlightIndex + 1 : highlightIndex
    //roll over to the start or end
    if (newIndex < 0){newIndex = currSuggestions.length-1}
    if (newIndex > currSuggestions.length-1){newIndex = 0}
  }
  //add the highlight to the new element and remove it from the old one
  currSuggestions[highlightIndex].classList.remove('highlight')
  currSuggestions[newIndex].classList.add('highlight')

  let cover = currSuggestions[newIndex].getAttribute("cover")

  if (cover == null) {
    let kitsuid = currSuggestions[newIndex].getAttribute("kitsu-id");
    getThumb(kitsuid, currSuggestions[newIndex]);
  } else {
    document.getElementById("preview-img").setAttribute("src",cover)
  }
}

//get the pic of the anime
async function getThumb(id, elem) {
  //use kitsu api to get the anime's thumbnail from myanimelist
  let url = `https://kitsu.io/api/edge/anime/${id}`
  let request = await fetch(url)
  let pics = await request.json()

  let thumb = pics.data.attributes.posterImage.medium

  //console.log(thumb)
  document.getElementById("preview-img").setAttribute("src",thumb)
  elem.setAttribute("cover",thumb) //set the attribute to the image, so next time there is no need to fetch
}

//genereate links 
async function generateAndDownload(slug, from, to) {
  //sanitize from and to
  if (from < 1){from = 1}
  const sourceList = await getJSON(`/api/anime/${slug}/sources`)
  const pickedsources = [...sourceList].slice(from-1, to)

  //if i want 13 eps and there are only 12 total, display downloading x-12 instead of x-13
  if (to > pickedsources[pickedsources.length-1].number){to = pickedsources[pickedsources.length-1].number} 
  const decryptedSources = []

  //decrypt sources
  pickedsources.forEach((item, index, arr) => {
    let source = arr[index].source
    let decrypted = cdnUrl + decryptSource(source).trim().replaceAll('\r', '')

    decryptedSources.push(decrypted)
  })
  console.log(decryptedSources)
  downloadQueue = [...decryptedSources];

  downloadNext(from, to) //work through downloadQueue
}  

async function downloadNext(from, to) {
  if (downloadQueue.length > 0) {
    let currentlink = downloadQueue[0]

    let search = document.getElementById('search')
    let name = search.value.length > 26 ? search.value.slice(0, 27) + "..." : search.value //name for the download box

    //show downloading wrapper
    document.querySelector('.dl-wrapper').style.visibility = "visible" 
    document.querySelector('.dl-range').innerText = from + "-" + to
    document.querySelector('.dl-animename').innerText = name
    document.getElementById("progress-progress").value = 0

    linkParts = currentlink.split("/")
    let folder = document.getElementById('dlpath').innerHTML == "No folder selected" ? "" : document.getElementById('dlpath').getAttribute('path')
    let filename = folder != "" ? folder + "\\" + linkParts[linkParts.length-1] : linkParts[linkParts.length-1] //concat the linkParts to make a filename

    let elipfilename = shortenFilename(filename, 65) //shorten filename to max 70 characters
    console.log(filename)

    document.getElementById('dl-filename').innerHTML = elipfilename
    downloadEpisode(currentlink, filename, from, to) //plug in correct filename - from and to is passed so downloadNext can be called
  } else {
    console.log("all downloads completed.")
    allDownloadsCompleted()
  }
  
}

//download an episode
async function downloadEpisode(link, dest, from, to) {
  console.log("started downloading " + link + " to: " + dest)
  let youtubeDlEmitter = youtubeDlWrap.exec([link,
    "--referer", "https://twist.moe", "-o", `${dest}`, "--retries", "infinite", "--fragment-retries", "infinite"]) //implement output
  .on("progress", (progress) => {
    //console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
    let perc = progress.percent

    document.getElementById("percentage").innerText = `${perc}%`
    document.getElementById("progress-progress").value = perc
  })
  //.on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
  .on("error", (error) => {
    let handle = document.getElementById("errorhandling")
    handle.style.display = "initial";
    console.error(error)
  })
  .on("close", () => {
    document.getElementById("percentage").innerText = `100%`
    document.getElementById("progress-progress").value = 100
    console.log("all done")

    let curr = downloadQueue.indexOf(link)
    downloadQueue.splice(curr, 1)

    document.getElementById("eps-done").innerHTML = parseInt(document.getElementById("eps-done").innerHTML) + 1

    //update the ep counter
    downloadNext(from, to)
  });
}

//shorten preview file name to fit in the downlaod list
function shortenFilename(str, len) {
  if (str.length > len) {
    let halfsize = Math.floor(len/2)-1 //the final size for each half
    let firsthalf = str.slice(0, (str.length/2)+1)
    let secondhalf = str.slice((str.length/2), str.length)

    //trim first half
    if (firsthalf.length > halfsize) { firsthalf = firsthalf.slice(0, halfsize)}
    //trim second half
    if (secondhalf.length > halfsize) {secondhalf = secondhalf.slice(secondhalf.length-halfsize, secondhalf.length+1)}

    return firsthalf+"..."+secondhalf
  } else {return str}
}

//what to do when all downloads are completed
function allDownloadsCompleted() {
  document.querySelector('.dl-info').innerHTML = `<span class="hl">All downloads completed.</span>`
  document.querySelector('#dltofolder .hl').innerText = `Downloaded to: `
  if (document.getElementById("dlpath").innerText == "No folder selected"){document.getElementById("dlpath").innerText = "This folder"}
  document.querySelector('.dl-item').style.display = "none";
  document.getElementById('search').addEventListener('click',() => {
    window.location.reload()
  })
}

//functions from twist-dl. credits to them: https://github.com/vignedev/twist-dl or npm install twist-dl

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