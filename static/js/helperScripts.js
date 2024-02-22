function formatJSONToHTML(json) {
  let htmlString = '';
  for (const key in json) {
    htmlString += `${key}: ${json[key]}<br>`;
  }
  return htmlString;
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}