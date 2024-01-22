// HaritaUygulamasi.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, LayerGroup, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import Select from 'react-select';
import './App.css';
import './App.js';
import generatedData from './generated_data.json';
import analizIcon from './images/logo.png';
import analizIcon1 from './images/logo1.png';
import download from './images/download.png';
import search from './images/search.png';
import popup from './images/pop-up.png';
import delete1 from './images/delete.png';
import BayiDetaylariTablo from './BayiDetaylariTablo.js';
import * as XLSX from 'xlsx';
import Lejant from './Lejant';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css';

function HaritaUygulamasi() {
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedBayiKodu, setSelectedBayiKodu] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [bayiDetails, setBayiDetails] = useState(null);
  const mapRef = useRef();
  const [modal1Height, setModal1Height] = useState('30px');
  const [modal2Height, setModal2Height] = useState('80px');
  const [modal3Height, setModal3Height] = useState('80px');
  const [showTable, setShowTable] = useState(false);
  const [selectedDirectorship, setSelectedDirectorship] = useState(null);
  const [selectedManagement, setSelectedManagement] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [directorshipOptions, setDirectorshipOptions] = useState([]);
  const [managementOptions, setManagementOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [geoJSONData, setGeoJSONData] = useState([]);
  const [polygonData, setPolygonData] = useState([]);
  const [directorshipColorMap, setDirectorshipColorMap] = useState({});
  const colors = ['#FF69B4', '#8A2BE2', '#FFD700', '#FF6347', '#00CED1'];
  const [polygonColors, setPolygonColors] = useState(colors);
  const [isClearButtonActive, setIsClearButtonActive] = useState(false);
  const [markers, setMarkers] = useState([]);
  
  const customIcon = new L.Icon({
    iconUrl: require('./images/logo192.png'), 
    iconSize: [32, 32], 
    iconAnchor: [16, 16], 
    popupAnchor: [0, -16], 
  });
  
  // Yeni fonksiyon: fetchAndSetMarkers
const fetchAndSetMarkers = async (directorship, management, region) => {
  try {
    const queryParams = new URLSearchParams();

    if (directorship && !management && !region) {
      queryParams.append('BagliOlduguDirektorlukAdi', directorship);
    }

    if (directorship && management && !region) {
      queryParams.append('BagliOlduguMudurlukAdi', management);
    }

    if (directorship && management && region) {
      queryParams.append('BagliOlduguBayiAdi', region);
    }

    let url = 'http://localhost:3002/all';  // Tüm verileri gösteren endpoint

    if (queryParams.toString() !== '') {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Anlık Filtrelenmiş Veriler:', data.features);

    if (Array.isArray(data.features)) {
      
      const markers = mapMarkerData(data.features);
      setMarkers(markers);  // setMarkers fonksiyonunu kullanarak markers state'ini güncelle
      return markers;
    } else {
      console.warn('Marker verisi uygun formatta değil:', data);
      setMarkers([]);
      return [];
    }
  } catch (error) {
    console.error('Marker verisi alınırken hata:', error);
    setMarkers([]);
    return[];
  }
};

useEffect(() => {
  const fetchMarkers = async () => {
    try {
      if (selectedDirectorship || selectedManagement || selectedRegion) {
        const data = await fetchAndSetMarkers(
          selectedDirectorship ? selectedDirectorship.value : null,
          selectedManagement ? selectedManagement.value : null,
          selectedRegion ? selectedRegion.value : null
        );
       
      } else {
        setMarkers([]);
      }
    } catch (error) {
      console.error('Marker data could not be fetched:', error);
      setMarkers([]);
    }
  };

  fetchMarkers();
}, [selectedDirectorship, selectedManagement, selectedRegion]);


const mapMarkerData = features => {
  const markers = features.map(feature => {

    return {
      lat: feature.geometry.coordinates[1], 
      lon: feature.geometry.coordinates[0], 
      properties: feature.properties, // Tüm özellikleri içeren properties nesnesi
    };
  });
  return markers;
};


  const clearSelectedDirectorships = () => {
    setSelectedDirectorship(null);
  setSelectedManagement(null);
  setSelectedRegion(null);
  setManagementOptions([]);
  setRegionOptions([]);
  setGeoJSONData([]); 
  setPolygonColors([]);
  setMarkers([]);
  setDirectorshipColorMap({});
  setIsClearButtonActive(false);
  
  
  setGeoJSONData((prevGeoJSONData) => {
    console.log('Clear button clicked! GeoJSON Data:', prevGeoJSONData);
    return [];
  });
  };


const fetchAndSetData = async (url, setOptions, idKey) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data.features) && data.features.length > 0) {
      const options = data.features.map(feature => ({
        value: feature.properties[idKey],
        label: feature.properties[idKey],
        color: feature.properties.color,
      }));
      setOptions(options);
    
      setPolygonData(prevPolygonData => [
        ...prevPolygonData,
        ...data.features.map(feature => ({
          id: feature.properties[idKey],
          coordinates: feature.geometry.coordinates.map(polygon => (polygon[0].map(coords => [coords[1], coords[0]]))),
        })),
      ]);
    } else {
      console.warn(`${idKey} verisi boş veya dizi değil:`, data);
	  
    }
    
  } catch (error) {
    console.error(`${idKey} verisi alınırken hata:`, error);
    setPolygonData([]);
  }
};





  useEffect(() => {
    const fetchDirectorshipData = async () => {
      try {
        const response = await fetch('http://localhost:3001/directorship', {
          method: 'GET',
          mode: 'cors',
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (
          data.type === 'FeatureCollection' &&
          Array.isArray(data.features) &&
          data.features.length > 0
        ) {
          const options = data.features.map((feature) => ({
            value: feature.properties.Bagli_Ol03,
            label: feature.properties.Bagli_Ol03,
            coordinates: feature.geometry.coordinates[0],
          }));
          setDirectorshipOptions(options);
  
          const newPolygonData = data.features.map((feature) => ({
            id: feature.properties.Bagli_Ol03,
            coordinates: feature.geometry.coordinates.map((polygon) => {
              if (Array.isArray(polygon[0]) && polygon[0].length >= 1) {
                return polygon[0].map((coords) => [coords[1], coords[0]]);
              } else {
                console.warn(`Invalid coordinates format for feature ${feature.id}`);
                return [];
              }
            }),
            color: feature.properties.color,
          }));
          //console.log('Directorship Verileri:', data.features);
          setGeoJSONData(newPolygonData);

          setDirectorshipColorMap(
            data.features.reduce((colorMap, feature) => {
              colorMap[feature.properties.Bagli_Ol03] = feature.properties.color;
              return colorMap;
            }, {})
          );
  
          setSelectedDirectorship(null);
          setSelectedManagement(null);
          setSelectedRegion(null);
          setManagementOptions([]);
          setRegionOptions([]);
          setMarkers([]);
          setIsClearButtonActive(true);
        } else {
          console.warn('Direktörlük verisi uygun formatta değil:', data);
          setPolygonData([]);
          setMarkers([]);
          setIsClearButtonActive(false);
        }
      } catch (error) {
        console.error('Direktörlük verisi alınırken hata:', error);
        setPolygonData([]);
      }
    };
  
    fetchDirectorshipData();
  }, []);
  // İlk useEffect - Direktörlük verisini al ve güncelle
  
// İkinci useEffect - Seçilen direktörlüğe göre yönetim birimlerini al ve güncelle
useEffect(() => {
  setSelectedManagement(null);
  setSelectedRegion(null);
  setManagementOptions([]);
  setRegionOptions([]);
  setPolygonData([]);
  setMarkers([]);
  if (selectedDirectorship) {
    const encodedDirectorshipValue = encodeURIComponent(selectedDirectorship.value);
    fetchAndSetData(`http://localhost:3001/management/${encodedDirectorshipValue}`, setManagementOptions, 'Bagli_Ol02');

    
  }
}, [selectedDirectorship]);

// Üçüncü useEffect - Seçilen yönetim birimine göre bölgeleri al ve güncelle
useEffect(() => {
  setSelectedRegion(null);
  setRegionOptions([]);
  
  if (selectedManagement) {
    const encodedManagementValue = encodeURIComponent(selectedManagement.value);
    fetchAndSetData(`http://localhost:3001/region/${encodedManagementValue}`, setRegionOptions, 'Bagli_Ol00');
    
  }
  
}, [selectedManagement]);




// Dördüncü useEffect - Seçilen direktörlüğe göre poligon bilgisini al ve haritada göster
useEffect(() => {
 

  if (selectedDirectorship && selectedDirectorship.coordinates) {
    const directorshipCoordinates = selectedDirectorship.coordinates[0].map(coords => [coords[1], coords[0]]);
    const directorshipPolygon = { id: selectedDirectorship.value, coordinates: directorshipCoordinates, color: selectedDirectorship.color };


    setGeoJSONData([directorshipPolygon]);
    //console.log('Directorship Polygon:', directorshipPolygon); // Polygon datayı konsolda yazdır
    //setPolygonColors([selectedDirectorship.color]);
  } else {
    setGeoJSONData([]); // Seçilen direktörlük için poligon bilgisi yoksa sıfırla
  }
}, [selectedDirectorship, selectedManagement, polygonData]);

// Beşinci useEffect - Seçilen yönetim birimine göre poligon bilgisini al ve haritada göster
useEffect(() => {
  if (selectedManagement) {
    const selectedManagementPolygon = polygonData.find(polygon => polygon.id === selectedManagement.value);
    if (selectedManagementPolygon) {
      const managementCoordinates = selectedManagementPolygon.coordinates[0].map(coords => [coords[0], coords[1]]);
      const managementPolygon = { id: selectedManagement.value, coordinates: managementCoordinates, color: selectedManagementPolygon.color };


      setGeoJSONData(prevGeoJSONData => [...prevGeoJSONData, managementPolygon]);
      //console.log('Management Polygon:', managementPolygon); // Polygon datayı konsolda yazdır
      setPolygonColors(prevColors => [...prevColors, selectedManagementPolygon.color]);
    } else {
      console.warn('Seçilen yönetim birimine ait poligon bilgisi bulunamadı.');
      setGeoJSONData([]);
    }
  }
  
}, [selectedManagement, polygonData]

);

const previousRegionRef = useRef(null);

// ...

useEffect(() => {
	
  const previousRegionId = previousRegionRef.current ? previousRegionRef.current.id : null;
  const previousRegionColor = previousRegionRef.current ? previousRegionRef.current.color : null;


  if (selectedRegion) {
    const selectedRegionPolygon = polygonData.find(polygon => polygon.id === selectedRegion.value);
    if (selectedRegionPolygon) {
      const regionCoordinates = selectedRegionPolygon.coordinates[0].map(coords => [coords[0], coords[1]]);
      const regionPolygon = { id: selectedRegion.value, coordinates: regionCoordinates, color: selectedRegionPolygon.color };


      if (previousRegionId) {
        setGeoJSONData(prevGeoJSONData => prevGeoJSONData.filter(polygon => polygon.id !== previousRegionId));
        setPolygonColors(prevColors => prevColors.filter(color => color !== previousRegionColor));
      }


      setGeoJSONData(prevGeoJSONData => [...prevGeoJSONData, regionPolygon]);

      setPolygonColors(prevColors => [...prevColors, selectedRegionPolygon.color]);

      previousRegionRef.current = {
        id: selectedRegion.value,
        color: selectedRegionPolygon.color
      };
    } else {
      console.warn('Seçilen bölgeye ait poligon bilgisi bulunamadı.');
    }
  } else {
	  
    if (previousRegionId) {
      setGeoJSONData(prevGeoJSONData => prevGeoJSONData.filter(polygon => polygon.id !== previousRegionId));
      setPolygonColors(prevColors => prevColors.filter(color => color !== previousRegionColor));
    }

    previousRegionRef.current = null;
  }
}, [selectedRegion, polygonData]);


useEffect(() => {
  const uniqueBayiKodular = [...new Set(generatedData.map(item => item.BAYI_KODU))];
  const options = uniqueBayiKodular.map(bayiKodu => ({
    value: bayiKodu,
    label: bayiKodu,
  }));
  setProductOptions(options);
}, []);

  const handleExportToExcel = () => {
    if (bayiDetails) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([bayiDetails]);

      const fileName = `BayiDetails_${selectedBayiKodu}.xlsx`;

      XLSX.utils.book_append_sheet(wb, ws, fileName);

      XLSX.writeFile(wb, fileName, { bookType: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
  };

  const toggleModal = (modal) => {
    if (selectedModal === modal) {
      setSelectedModal(null);
      setModal1Height('30px');
      setModal2Height('80px');
      setModal3Height('80px');
      setShowTable(false);
    } else {

      if (selectedModal === 'modal1') {
        setModal1Height('30px');
        setShowTable(false);
      } else if (selectedModal === 'modal2') {
        setModal2Height('80px');
        setShowTable(false);
      } else if(selectedModal === 'modal3'){
        setModal3Height('80px');
        setShowTable(false);
      }

      setSelectedModal(modal);
      setModal1Height(modal === 'modal1' ? '200px' : '30px');
      setModal2Height(modal === 'modal2' ? '200px' : '80px');
      setModal3Height(modal === 'modal3' ? '200px' : '80px');
    }
  };

  const handleShowDetails = () => {
    const bayiDetail = generatedData.find(item => item.BAYI_KODU === selectedBayiKodu);
    setBayiDetails(bayiDetail);
    setShowTable(true);
  };

  useEffect(() => {
    //console.log('Polygon Data:', polygonData);
  }, [polygonData]);


  

  return (
    <div className="harita-uygulamasi">
       <div
        style={{
          position: 'absolute',
          top: '890px',
          right: '10px',
          background: isClearButtonActive
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          padding: '2px',
          zIndex: 1000,
          pointerEvents: isClearButtonActive, 
        }}
      >
        <button
          onClick={clearSelectedDirectorships}
          style={{
            color: 'white',
            background: 'none',
            border: 'none',
          }}
          disabled={!isClearButtonActive}
        >
          <img src={delete1} alt="Silme İkonu" style={{ width: '16px', transform: 'rotate(360deg)' }} />
         
        </button>
      </div>


      <MapContainer ref={mapRef} center={[39, 35]} zoom={7} className="harita-container" zoomControl={false}  style={{ width: '100%', height: '99vh' }}>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  {geoJSONData.length > 0 && (
    <LayerGroup>
          {geoJSONData.map((polygon, index) => (
            <Polygon
              key={index}
              positions={polygon.coordinates}
              fillOpacity={0.3}
              color={colors[index % colors.length]}
              zIndex={5} 
            />
          ))}
        </LayerGroup>
      )}
        <Lejant directorshipColorMap={directorshipColorMap} mapColors={colors} />


        {markers.length > 0 && (
        <LayerGroup>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lon]}
              zIndexOffset={1000}
              icon={customIcon}
              >
                <Popup>
                  <div>
                    <p>Bayi Adı: {marker.properties.BagliOlduguBayiAdi}</p>
                    <p>Bayi Kodu: {marker.properties.BagliOlduguBayiKodu}</p>
                    <p>Direktörlük Adı: {marker.properties.BagliOlduguDirektorlukAdi}</p>
                    <p>Müdürlük Adı: {marker.properties.BagliOlduguMudurlukAdi}</p>
                    <p>İl: {marker.properties.Il}</p>
                    <p>İlçe: {marker.properties.Ilce}</p>
                    <p>Nokta Adı: {marker.properties.NoktaAdi}</p>
                    <p>Nokta Kodu: {marker.properties.NoktaKodu}</p>
                </div>
              </Popup>
            </Marker>
          ))}
         </LayerGroup>
      )}
      
</MapContainer>

      {showTable && bayiDetails && (
        <div className="table-penceresi">
          <span
            className="table-kapat"
            onClick={() => setShowTable(false)}
            style={{ color: 'white', cursor: 'pointer' }}
          >
            &times;
          </span>
          <p style={{ color: 'black' }}></p>
          <BayiDetaylariTablo bayiDetails={bayiDetails} onClose={() => setShowTable(false)} />
        </div>
      )}
      <div
        onClick={() => toggleModal('modal1')}
        style={{
          position: 'absolute',
          top: '30px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '70%',
          padding: '8px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        
        <img src={analizIcon1} alt="Analiz Icon" style={{ width: '20px', transform: 'rotate(180deg)' }} />
      </div>
      <div
        className={`modal ${selectedModal === 'modal1' ? 'acik' : ''}`}
        style={{
          position: 'absolute',
          top: '30px',
          right: '50px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '15px',
          height: modal1Height,
        }}
      >
        
        <div className="modal-icerik">
          <span className="modal-kapat" onClick={() => toggleModal('modal1')}>
            &times;
          </span>
          <p style={{ color: 'black' }}></p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%' }}>
              <Select
                options={directorshipOptions}
                value={selectedDirectorship}
                onChange={(selected) => setSelectedDirectorship(selected)}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100px',
                    maxWidth: '150px',
                  }),
                }}
              />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 50, right: 0, width: '100%' }}>
              <Select
                options={managementOptions}
                value={selectedManagement}
                onChange={(selected) => setSelectedManagement(selected)}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100px',
                    maxWidth: '150px',
                  }),
                }}
              />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 100, right: 0, width: '100%' }}>
            <Select
            options={regionOptions}
            value={selectedRegion}
            onChange={(selected) => setSelectedRegion(selected)}
            styles={{
              control: (provided) => ({
                ...provided,
                minWidth: '100px',
                maxWidth: '150px',
              }),
              }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => toggleModal('modal2')}
        style={{
          position: 'absolute',
          top: '80px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '70%',
          padding: '8px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        <img src={analizIcon} alt="Analiz Icon" style={{ width: '20px', transform: 'rotate(180deg)', display: 'block', margin: 'auto' }} />
      </div>
      <div
        className={`modal ${selectedModal === 'modal2' ? 'aciks' : ''}`}
        style={{
          position: 'absolute',
          top: '87px',
          right: '50px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '15px',
          height: modal2Height,
        }}
      >
        <img src={analizIcon} alt="Analiz Icon" style={{ width: '20px', transform: 'rotate(180deg)', display: 'block', margin: 'auto' }} />
      </div>
      <div
        className={`modal ${selectedModal === 'modal2' ? 'aciks' : ''}`}
        style={{
          position: 'absolute',
          top: '87px',
          right: '50px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '15px',
          height: modal2Height,
        }}
      >
        <div className="modal-iceriks">
          <span className="modal-kapats" onClick={() => toggleModal('modal2')}>
            &times;
          </span>
          <p style={{ color: 'black' }}></p>
          <Select
          options={productOptions}
          value={selectedBayiKodu ? { value: selectedBayiKodu, label: selectedBayiKodu } : null}
          onChange={(selected) => setSelectedBayiKodu(selected.value)}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: '100px',
              maxWidth: '150px',
            }),
          }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', width: '50%', marginTop: '10px' }}>
      <button onClick={handleShowDetails} style={{ flex: 1, marginRight: '5px', display: 'fix', justifyContent: 'center', alignItems: 'center' }}>
        <img src={search} alt="Arama İkonu" style={{ width: '20px', transform: 'rotate(360deg)' }} />
      </button>
      {showTable && bayiDetails && (
        <button onClick={handleExportToExcel} style={{ flex: 1, marginLeft: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={download} alt="İndirme İkonu" style={{ width: '20px', transform: 'rotate(360deg)', marginRight: '5px' }} />
          
        </button>
      )}
    </div>
    
        </div>
      </div>
      <div
        onClick={() => toggleModal('modal3')}
        style={{
          position: 'absolute',
          top: '130px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '70%',
          padding: '8px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        <img src={popup} alt="Popup Icon" style={{ width: '20px', transform: 'rotate(180deg)', display: 'block', margin: 'auto' }} />
      </div>
      <div
        className={`modal ${selectedModal === 'modal3' ? 'acik3' : ''}`}
        style={{
          position: 'absolute',
          top: '127px',
          right: '50px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '15px',
          height: modal3Height,
          zIndex: 1000,
        }}
      >
        <div className="modal-icerik3">
          <span className="modal-kapat3" onClick={() => toggleModal('modal3')}>
            &times;
          </span>
          <p style={{ color: 'black' }}></p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%' }}>
              
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 50, right: 0, width: '100%' }}>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
  );
}

export default HaritaUygulamasi;

