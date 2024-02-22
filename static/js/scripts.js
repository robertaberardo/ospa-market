var map;
var customActiveLayers = [];
var mouseCoordinates = [];
var currentLayer = null; // sendo Layer toda a definição (mudar para ficar mais claro)


function loadMap() {
  var settings = {
    // latitude: "-30.105896",
    // longitude: "-51.082339",
    latitude: "-23.5556",
    longitude: "-46.6575",
    mapRotation: "0",
    mapZoom: "11",
    showInfo: true,
  };

  mapboxgl.accessToken = 'pk.eyJ1Ijoib3NwYS1wbGFjZSIsImEiOiJjbHN4cTdhNDUwNWswMnJxcHY3MDJtYzV2In0.8q7gysaIMqHDJHZtTGfUDw';

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/ospa-place/cljvsy95s01kl01qmhljh39gr",
    zoom: settings['mapZoom'],
    center: [settings["longitude"], settings["latitude"]],
    bearing: settings["mapRotation"]
  });

  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );

  map.on('mousemove', (e) => {
    mouseCoordinates = e.lngLat;
  });

  return map;
}



function updateMapLayers(layer) {
  currentLayer = layer;
  const layerData = layer[Object.keys(layer)[0]];

  const rendering = layerData.rendering;
  const source = layerData.data.source;
  const popUpReference = rendering.popUp.reference;

  customActiveLayers.map((mapLayerId, index) => {
    map.removeLayer(mapLayerId);
    delete customActiveLayers[index];
  });

  // Remove sources existentes
  const mapSources = Object.keys(map.getStyle().sources);
  mapSources.forEach((mapSource) => {
    if (mapSource.startsWith("data")) {
      map.removeSource(mapSource);
    }
  });

  // Adiciona nova layer
  var sourceName = "data"

  map.addSource(sourceName, {
    type: "vector",
    tiles: [source],

  });

  if (rendering && rendering.layer) {
    rendering.layer.styles.forEach((layerStyle) => {

      // Considera o source da layer o sourceName, 
      // e não o source original enviado. 
      layerStyle.source = sourceName

      map.addLayer(layerStyle);
      customActiveLayers.push(layerStyle.id);
    });
  }

  // Popup
  map.on("click", popUpReference, (e) => {
    const props = e.features[0].properties;
    new mapboxgl.Popup().setLngLat(mouseCoordinates).setHTML(formatJSONToHTML(props)).addTo(map);
  });

  map.on("mouseenter", popUpReference, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", popUpReference, () => {
    map.getCanvas().style.cursor = "";
  });


  // Dados
  map.on("move", function () {
    // Call the function to update the right sidebar with features
    if (currentLayer) {
      updateRightSidebarWithFeatures(currentLayer);
    }
  });


}


function loadLayersData() {
  /**
   * Makes a request to the AWS API to obtain information about layer styles and rendering.
   */

  var data = NewDevelopmentsPointsLayer
  var layerData = { [data.id]: data }
  var layerID = Object.keys(layerData)[0]
  updateMapLayers(layerData);
  showFilterOptions(layerID);

  delay(700).then(() => {
    updateRightSidebarWithFeatures(layerData)
  })

}


// https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
// https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
// Because features come from tiled vector data,
// feature geometries may be split
// or duplicated across tile boundaries.
// As a result, features may appear
// multiple times in query results.
// O código foi modificado 
function getUniqueFeatures(features, comparatorProperty) {
  const uniqueIds = new Set();
  const uniqueFeatures = [];
  for (const feature of features) {
    const id = feature.properties[comparatorProperty];
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id);
      uniqueFeatures.push(feature);
    }
  }
  return uniqueFeatures;
}


function getLayerNameFromLayer(layer) {
  const layerData = layer[Object.keys(layer)[0]];
  return layerData.rendering.popUp.reference; // TODO entender se vamos usar esse mesmo
}

function updateRightSidebarWithFeatures(layer) {

  const renderedFeatures = map.queryRenderedFeatures({ layers: [getLayerNameFromLayer(layer)] });

  // Esse código é temporário, mas usa a primeira propiedade para comparar as features
  // Isso não funciona sempre, quando a primeira propriedade tem valores distitos 
  if (renderedFeatures && renderedFeatures.length > 0) {
    var uniqueFeatures = getUniqueFeatures(renderedFeatures, Object.keys(renderedFeatures[0].properties)[0]);
    var layerID = Object.keys(layer)[0]
    plotCharts(layerID, uniqueFeatures)
  } else {
    plotCountIndicator(layerID, [])
  }
}

function plotCountIndicator(layerID, features) {
  // DEFAULT COUNT CHART
  const rightSidebar = document.getElementById("right_sidebar");
  // Remove div elements with IDs starting with "plot-div"

  const plotDivs = rightSidebar.querySelectorAll("[id^='plot-div']");
  plotDivs.forEach(div => div.remove()); // Limpa conteúdo existenet


  const plotDiv = document.createElement("div")
  plotDiv.setAttribute("id", "plot-div-count");
  plotDiv.setAttribute("class", "chart");

  // precisou ser antes se não PLotly reclama
  rightSidebar.appendChild(plotDiv)

  var data = [
    {
      type: "indicator",
      mode: "number",
      value: features.length,
    },
  ];

  var layout = {
    // grid: {rows: 1, columns: 2, pattern: 'independent'},
    paper_bgcolor: '#ffffff',
    width: 100,
    height: 100,
    margin: { t: 30, b: 30, l: 0, r: 0 }
  };

  Plotly.react('plot-div-count', data, layout);
}


function plotCharts(layerID, features) {

  plotCountIndicator(layerID, features);

  // para controle da posição
  const rightSidebar = document.getElementById("right_sidebar");
  const currentScrollPosition = rightSidebar.scrollTop;

  if (layersExtraData.hasOwnProperty(layerID)) {
    layersExtraData[layerID].loadCharts(features);
    rightSidebar.scrollTop = currentScrollPosition;

  } else {

  }
}
