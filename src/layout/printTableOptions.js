const iro = require('@jaames/iro');
const {ipcRenderer} = require('electron');

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

ipcRenderer.on('update-list-count', (event, numStudents) => {
    let rows = parseInt(document.getElementById('rows').value);
    let cols = parseInt(document.getElementById('cols').value);
    let neededRows = Math.ceil(numStudents / cols);
    document.getElementById('rows').value = neededRows;
    listCount = numStudents;
})