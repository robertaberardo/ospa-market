const updateLayerIsInFilter = (key, changeData) => {
    // https://docs.mapbox.com/mapbox-gl-js/example/filter-symbols-expression/
  
    // const popUpReference = layerData.rendering.popUp.reference; // TODO entender se vamos usar esse mesmo
  
    // get an array of icon names that corresponds to the currently checked checkboxes
    const resultObject = {};
  
  
    // TODO: Isso daqui vai vir outros valores, mas para protótipo funciona
    const checkedSymbols = [...document.getElementsByTagName('input')]
      .filter((el) => el.checked)
      .map((el) => el.id);
  
  
    checkedSymbols.forEach(symbol => {
      const [key, value] = symbol.split("__");
      if (!resultObject[key]) {
        resultObject[key] = [];
      }
      resultObject[key].push(value);
    });
  
    // CASO NÃO TENHA NENHUM ITEM DAS OPÇÕES MARCADO, Adiciona item vazio
    const layerID = Object.keys(currentLayer)[0]
    const filterOptions = layersExtraData[layerID].filterOptions
    const keysWithIsIn = Object.keys(filterOptions).filter(key => "is_in" in filterOptions[key]);
    keysWithIsIn.forEach(key => {
      if (!resultObject[key]) {
        resultObject[key] = [];
      }
    })
  
  
  
    var filterExpression = ["all"]
  
    Object.entries(resultObject).forEach(([key, value]) => {
      filterExpression.push(['in', key, ...value])
    })
  
    map.setFilter(getLayerNameFromLayer(currentLayer), filterExpression);
    delay(1000).then(() => {
      updateRightSidebarWithFeatures(currentLayer)
    })
  };
  
  
  const updateLayerIsInRangeFilter = (key, changeData) => {
  
    var minValue = document.getElementById(`${key}__minNumber`).value
    var maxValue = document.getElementById(`${key}__maxNumber`).value
  
    var filterExpression = ['all']
  
    if (minValue) {
      filterExpression.push(['>', ['get', key], parseFloat(minValue)])
    }
  
    if (maxValue) {
      filterExpression.push(['<', ['get', key], parseFloat(maxValue)])
    }
  
    // TODO Não considera o total de filtros, problema! 
    map.setFilter(getLayerNameFromLayer(currentLayer), filterExpression);
    delay(1000).then(() => {
      updateRightSidebarWithFeatures(currentLayer)
    })
  
  };
  
  function showFilterOptions(layerID) {
  
    if (layersExtraData.hasOwnProperty(layerID)) {
  
      var filterOptions = layersExtraData[layerID].filterOptions
      const rightSidebar = document.getElementById("right_sidebar");
      // Remove div elements with IDs starting with "plot-div"
      const plotDivs = rightSidebar.querySelectorAll("[class^='filter']");
      plotDivs.forEach(div => div.remove()); // Limpa conteúdo existente
  
      // Create a container div for each filter option
      var filterContainer = document.createElement("div");
      filterContainer.className = "filter-container";
  
      Object.entries(filterOptions).forEach(([key, value]) => {
  
        if (value.hasOwnProperty('is_in_range')) {
          var filterGroup = document.createElement("div");
          filterGroup.className = "filter-group";
  
          // Set the title as the key of the loop
          var title = document.createElement("div");
          title.className = "filter-title";
          title.innerText = key;
          filterGroup.appendChild(title);
  
  
          var newDiv = document.createElement("div");
  
          // Create the first input element
          var inputMin = document.createElement("input");
          inputMin.id = `${key}__minNumber`;
          inputMin.type = "number";
          inputMin.step = "100";
          inputMin.style.width = "70%";
          inputMin.style.padding = "6px";
          inputMin.style.fontSize = "10px";
          inputMin.placeholder = "Mínimo";
  
          // Create the second input element
          var inputMax = document.createElement("input");
          inputMax.id = `${key}__maxNumber`;
          inputMax.type = "number";
          inputMax.step = "100";
          inputMax.style.width = "70%";
          inputMax.style.padding = "6px";
          inputMax.style.fontSize = "10px";
          inputMax.placeholder = "Máximo";
  
          // Create the container div
          var containerDiv = document.createElement("div");
          containerDiv.style.display = "flex";
          containerDiv.style.marginRight = "1rem";
          containerDiv.style.width = "170px";
          containerDiv.style.opacity = "0.7";
  
          // Append the input elements to the container div
          var divMin = document.createElement("div");
          divMin.appendChild(inputMin);
          containerDiv.appendChild(divMin);
  
          var divMax = document.createElement("div");
          divMax.appendChild(inputMax);
          containerDiv.appendChild(divMax);
  
          // Append the container div to the main div
          newDiv.appendChild(containerDiv);
  
          filterGroup.appendChild(newDiv);
          filterContainer.appendChild(filterGroup);
  
          inputMin.addEventListener('change', updateLayerIsInRangeFilter.bind(this, key));
          inputMax.addEventListener('change', updateLayerIsInRangeFilter.bind(this, key));
  
  
  
        }
  
  
      });
  
      rightSidebar.prepend(filterContainer);
  
  
    } else {
  
    }
  }
  
  