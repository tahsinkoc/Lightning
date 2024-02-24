const { exec } = require('child_process');


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
        console.log(`Bulunan IPv4 Adresi: ${ipv4Address}`);
    } else {
        console.log('IPv4 adresi bulunamadı.');
    }
});