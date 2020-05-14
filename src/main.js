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
                {label:"New"},
                {
                    label:"Open",
                    click(){
                        openRosterDialog();
                    }
                },
                {label:"Save"},
                {label:"Exit"}
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
    });
}