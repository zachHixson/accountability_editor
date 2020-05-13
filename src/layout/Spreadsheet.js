const fs = require('fs');
const path = require('path');

function createSpreadsheet(){
    let div = document.getElementById("studentList");
    let debug_list = readDebugList();

    for (let i = 0; i < debug_list.length; i++){
        let newRow = div.insertRow(i + 1);
        let fNameCell = newRow.insertCell(0);
        let fName = document.createElement("input");
        let lNameCell = newRow.insertCell(1);
        let lName = document.createElement("input");
        let infoCell = newRow.insertCell(2);
        let info = document.createElement("input");

        fName.value = debug_list[i].fName;
        lName.value = debug_list[i].lName;
        info.value = debug_list[i].allergies;

        fNameCell.className = "nameField";
        lNameCell.className = "nameField";

        fNameCell.appendChild(fName)
        lNameCell.appendChild(lName);
        infoCell.appendChild(info);
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