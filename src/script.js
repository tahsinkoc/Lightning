const { exec } = require('child_process');
const { ipcRenderer } = require('electron')
const fs = require('fs');
const path = require('path');

const command = 'ipconfig | findstr /i "IPv4"';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Komut çalıştırılırken hata oluştu: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Hata çıktısı: ${stderr}`);
        return;
    }

    const ipv4Matches = stdout.match(/\d+\.\d+\.\d+\.\d+/);
    const ipv4Address = ipv4Matches ? ipv4Matches[0] : null;

    if (ipv4Address) {
        document.getElementById('yourIp').textContent = ipv4Address
    } else {
        console.log('IPv4 adresi bulunamadı.');
    }
});

const classNameOfFileDiv = 'cursor-pointer shadow-md shadow-black border border-lime-700 px-8 py-2 text-white rounded-sm';

let ipAdress = '';
let fileName = '';
let downloadButton = document.getElementById('downloadButton');

downloadButton.addEventListener('click', () => {
    document.getElementById('progress').style.display = 'flex'
    ipcRenderer.invoke('downloadFile', { url: `http://${ipAdress}:3000/download/${fileName}`, fileName: fileName })
        .then(res => {

        })
    // const pathForParent = path.join(__dirname, '..')
    const filePath = path.join(__dirname, '..', 'download', `${fileName}.zip`);
    const int = setInterval(() => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error(`Dosya bulunamadı: ${err.message}`);
                // İsterseniz interval'ı burada temizleyebilirsiniz
            } else {
                document.getElementById('progress').style.display = 'none';
                clearInterval(int);
            }
        });
    }, 1000);
})


function onClickEventOfFileDivs(parameter) {
    document.getElementById('selectedFile').textContent = parameter;
    fileName = parameter;
}

let saveIpButton = document.getElementById('saveIpButton');
let parentDivOfFiles = document.getElementById('parentDivOfFiles')
saveIpButton.addEventListener('click', () => {
    let targetIpAdress = document.getElementById('targetIp').value;
    const fetchUrl = `http://${targetIpAdress}:3000/files`;
    ipAdress = targetIpAdress;
    ipcRenderer.invoke('fetchData', fetchUrl)
        .then(res => {
            parentDivOfFiles.textContent = '';
            res.forEach(item => {
                let div = document.createElement('button');
                div.textContent = item.name;
                div.className = classNameOfFileDiv;
                div.id = item.name;
                div.onclick = function () {
                    onClickEventOfFileDivs(item.name)
                }
                parentDivOfFiles.appendChild(div);
            })
        })
})