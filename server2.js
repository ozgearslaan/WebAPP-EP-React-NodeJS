const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;
app.options('*', cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // HTTP yöntemi 
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// GeoJSON dosyasını okuma
const geojsonFilePath = 'EfesNoktalar.geojson';
const data = JSON.parse(fs.readFileSync(geojsonFilePath, 'utf8'));



app.get('/all', (req, res) => {
    const { BagliOlduguDirektorlukAdi, BagliOlduguMudurlukAdi, BagliOlduguBayiAdi } = req.query;

    // Filtreleme işlemi
    const filteredPoints = data.features.filter(feature => {
        return (!BagliOlduguDirektorlukAdi || feature.properties.BagliOlduguDirektorlukAdi === BagliOlduguDirektorlukAdi) &&
               (!BagliOlduguMudurlukAdi || feature.properties.BagliOlduguMudurlukAdi === BagliOlduguMudurlukAdi) &&
               (!BagliOlduguBayiAdi || feature.properties.BagliOlduguBayiAdi === BagliOlduguBayiAdi);
    });

    console.log('Filtreleme Sorguları:', BagliOlduguDirektorlukAdi, BagliOlduguMudurlukAdi, BagliOlduguBayiAdi);
    console.log('Filtrelenmiş Nokta Sayısı:', filteredPoints.length);

    res.json({ features: filteredPoints });
});


// Server'ı başlat
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
