
// Added feature to display destination time (calculated with timezone offset)

function updateTime(offset) {
  let now = new Date();
  let localTime = now.getTime();
  let localOffset = now.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let time = new Date(utc + (1000*offset));
  showTime.innerHTML = time.toLocaleString();
}

//Ignore unit conversion functions here, not working yet

function setMetric(event) {
  unit = `metric`;
  }
  
  function setImperial(event) {
  unit = `imperial`;
}

function getPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
  axios.get(apiUrl).then(updateWeather, updateTime()); 
}

function runGeo(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getPosition);
}

function findLocation(event) {
  event.preventDefault();
  let location = document.querySelector(`#location-input`);
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location.value}&appid=${apiKey}&units=${unit}`;
  axios.get(apiUrl).then(updateWeather);
}

function updateWeather(response) {
  let temperature = Math.round(response.data.main.temp);
  showCity.innerHTML = response.data.name;
  showTemperature.innerHTML = `${temperature}°`;
  showCond.innerHTML = response.data.weather[0].description;
  let offset = response.data.timezone;
  updateTime(offset);
}

let apiKey = `3bfeb5b01631989c9755b5bc4d802195`;

let unit = `metric`;

let showCity =  document.querySelector(`#display-location`);
let showTemperature = document.querySelector(`#display-temp`);
let showCond = document.querySelector(`#display-cond`);
let showTime = document.querySelector(`#display-time`);
let celsius = document.querySelector(`#celsius`);
let fahrenheit = document.querySelector(`#fahrenheit`);
let searchLocation = document.querySelector(`#search-location`);
let geolocate = document.querySelector(`#geolocate`);

navigator.geolocation.getCurrentPosition(getPosition);
searchLocation.addEventListener("submit", findLocation);
geolocate.addEventListener("click", runGeo);
celsius.addEventListener("click", setMetric);
fahrenheit.addEventListener("click", setImperial);
