const iro = require('@jaames/iro');
const {ipcRenderer, dialog} = require('electron');
const remote = require('electron').remote;

let listCount = 0;

let colorWheel = new iro.ColorPicker("#colorPicker", {
    layout: [
        {
            component: iro.ui.Wheel
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderStyle: 'value'
            }
        }
    ],
    width: 150
});

function printTable(){
    let outObj = {
        title : document.getElementById('title').value,
        rows : document.getElementById('rows').value,
        cols : document.getElementById('cols').value,
        sortby : document.getElementById('lName').checked ? 'last' : 'first',
        color : colorWheel.color.hexString
    }
    ipcRenderer.send('print-table', outObj);
    closeWindow();
}

function closeWindow(){
    let window = remote.getCurrentWindow();
    window.close();
}

function fixCols(){
    let rows = parseInt(document.getElementById('rows').value);
    let cols = parseInt(document.getElementById('cols').value);

    if (rows * cols < listCount){
        let neededCols = Math.ceil(listCount / rows);
        document.getElementById('cols').value = neededCols;
    }
}

function fixRows(){
    let rows = parseInt(document.getElementById('rows').value);
    let cols = parseInt(document.getElementById('cols').value);

    if (rows * cols < listCount){
        let neededRows = Math.ceil(listCount / cols);
        document.getElementById('rows').value = neededRows;
    }
}

ipcRenderer.on('update-list-count', (event, numStudents) => {
    fixRows();
    listCount = numStudents;
})