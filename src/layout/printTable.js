const {ipcRenderer} = require('electron');
const remote = require('electron').remote;

function closeWindow(){
    let window = remote.getCurrentWindow();
    window.close();
}

function sortBy(studentList, sortByFirst){
    if (sortByFirst){
        studentList.sort((a, b) => {
            let aFName = a.fName.toUpperCase();
            let bFName = b.fName.toUpperCase();

            if (aFName == bFName){
                return (a.lName.toUpperCase() < b.lName.toUpperCase()) ? -1 : 0;
            }
            else{
                return (aFName < bFName) ? -1 : 1;
            }
        })
    }
    else{
        studentList.sort((a, b) => {
            let aLName = a.lName.toUpperCase();
            let bLName = b.lName.toUpperCase();

            if (aLName == bLName){
                return (a.fName.toUpperCase() < b.fName.toUpperCase()) ? -1 : 0;
            }
            else{
                console.log(aLName + " | " + bLName)
                return (aLName < bLName) ? -1 : 1;
            }
        })
    }

    console.log(studentList)
}

ipcRenderer.on('update-data', (event, {settings, studentList}) => {
    let table = document.createElement('table');
    let curStudentIdx = 0;

    document.getElementById('tableTitle').innerHTML = settings.title;
    document.getElementById('tableTitle').style.background = settings.color;
    document.getElementById('tableList').appendChild(table);
    
    //create empty table
    for (let r = 0; r < settings.rows; r++){
        let curRow = table.insertRow();
        
        for (let c = 0; c < settings.cols; c++){
            curRow.insertCell(c);
        }
    }

    sortBy(studentList, (settings.sortby === 'first'));
    console.log(settings.sortby === 'first')

    //fill table
    for (let r = 0; r < table.rows.length; r++){
        let curRow = table.rows[r];

        for (let c = 0; c < curRow.cells.length; c++){
            let curStudent;
            let name;

            if (curStudentIdx < studentList.length){
                curStudent = studentList[curStudentIdx];
                name = curStudent.fName + ' ' + curStudent.lName;
                curStudentIdx++;
            }
            else{
                name = "";
            }

            curRow.cells[c].innerHTML = name;
        }
    }
})