

// Store our API endpoint inside earthquake and tectonic plate urls
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tecplateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature(feature, layer) {
            layer.bindPopup(`<h3> ${feature.properties.place} </h3><hr><p> ${new Date(feature.properties.time)} </p><hr><p> Magnitude: ${feature.properties.mag} </p>`);
        },
    
        pointToLayer: function (feature, latlng) {
            let markerOptions = {
              radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              opacity: .7,
              color: "#000",
              stroke: true,
              weight: .5
          };
        return L.circleMarker(latlng, markerOptions);
    }
  });
       
  
  createMap(earthquakes);
}
function getColor(mag) {
  return mag > 6.0 ? '#ff0000':
         mag > 5.0 ? '#ff4000':
         mag > 4.0 ? '#ff8000':
         mag > 3.0 ? '#ffbf00':
         mag > 2.0 ? '#ffff00':
                     '#ffff80';
}

function getRadius(mag) {
  return Math.sqrt(mag) * 5.5;
}
function createMap(earthquakes) {

  // Define map layers
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoors,
    "Satellite Map": satellite,
    "Light Map": lightMap
  };

  // Add a layer for tectonic plates then style the layer
  var tecPlates = new L.LayerGroup();
  var tecStyle = {
    fillOpacity: 0,
    opacity: .5,
    color: '#1E90FF'
  }

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": tecPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2.5,
    layers: [lightMap, earthquakes, tecPlates]
  });
  // Add the fault line data
  d3.json(tecplateUrl, function(plateData) {
      L.geoJSON(plateData, {style: tecStyle, pane: 'lines'})
          
      .addTo(tecPlates);
  })
  // now insert the fault lines behind the earthquake layer
  myMap.createPane('lines');
  myMap.getPane('lines').style.zIndex = 300;

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Make a legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(myMap) {
      let div = L.DomUtil.create('div', 'info legend'),
                mags = [2.0, 3.0, 4.0, 5.0, 6.0], 
                labels = [];
      for (let i = 0; i < mags.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
          mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(myMap); 
}

