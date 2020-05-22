/*
Main JS File
*/

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const {app, BrowserWindow, Menu, dialog, ipcMain, nativeImage} = electron;

let mainWindow;
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
    let image = nativeImage.createFromPath(__dirname + '/img/logo_no-outline.png');
    let menu = Menu.buildFromTemplate(top_menu);

    Menu.setApplicationMenu(menu);
    image.setTemplateImage(true);

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        icon: image
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
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadFile(path.join(__dirname, '/layout/addFromText.html'));
    addWindow.setMenu(null);
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

            mainWindow.send("new_roster_opened", data);
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
                fs.writeFile(data.filePath, data.contents, (err) => {
                    if (err){
                        console.log(err);
                    }
                });
            }
        });
    }
    else{
        fs.writeFile(data.filePath, data.contents, (err) => {
            if (err){
                console.log(err);
            }
        });
    }
})

ipcMain.on('append_students', (event, data) => {
    mainWindow.send('append_students', data);
})