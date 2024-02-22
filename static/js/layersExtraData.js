const placeColor = '#006e52'
const layoutDefault = {
    font: {
        size: 10
    },
}

function average(array) {
    return array.reduce((x, y) => x + y) / array.length
}

function getValuesFromFeatureProperty(features, propertyName) {
    return features.map(feature => feature.properties[propertyName]);

}

function getFrequencyArray(features, propertyName) {

    const values = getValuesFromFeatureProperty(features, propertyName);
    const count = {};
    values.forEach(e => count[e] ? count[e]++ : count[e] = 1);

    return count

}

function sortObjectByKey(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((accumulator, key) => {
            accumulator[key] = obj[key];

            return accumulator;
        }, {});
}


function sortObjectByKeyAddMissing(obj, expectedKeys) {
    // Create a copy of the object to avoid modifying the original
    const result = { ...obj };

    // Loop through expected keys
    expectedKeys.forEach((key) => {
        // If the key doesn't exist in the object, set its value to zero
        if (!(key in result)) {
            result[key] = 0;
        }
    });

    // Sort the keys and create a new object
    return Object.keys(result)
        .sort()
        .reduce((accumulator, key) => {
            accumulator[key] = result[key];
            return accumulator;
        }, {});
}

function initChartVars(plotID) {
    const rightSidebar = document.getElementById("right_sidebar");
    var plotDiv = document.createElement("div")
    plotDiv.setAttribute("class", "chart");
    plotDiv.setAttribute("id", plotID);
    rightSidebar.appendChild(plotDiv)

    return { rightSidebar, plotDiv };
}


const NewDevelopmentsPointsLayer = {
    'id': 'marketplaces_new_developments_points',
    'title': 'Lançamentos imobiliários em Pontos',
    'thumbnail': 'https://place-public-apis.s3.amazonaws.com/layers/thumbnails/marketplaces_new_developments.jpeg',
    'data': {
      'availableIn': ['poa', 'fort', 'spc'],
      'restrictions': { 'maxZoom': 19, 'minZoom': 10 },
      'source': 'https://geoserver.ospa.place/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=place-data:marketplaces_new_developments&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}&authkey=c2edb869-a636-4010-92d3-8965f894408d'
    },
    'rendering': {
      'legend': {
        'reference': 'marketplaces_new_developments_points-circle',
        'manipulation': null,
        'style': {
          'title': 'Valor de venda por m²',
          'type': 'gradient',
          'color': {
            'R$ 300/m²': 'rgba(241, 238, 246, 1.0)',
            'R$ 5700/m²': 'rgba(212, 185, 218, 1.0)',
            'R$ 7600/m²': 'rgba(201, 148, 199, 1.0)',
            'R$ 10100/m²': 'rgba(223, 101, 176, 1.0)',
            'R$ 14100/m²': 'rgba(221, 28, 119, 1.0)',
            'R$ 27700/m²': 'rgba(152, 0, 67, 1.0)'
          },
          'sorting_type': 'ascendent'
        }
      },
      'popUp': {
        'reference': 'marketplaces_new_developments_points-circle',
        'exclude': null
      },
      'layer': {
        'styles': [{
          'id': 'marketplaces_new_developments_points-circle',
          'type': 'circle',
          'source': 'data',
          'minzoom': 0,
          'maxzoom': 24,
          'paint': {
            'circle-color': ['case',
              ['has', 'min_price_per_sqr_meter'],
              ['case',
                ['boolean', ['feature-state', 'hover'], false],
                'black',
                ['interpolate',
                  ['linear'],
                  ['get', 'min_price_per_sqr_meter'],
                  300,
                  'rgba(241, 238, 246, 1.0)',
                  5700,
                  'rgba(212, 185, 218, 1.0)',
                  7600,
                  'rgba(201, 148, 199, 1.0)',
                  10100,
                  'rgba(223, 101, 176, 1.0)',
                  14100,
                  'rgba(221, 28, 119, 1.0)',
                  27700,
                  'rgba(152, 0, 67, 1.0)']],
              'rgba(241, 238, 246, 1.0)'],
            'circle-radius': ['interpolate',
              ['exponential', 1.2],
              ['zoom'],
              0,
              2,
              22,
              20],
            'circle-stroke-color': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              'black',
              'black'],
            'circle-stroke-width': ['interpolate',
              ['exponential', 1.2],
              ['zoom'],
              0,
              0.2,
              18,
              1],
            'circle-opacity': 1,
            'circle-stroke-opacity': 1
          },
          'source-layer': 'marketplaces_new_developments'
        }]
      }
    }
  }




const layersExtraData = {
    "marketplaces_new_developments_points": {
        loadCharts: (features) => {
            var values = getValuesFromFeatureProperty(features, "min_price_per_sqr_meter").sort(function (a, b) {
                return a - b;
            });
            var avg = average(values)
            var getColor = d3.scaleLinear()
                .domain([values[0], avg, values[values.length - 1]])
                .range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);

            var interpolatedColors = values.map(getColor);

            // PRIMERIRO 
            var plotID = "plot-div-1";
            initChartVars(plotID);

            var data = [
                {
                    type: "indicator",
                    mode: "number",
                    value: avg,

                },
            ];

            var layout = {
                width: 200,
                height: 100,
                margin: { t: 30, b: 30, l: 0, r: 0 }
            };

            Plotly.react(plotID, data, layout);

            // SEGUNDO
            var plotID = "plot-div-2";
            initChartVars(plotID);


            // console.log()
            // console.log(values)
            var data = [
                {
                    y: values,
                    type: 'bar',
                    marker: {
                        color: interpolatedColors,
                        opacity: 0.5
                    }

                }
            ];

            var layout = {
                width: 570,
                yaxis: {
                    autorange: false,
                    range: [0, 35000],
                    type: 'linear'
                }
            }

            
            Plotly.react(plotID, data, layout);

        },
        filterOptions: {
            "min_price_per_sqr_meter": {
                "is_in_range": [
                    [
                        8.999601,
                        1809327
                    ]
                ]
            }
        }
    }
}



