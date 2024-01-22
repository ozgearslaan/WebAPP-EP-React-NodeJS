//server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware'ini tanımla (diğer route tanımlamalarından önce gelmeli)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // İzin verilen origin (istemci tarafı)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Statik dosyaları sunucuya ekle
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/directorship', (req, res) => {
  const filePath = path.join(__dirname, 'static', 'directorship.geojson');
  res.sendFile(filePath);
});

app.get('/management/:directorship', (req, res) => {
  const directorship = req.params.directorship;
  const filePath = path.join(__dirname, 'static', 'management.geojson');

  try {
    // Dosyayı JSON olarak oku
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Directorship'e göre filtrele
    const filteredData = jsonData.features.filter(feature => feature.properties.Bagli_Ol03 === directorship);

    res.send({ type: 'FeatureCollection', features: filteredData });
  } catch (error) {
    console.error('Dosya okuma veya ayrıştırma hatası:', error);
    res.status(500).send({ error: `İç Sunucu Hatası: ${error.message}` });
  }
});

app.get('/region/:management', (req, res) => {
  const management = req.params.management;
  const filePath = path.join(__dirname, 'static', 'region.geojson');

  try {
    // Dosyayı JSON olarak oku
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Management'e göre filtrele
    const filteredData = jsonData.features.filter(feature => feature.properties.Bagli_Ol02 === management);

    res.send({ type: 'FeatureCollection', features: filteredData });
  } catch (error) {
    console.error('Dosya okuma veya ayrıştırma hatası:', error);
    res.status(500).send({ error: `İç Sunucu Hatası: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
