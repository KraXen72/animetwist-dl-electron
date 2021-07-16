const utils = require('./node_modules/roseboxlib/utils.js')

const electron = require('electron').remote,
dialog = electron.dialog

//import sources
//TODO go through all files in sources dir and import them
const twist = require('./sources/twist.source.js')

//object which has all sources' files' functions in it
let sourceHandler = {}

//assign functions to sourcehandler
sourceHandler.twist = twist

console.log(sourceHandler);

initSources()
function main() { //rest of the stuff
    console.log("done")
}


//initialize sources
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