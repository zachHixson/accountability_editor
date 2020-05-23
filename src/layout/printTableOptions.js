const iro = require('@jaames/iro');

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
})