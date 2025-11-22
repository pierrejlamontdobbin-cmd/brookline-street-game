// Initialize map centered roughly on Brookline
const map = L.map('map').setView([42.333, -71.12], 14);

// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Load streets from your GeoJSON
fetch('data/brookline_streets.geojson')
  .then(res => res.json())
  .then(data => {
    const streetNames = new Set();

    L.geoJSON(data, {
      style: {
        color: "#555",
        weight: 3
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          streetNames.add(feature.properties.name);
        }
      }
    }).addTo(map);

    // Add street names to sidebar
    const listDiv = document.getElementById('street-list');
    const sorted = Array.from(streetNames).sort();

    sorted.forEach(name => {
      const el = document.createElement('div');
      el.textContent = name;
      listDiv.appendChild(el);
    });

  });
