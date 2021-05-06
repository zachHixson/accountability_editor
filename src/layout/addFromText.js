const {ipcRenderer} = require('electron');
const remote = require('electron').remote;
const Student = require('./student.js');

function addNames(){
    let rawText = document.getElementById("nameList").value;
    let lNameFirst = document.getElementById("lNameFirst").checked;
    let lines = rawText.split('\n');
    let students = [];

    lines.forEach((line) => {
        let trimmedLine = line.trim();

        if (trimmedLine.length > 0){
            let split = /(\w+)\s(.*)/.exec(trimmedLine);

            if (split != null && split.length > 1){
                if (lNameFirst){
                    students.push(new Student(split[2], split[1]));
                }
                else{
                    students.push(new Student(split[1], split[2]));
                }
            }
            else{
                students.push(new Student(trimmedLine));
            }
        }
    });

    ipcRenderer.send('append_students', students);
    closeWindow();
}

function closeWindow(){
    let window = remote.getCurrentWindow();
    window.close();
}