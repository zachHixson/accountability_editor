/*
Main JS File
*/

const electron = require('electron');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

app.on('ready', function(){
    let menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {label:"New"},
                {label:"Open"},
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