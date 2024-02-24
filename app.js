const { app, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const fs = require('fs');
const path = require('path');
const eapp = express();
const archiver = require('archiver');
const { spawn } = require('child_process');
eapp.use(express.json());

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

eapp.get('/download/:foldername', async (req, res) => {
    const foldername = req.params.foldername;
    const folderPath = path.join(__dirname, 'upload', foldername);

    const zipFileName = `${foldername}.zip`;
    const zipFilePath = path.join(__dirname, 'upload', zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(folderPath, false);

    archive.finalize();

    await new Promise((resolve) => {
        output.on('close', () => {
            resolve();
        });
    });

    res.download(zipFilePath, (err) => {
        if (err) {
            console.error('Dosya indirme hatası:', err);
            res.status(500).send('Dosya indirme hatası');
        }

        fs.unlinkSync(zipFilePath);
    });
});

const port = 3000;

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


function extractProgress(data) {
    const progressMatch = data.toString().match(/\b(\d{1,3})%\b/);
    if (progressMatch && progressMatch.length > 1) {
        const progress = parseInt(progressMatch[1], 10);
        console.log(`Download Progress: ${progress}%`);
    }
}

ipcMain.handle('downloadFile', async (event, data) => {

    console.log(data.url);
    const filepath = path.join(__dirname, `download`, `${data.fileName}.zip`);

    // Execute a shell command to download the file
    const curlProcess = spawn('curl', [data.url, '--output', filepath]);
    // curlProcess.stdout.on('data', extractProgress);
    curlProcess.on('close', (code) => {
        if (code === 0) {
            // Send a response to the renderer process
            event.sender.send('download-response', filepath);
        } else {
            console.error('File download error:', code);
            event.sender.send('download-response', null);
        }
    });
    return 'aa'

})