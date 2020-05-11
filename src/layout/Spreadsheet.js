const fs = require('fs');
const path = require('path');

function createSpreadsheet(){
    let div = document.getElementById("studentList");
    let debug_list = readDebugList();

    for (let i = 0; i < debug_list.length; i++){
        let newRow = div.insertRow(i + 1);
        let fName = newRow.insertCell(0);
        let lName = newRow.insertCell(1);
        let info = newRow.insertCell(2);

        fName.innerHTML = debug_list[i].fName;
        lName.innerHTML = debug_list[i].lName;
        info.innerHTML = debug_list[i].allergies;

        fName.addEventListener('click', selectBox);
        lName.addEventListener('click', selectBox);
        info.addEventListener('click', selectBox);
    }
}

function readDebugList(){
    let output = {};

    output = JSON.parse(fs.readFileSync("./src/layout/debugList.json", (err, data) => {
        if (err){
            console.log(err);
            return;
        }
    }))

    return output;
}

function selectBox(event){
    if (!this.isSelected){
        let contents = this.innerHTML;
        let textBox = document.createElement("input")
        textBox.value = contents;

        this.innerHTML = "";
        this.appendChild(textBox);
        this.isSelected = true;
    }
}