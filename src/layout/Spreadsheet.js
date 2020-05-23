const fs = require('fs');
const path = require('path');
const remote = require('electron').remote;
const {ipcRenderer} = require('electron');
const app = remote.app;
const Student = require('./student.js');
const UndoStore = require('./undo_store.js');
const IDGenerator = require('./idGenerator.js');

const START_ROW = 2;

let tempPath = path.join(app.getPath("appData"), "accountability_editor/tempSave.json");
let studentList = [];
let undoStore = new UndoStore();
let idGenerator = new IDGenerator();

function init(){
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
            idGenerator.newID()
        ));
    }
}

function listOutput(){
    let outList = [];

    for (let i = 0; i < studentList.length; i++){
        outList.push(studentList[i].getOutput());
    }

    return outList;
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
        nameList[i].rowID = i;
    }

    document.getElementById("studentCount").innerHTML = studentList.length;
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

    fNameInp.type = "text";
    lNameInp.type = "text";
    infoInp.type = "text";

    fNameCell.className = "nameField";
    lNameCell.className = "nameField";
    deleteCell.className = "delete_cell";

    newRow.setAttribute("studentID", id);
    fNameInp.setAttribute("studentID", id);
    lNameInp.setAttribute("studentID", id);
    infoInp.setAttribute("studentID", id);

    fNameInp.addEventListener("change", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentID");
        updateStudent(id, elem.value, null, null);
        saveTemp();
    });
    lNameInp.addEventListener("change", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentID");
        updateStudent(id, null, elem.value, null);
        saveTemp();
    });
    infoInp.addEventListener("change", (event) => {
        let elem = event.path[0];
        let id = elem.getAttribute("studentID");
        let student = studentList.filter(student => student.id == id);
        updateStudent(id, null, null, elem.value);
        saveTemp();
    });
    deleteCell.addEventListener("click", deleteRow);

    fNameCell.appendChild(fNameInp)
    lNameCell.appendChild(lNameInp);
    infoCell.appendChild(infoInp);

    return newRow;
}

function insertRow(event){
    insertStudent();
}

function deleteRow(event){
    let row = event.path[1];
    let studentID = row.getAttribute("studentID");
    deleteStudent(studentID);
}

function insertStudent(student = new Student()){
    undoStore.commit('insert', JSON.parse(JSON.stringify(studentList)));
    studentList.push(student);
    refreshList(studentList);
    saveTemp();
}

function deleteStudent(id){
    undoStore.commit('delete', JSON.parse(JSON.stringify(studentList)));
    studentList.map((student, idx) => {
        if (student.id == id){
            studentList.splice(idx, 1);
        }
    });
    refreshList(studentList);
    saveTemp();
}

function updateStudent(id, fName, lName, info){
    let modStudent = studentList.filter(student => student.id == id)[0];
    undoStore.commit('update', JSON.parse(JSON.stringify(studentList)));

    if (fName != null && fName.length > 0){
        modStudent.fName = fName;
    }

    if (lName != null && lName.length > 0){
        modStudent.lName = lName;
    }

    if (info != null && info.length > 0){
        modStudent.info = info;
    }

    refreshList(studentList);
    saveTemp();
}

function saveTemp(){
    fs.writeFile(tempPath, JSON.stringify(listOutput()), (err) => {
        if (err){
            console.log(err);
            return;
        }

        ipcRenderer.send('changed');
    })
}

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

ipcRenderer.on('new_roster', (event) => {
    undoStore.commit('new_roster', JSON.parse(JSON.stringify(studentList)));
    studentList = [];
    refreshList(studentList);
})

ipcRenderer.on('new_roster_opened', (event, data) => {
    loadJsonList(data)
    refreshList(studentList);
    saveTemp();
    undoStore.clear();
});

ipcRenderer.on('request_save_data', (event, filePath) => {
    let saveList = listOutput();
    let stringList = JSON.stringify(saveList);
    let emptyNames = saveList.filter(student => student.fName.trim().length <= 0 || student.lName.trim().length <= 0);

    ipcRenderer.send('save_file', {
        contents: stringList,
        filePath,
        containsEmpty: (emptyNames.length > 0)
    })
});

ipcRenderer.on('undo', (event) => {
    let undoState = undoStore.undo();

    if (undoState != null){
        studentList = undoState;
        refreshList(studentList);
        saveTemp();
    }
});

ipcRenderer.on('redo', (event) => {
    let redoState = undoStore.redo();

    if (redoState != null){
        studentList = redoState;
        refreshList(studentList);
        saveTemp();
    }
});

ipcRenderer.on('append_students', (event, data) => {
    data.map((student) => {
        student.id = idGenerator.newID();
        studentList.push(new Student(
            student.fName,
            student.lName
        ));
    });
    refreshList(studentList);
    saveTemp();
})