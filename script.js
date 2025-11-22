// Initialize map centered on Brookline
const map = L.map('map').setView([42.333, -71.12], 14);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Store for centroids
const streetCentroids = [];


// Load your Brookline GeoJSON
fetch('data/brookline_streets.geojson')
  .then(res => res.json())
  .then(data => {

    // GEOJSON LAYER
    const streetsLayer = L.geoJSON(data, {
      style: {
        color: "#555",
        weight: 3
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          const name = feature.properties.name;

          // Compute centroid of each street segment
          const latlngs = layer.getLatLngs()[0];
          if (!latlngs) return;

          const midIndex = Math.floor(latlngs.length / 2);
          const center = latlngs[midIndex];

          streetCentroids.push({
            name: name,
            lat: center.lat,
            lng: center.lng,
            layer: layer
          });
        }
      }
    }).addTo(map);


    // SIDEBAR STREET LIST
    const sidebar = document.getElementById('street-list');

    streetCentroids.forEach(st => {
      const div = document.createElement('div');
      div.classList.add("draggable");
      div.textContent = st.name;
      div.draggable = true;
      div.dataset.name = st.name;

      // DRAG START
      div.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", st.name);
      });

      sidebar.appendChild(div);
    });


    // ADD DROP TARGETS TO THE MAP
    streetCentroids.forEach(st => {
      const icon = L.divIcon({
        className: "drop-target"
      });

      const marker = L.marker([st.lat, st.lng], {
        icon: icon
      }).addTo(map);

      marker.streetName = st.name;

      // Allow drop on marker
      marker.on("dragover", e => e.preventDefault());

      // HANDLE DROP
      marker.on("drop", e => {
        const draggedName = e.dataTransfer.getData("text/plain");

        if (draggedName === marker.streetName) {
          st.layer.setStyle({ color: "green", weight: 4 });
          marker._icon.style.background = "green";
        } else {
          marker._icon.style.background = "red";
          setTimeout(() => {
            marker._icon.style.background = "";
          }, 500);
        }
      });

    });

  });
