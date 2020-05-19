const fs = require('fs');
const path = require('path');
const remote = require('electron').remote;
const {ipcRenderer} = require('electron');
const app = remote.app;

const START_ROW = 2;

let tempPath = path.join(app.getPath("appData"), "accountability_editor/tempSave.json");
let studentList = [];

class Student {
    constructor(fName = '', lName = '', info = '', id = 0){
        this.fName = fName;
        this.lName = lName;
        this.info = info;
        this.id = id;
    }

    getOutput(){
        return {
            fName : this.fName,
            lName : this.lName,
            allergies: this.info
        }
    }
}

function createSpreadsheet(){
    readTempList()
}

function readTempList(){
    fs.readFile(tempPath, 'utf8', (err, data) => {
        if (err){
            console.log(err);
            return;
        }

        loadJsonList(data)
        refreshList(studentList);
    })
}

function loadJsonList(json){
    let inputList = JSON.parse(json);
    studentList = [];

    for (let i = 0; i < inputList.length; i++){
        studentList.push(new Student(
            inputList[i].fName,
            inputList[i].lName,
            inputList[i].allergies,
            i
        ));
    }
}

function listOutput(){
    let outList = [];

    for (let i = 0; i < studentList.length; i++){
        outList.push(studentList[i].getOutput());
    }

    return JSON.stringify(outList);
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
            nameList[i].info,
            nameList[i].id
        );
        table.appendChild(row);
    }

    assignRowIds();
}

function createRow(fName = "", lName = "", info = "", id = 0){
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

    newRow.setAttribute("studentRowID", id);
    fNameInp.setAttribute("studentRowID", id);
    lNameInp.setAttribute("studentRowID", id);
    infoInp.setAttribute("studentRowID", id);

    fNameInp.addEventListener("input", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentRowID");
        studentList[id].fName = elem.value;
        saveTemp();
    });
    lNameInp.addEventListener("input", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentRowID");
        studentList[id].lName = elem.value;
        saveTemp();
    });
    infoInp.addEventListener("input", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentRowID");
        studentList[id].info = elem.value;
        saveTemp();
    });
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
    studentList.push(new Student());
    refreshList(studentList);
    assignRowIds();
    saveTemp();
}

function deleteRow(event){
    let row = event.path[1]
    let rowID = row.getAttribute("rowID");
    let studentRowID = row.getAttribute("studentRowID");
    document.getElementById("studentList").deleteRow(rowID);
    studentList.splice(studentRowID, 1);
    assignRowIds();
    saveTemp();
}

function saveTemp(){
    fs.writeFile(tempPath, listOutput(), (err) => {
        if (err){
            console.log(err);
            return;
        }
    })
}

ipcRenderer.on('new_roster', (event) => {
    studentList = [];
    refreshList(studentList);
})

ipcRenderer.on('new_roster_opened', (event, data) => {
    loadJsonList(data)
    refreshList(studentList);
    saveTemp();
});

ipcRenderer.on('request_save_data', (event, filePath) => {
    ipcRenderer.send('save_file', {
        contents: listOutput(),
        filePath
    })
})

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
    studentList.sort(conditionFunc);

    //set all sort indicators
    for (let i = 0; i < sortIndicators.length; i++){
        sortIndicators[i].innerHTML = '';
        sortIndicators[i].setAttribute("sortOrder", "");
    }

    if (curSortDirection === "desc"){
        curIndicator.innerHTML = "⯅";
        curIndicator.setAttribute("sortOrder", "asc");
        studentList.reverse();
    }
    else{
        curIndicator.innerHTML = "⯆";
        curIndicator.setAttribute("sortOrder", "desc");
    }

    for (let i = 0; i < studentList.length; i++){
        studentList[i].id = i;
    }

    refreshList(studentList);
}

function updateSearch(){
    let search = document.getElementById("searchBox").value.toUpperCase();
    let filteredList = studentList.filter((i) => {
        return (
            i.fName.toUpperCase().includes(search) || 
            i.lName.toUpperCase().includes(search) ||
            i.info.toUpperCase().includes(search)
        )
    });

    if (search.length > 0){
        let addBtn = document.getElementById("addName");
        addBtn.hidden = true;
    }
    else{
        let addBtn = document.getElementById("addName");
        addBtn.hidden = false;
    }
    
    refreshList(filteredList);
}

function clearSearch(){
    document.getElementById("searchBox").value = "";
    updateSearch();
}