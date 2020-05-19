/*
Main JS File
*/

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;

app.on('ready', function(){
    let menu = Menu.buildFromTemplate([
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
    ]);

    Menu.setApplicationMenu(menu);

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile("./src/layout/main.html");

    mainWindow.on('closed', function(){
        app.quit();
    });
})

function clearRosterDialog(){
    let response = dialog.showMessageBox({
        noLink: true,
        buttons: ["New", "Cancel"],
        message: "Warning: This will create a a new accountability list. All unsaved changes will be lost"
    }, (responses) => {
        if (responses == 0){
            mainWindow.send("new_roster");
            console.log("event");
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
    fs.writeFile(data.filePath, data.contents, (err) => {
        if (err){
            console.log(err);
        }
    });
})