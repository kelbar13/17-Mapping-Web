

// Store our API endpoint inside earthquake and tectonic plate urls
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tecplateUrl
// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: :" + feature.properties.mag +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
    
        pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
            {radius: getRadius(feature.properties.mag),
            fillOpacity: .7,
            color: "black",
            stroke: true,
            weight: .5
        })
    }
  });
       
  
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define map layers
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1Ijoia2VsYmFyMTMiLCJhIjoiY2ppYXVoNWk4MTVtbjN3a3p3amhjcG80ZyJ9.IqaKTXtSTTf8lyLE-Q4Njg");
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoors,
    "Satellite Map": satellite,
    "Light Map": lightMap
  };

  // Add a layer for tectonic plates
  var tecPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tecPlates
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
      L.geoJSON(plateData, {
          color: "blue",
          weight: 2
      })
      .addTo(tecPlates);
  })
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Make a legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(myMap) {
      var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 3, 4, 5], 
                labels = [];
      for (var i=0; i < grades.length; i++) {
          div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br' : '+');
      }
      return div;
  };
  legend.addTo(myMap); 
}

function getColor(d) {
    return d > 5 ? '#F30':
    d > 4 ? '#F60':
    d > 3 ? '#F90':
    d > 2 ? '#FC0':
    d > 1 ? '#FF0':
            '#9F3';
}

function getRadius(value) {
    return value*40000
}

