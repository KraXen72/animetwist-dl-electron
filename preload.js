const utils = require('./node_modules/roseboxlib/utils.js')

const electron = require('electron').remote,
dialog = electron.dialog

//new name is Silencer

//import sources
//TODO go through all files in sources dir and import them
const twist = require('./sources/twist.source.js')

//object which has all sources' files' functions in it
let sourceHandler = {}

//assign functions to sourcehandler
sourceHandler.twist = twist

console.log(sourceHandler);

//initSources()
function main() { //rest of the stuff
    console.log("sources loaded done")
}

//UI ONLY eventlisteners
document.addEventListener('DOMContentLoaded', () => {
    //ui stuff
    document.getElementById('dl-dlProgressToggle').addEventListener("click", toggleDoneVisibility)
})

//TODO finish dummy frontend full first
//TODO search icon


//initialize sources
//TODO handle fail notifying in twists file
async function initSources() {
    var fetched = await sourceHandler.twist.init();
    if (fetched == false) {
        let opt = {
            message: "failed to fetch anime from twist. reload app?",
            buttons: ["reload", "cancel"],
            noLink: true
        }
        let rel = dialog.showMessageBoxSync(opt)
        if (rel == 0) {
            window.location.reload()
        }
    }
    console.log(fetched);
    main()
}

//Ui related stuff
/**
 * set up toggle for show/hide completed downloads
 */
function toggleDoneVisibility() {
    let toggle = document.getElementById('dl-dlProgressToggle')
    let scroller = document.getElementById('dl-scroller')

    if (toggle.classList.contains('dl-hidden')) {
        toggle.classList.remove('dl-hidden')
        toggle.classList.add('dl-shown')

        scroller.classList.remove('dl-scroller-hideCompleted')
    } else {
        toggle.classList.add('dl-hidden')
        toggle.classList.remove('dl-shown')

        scroller.classList.add('dl-scroller-hideCompleted')
    }

}