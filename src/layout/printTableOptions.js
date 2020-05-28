const iro = require('@jaames/iro');
const {ipcRenderer} = require('electron');
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

ipcRenderer.on('update-list-count', (event, numStudents) => {
    let rows = parseInt(document.getElementById('rows').value);
    let cols = parseInt(document.getElementById('cols').value);
    let neededRows = Math.ceil(numStudents / cols);
    document.getElementById('rows').value = neededRows;
    listCount = numStudents;
})