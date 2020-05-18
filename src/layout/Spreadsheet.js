const fs = require('fs');
const path = require('path');
const remote = require('electron').remote;
const {ipcRenderer} = require('electron');
const app = remote.app;

const START_ROW = 2;

let tempPath = path.join(app.getPath("appData"), "accountability_editor/tempSave.json");

class Student {
    constructor(fName = '', lName = '', allergies = ''){
        this.fName = fName;
        this.lName = lName;
        this.allergies = allergies;
    }
}

function createSpreadsheet(){
    let table = document.getElementById("studentList");
    readTempList()
}

function readTempList(){
    fs.readFile(tempPath, 'utf8', (err, data) => {
        if (err){
            console.log(err);
            return;
        }

        refreshList(JSON.parse(data));
    })
}

function refreshList(nameList){
    let table = document.getElementById("studentList");

    while (table.rows.length > START_ROW){
        table.deleteRow(START_ROW);
    }

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

    for (let i = START_ROW; i < table.rows.length; i++){
        table.rows[i].setAttribute("rowID", i);
    }
}

function insertRow(event){
    let table = document.getElementById("studentList");
    table.appendChild(createRow());
    assignRowIds();
    saveTemp();
}

function deleteRow(event){
    let row = event.path[1]
    let rowID = row.getAttribute("rowID");
    document.getElementById("studentList").deleteRow(rowID);
    assignRowIds();
    saveTemp();
}

function getTableData(){
    let table = document.getElementById("studentList");
    let students = [];

    for (let i = START_ROW; i < table.rows.length; i++){
        let childNodes = table.rows[i].childNodes;
        students.push(new Student(
            childNodes[0].firstChild.value,
            childNodes[1].firstChild.value,
            childNodes[2].firstChild.value
        ));
    }

    return students;
}

function saveTemp(){
    let data = getTableData();

    fs.writeFile(tempPath, JSON.stringify(data), (err) => {
        if (err){
            console.log(err);
            return;
        }
    })
}

ipcRenderer.on('new_roster_opened', (event, data) => {
    let list = JSON.parse(data);
    refreshList(list);
    saveTemp();
});

function sortByFirst(elem){
    sort(elem, (a, b) => {
        aFname = a.fName.toUpperCase();
        bFname = b.fName.toUpperCase();
        aLname = a.lName.toUpperCase();
        bLname = b.lName.toUpperCase();

        if (aFname < bFname){
            return -1;
        }
        else if (aFname > bFname){
            return 1;
        }
        else{
            if (aLname < bLname){
                return -1;
            }
            else if (aLname > bLname){
                return 1;
            }
            else{
                return 0;
            }
        }
    });
}

function sortByLast(elem){
    sort(elem, (a, b) => {
        aFname = a.fName.toUpperCase();
        bFname = b.fName.toUpperCase();
        aLname = a.lName.toUpperCase();
        bLname = b.lName.toUpperCase();

        if (aLname < bLname){
            return -1;
        }
        else if (aLname > bLname){
            return 1;
        }
        else{
            if (aFname < bFname){
                return -1;
            }
            else if (aFname > bFname){
                return 1;
            }
            else{
                return 0;
            }
        }
    });
}

function sort(elem, conditionFunc){
    let curIndicator = elem.getElementsByClassName("sortIndicator")[0];
    let curSortDirection = curIndicator.getAttribute("sortOrder");
    let sortIndicators = document.getElementsByClassName("sortIndicator");
    let list = getTableData();
    list.sort(conditionFunc);

    //set all sort indicators
    for (let i = 0; i < sortIndicators.length; i++){
        sortIndicators[i].innerHTML = '';
        sortIndicators[i].setAttribute("sortOrder", "");
    }

    if (curSortDirection === "desc"){
        curIndicator.innerHTML = "⯅";
        curIndicator.setAttribute("sortOrder", "asc");
        list.reverse();
    }
    else{
        curIndicator.innerHTML = "⯆";
        curIndicator.setAttribute("sortOrder", "desc");
    }

    refreshList(list);
}