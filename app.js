const { app, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const fs = require('fs');
const path = require('path');
const eapp = express();

const port = 3000;

eapp.get('/files', async (req, res) => {
    const uploadFilePath = path.join(__dirname, 'upload')
    let jsonData = [];
    fs.readdir(uploadFilePath, (err, data) => {
        if (err) {
            throw err
        } else {
            data.forEach(file => {
                jsonData.push({ name: file })
            });
            res.send(jsonData)
        }
    })
});

eapp.listen(port, () => {
    console.log('Sunucu http://localhost:' + port + ' adresinde çalışıyor.');
});

function createWindow() {
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            devTools: true,
            nodeIntegration: true
        },
    });

    win.loadFile('./windows/index.html');
    win.removeMenu();
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('fetchData', async (event, data) => {
    let fdata = await fetch(data);
    let parsed = await fdata.json();
    return parsed
})
