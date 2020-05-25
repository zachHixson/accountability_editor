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

ipcRenderer.on('update-list-count', (event, data) => {
    listCount = data;
    console.log(listCount);
})