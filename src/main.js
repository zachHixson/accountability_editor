/*
Main JS File
*/

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const {app, BrowserWindow, Menu, dialog, ipcMain, nativeImage} = electron;

let unsavedChanges = false;
let studentList = [];
let mainWindow;
let appIcon = nativeImage.createFromPath(__dirname + '/img/logo_no-outline.png');
let top_menu = [
    {
        label: 'File',
        submenu: [
            {
                label:"New",
                accelerator: "CmdOrCtrl + N",
                click(){
                    clearRosterDialog();
                }
            },
            {
                label:"Open",
                accelerator: "CmdOrCtrl + O",
                click(){
                    openRosterDialog();
                }
            },
            {
                label:"Save",
                accelerator: "CmdOrCtrl + S",
                click() {
                    openSaveDialog();
                }
            },
            {
                label:"Quit",
                accelerator: "CmdOrCtrl + Q",
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: "CmdOrCtrl + Z",
                click(){
                    mainWindow.send('undo');
                }
            },
            {
                label: 'Redo',
                accelerator: "CmdOrCtrl + R",
                click(){
                    mainWindow.send('redo');
                }
            },
            {
                label: 'Add from text List',
                click() {
                    openAddFromTextWindow()
                }
            }
        ]
    },
    {
        label: 'Export',
        submenu: [
            {
                label: 'Print table',
                accelerator: "CmdOrCtrl + P",
                click() {
                    openPrintTableOptions();
                }
            }
        ]
    },
    {
        label: 'debug',
        submenu: [
            {
                label: "Open console",
                click() {
                    mainWindow.webContents.openDevTools();
                }
            }
        ]
    }
];

app.on('ready', function(){
    let menu = Menu.buildFromTemplate(top_menu);

    Menu.setApplicationMenu(menu);
    appIcon.setTemplateImage(true);

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        icon: appIcon
    })
    mainWindow.loadFile("./src/layout/main.html");

    mainWindow.on('closed', function(){
        app.quit();
    });
})

function openAddFromTextWindow(){
    let addWindow = new BrowserWindow({
        width: 400,
        height: 500,
        parent: mainWindow,
        modal: true,
        title: "Add students from text list",
        icon: appIcon,
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadFile(path.join(__dirname, '/layout/addFromText.html'));
    addWindow.setMenu(null);
}

function openPrintTableOptions(){
    let printTableWindow = new BrowserWindow({
        width: 500,
        height: 320,
        parent: mainWindow,
        modal: true,
        title: "Print table settings",
        icon: appIcon,
        webPreferences: {
            nodeIntegration: true
        }
    });
    printTableWindow.loadFile(path.join(__dirname, '/layout/printTableOptions.html'));
    printTableWindow.setMenu(null);
    printTableWindow.webContents.once('dom-ready', () => {
        printTableWindow.send('update-list-count', studentList.length);
    });
}

function clearRosterDialog(){
    let response = dialog.showMessageBox({
        noLink: true,
        buttons: ["New", "Cancel"],
        message: "Warning: This will create a a new accountability list. All unsaved changes will be lost"
    }, (responses) => {
        if (responses == 0){
            mainWindow.send("new_roster");
        }
    });
}

function openRosterDialog(){
    let filePath;

    dialog.showOpenDialog({properties: ['openFile']})
    .then((data) => {filePath = data.filePaths[0]})
    .then((data) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err){
                console.log(err);
                return;
            }
            
            if (unsavedChanges){
                dialog.showMessageBox({
                    noLink: true,
                    buttons: ["Open", "Cancel"],
                    message: "Warning: There are unsaved changes in this document. Any usaved changes will be lost"
                }, (responses) => {
                    if (responses == 0){
                        mainWindow.send("new_roster_opened", data);
                        unsavedChanges = false;
                    }
                })
            }
            else{
                mainWindow.send("new_roster_opened", data);
                unsavedChanges = false;
            }
            
        });
    })
    .catch((err) => console.log(err));
}

function openSaveDialog(){
    dialog.showSaveDialog({properties: ['saveFile'], filters: [{name: "JSON file", extensions: ["json"]}]})
    .then((data) => {
        if (!data.canceled){
            mainWindow.send("request_save_data", data.filePath);
        }
    });
}

async function saveFile(filePath, contents){
    fs.writeFile(filePath, contents, (err) => {
        if (err){
            console.log(err);
        }

        unsavedChanges = false;
    });
}

ipcMain.on('save_file', (event, data) => {
    if (data.containsEmpty){
        let response = dialog.showMessageBox({
            noLink: true,
            buttons: ["Save", "Remove Empty", "Cancel"],
            message: "Warning: The list you are about to save contains student entries without first or last name. Do you want to continue?"
        }, (responses) => {
            let save = false;
            if (responses == 0){
                save = true;
            }
            else if(responses == 1){
                let list = JSON.parse(data.contents);
                let culledList = list.filter(student => student.fName.trim().length > 0 && student.lName.trim().length > 0);
                data.contents = JSON.stringify(culledList);
                save = true;
            }

            if (save){
                saveFile(data.filePath, data.contents);
            }
        });
    }
    else{
        saveFile(data.filePath, data.contents);
    }
})

ipcMain.on('append_students', (event, data) => {
    mainWindow.send('append_students', data);
})

ipcMain.on('changed', (event) => {
    unsavedChanges = true;
})

ipcMain.on('send-student-list', (event, data) => {
    studentList = data.studentList;
})

ipcMain.on('print-table', (event, data) => {
    let printWindow = new BrowserWindow({
        width: 500,
        height: 386,
        parent: mainWindow,
        modal: true,
        title: "Print Preview",
        icon: appIcon,
        webPreferences: {
            nodeIntegration: true
        }
    });
    printWindow.loadFile(path.join(__dirname, '/layout/printTable.html'));
    printWindow.setMenu(null);
    printWindow.webContents.once('dom-ready', () => {
        printWindow.send('update-data', {studentList, settings:data});
    });
})