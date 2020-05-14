const fs = require('fs');
const path = require('path');
const {ipcRenderer} = require('electron');

function createSpreadsheet(){
    let table = document.getElementById("studentList");
    let debug_list = readDebugList();

    refreshList(debug_list);
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

function refreshList(nameList){
    let table = document.getElementById("studentList");

    for (let i = 0; i < nameList.length; i++){
        let row = createRow(
            nameList[i].fName,
            nameList[i].lName,
            nameList[i].allergies
        );
        table.appendChild(row);
    }

    assignRowIds();
}

function createRow(fName = "", lName = "", info = ""){
    let newRow = document.createElement("tr");
    let fNameCell = newRow.insertCell(0);
    let fNameInp = document.createElement("input");
    let lNameCell = newRow.insertCell(1);
    let lNameInp = document.createElement("input");
    let infoCell = newRow.insertCell(2);
    let infoInp = document.createElement("input");
    let deleteCell = newRow.insertCell(3);

    fNameInp.value = fName;
    lNameInp.value = lName;
    infoInp.value = info;
    deleteCell.innerHTML = "X";

    fNameCell.className = "nameField";
    lNameCell.className = "nameField";
    deleteCell.className = "delete_cell";

    deleteCell.addEventListener("click", deleteRow);

    fNameCell.appendChild(fNameInp)
    lNameCell.appendChild(lNameInp);
    infoCell.appendChild(infoInp);

    return newRow;
}

function assignRowIds(){
    let table = document.getElementById("studentList");

    for (let i = 0; i < table.rows.length; i++){
        table.rows[i].setAttribute("rowID", i);
    }
}

function insertRow(event){
    let table = document.getElementById("studentList");
    table.appendChild(createRow());
    assignRowIds();
}

function deleteRow(event){
    let row = event.path[1]
    let rowID = row.getAttribute("rowID");
    document.getElementById("studentList").deleteRow(rowID);
    assignRowIds();
}

ipcRenderer.on('new_roster_opened', (event, data) => {
    let list = JSON.parse(data);
    refreshList(list);
})