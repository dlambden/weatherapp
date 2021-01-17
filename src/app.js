let apiKey = `3bfeb5b01631989c9755b5bc4d802195`;

let displayTime = document.querySelector(`#display-time`);
let displayCity =  document.querySelector(`#display-location`);
let displayTemperature = document.querySelector(`#display-temp`);
let displayCond = document.querySelector(`#display-cond`);
let displayPrecip = document.querySelector(`#display-precip`);
let displayHumid = document.querySelector(`#display-humid`);
let displayWind = document.querySelector(`#display-wind`);
let celsiusBtn = document.querySelector(`#celsius`);
let fahrenheitBtn = document.querySelector(`#fahrenheit`);
let searchField = document.querySelector(`#search-field`);
let geolocateBtn = document.querySelector(`#geolocate`);

let unit = `metric`;

function updateTime(offset) {
  let now = new Date();
  let localTime = now.getTime();
  let localOffset = now.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let time = new Date(utc + (1000*offset));
  let timeSplit = time.toLocaleString().split(' ');
  let shavedTime = timeSplit[1].slice(0, 5);
  let timeString = `${timeSplit[0]} ${shavedTime} ${timeSplit[2]}`;
  displayTime.innerHTML = timeString;
}


function setMetric(event) {
  unit = `metric`;
}
  
function setImperial(event) {
  unit = `imperial`;
}

function runGeo(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(retrieveWeather); 
}

function searchLocation(event) {
  event.preventDefault();
  let location = document.querySelector(`#location-input`);
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location.value}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(retrieveWeather);
}

function convertC(tempC) {
  return tempC * 1;
}

function retrieveWeather(response) {
  let city = response.data.name;
  let celsius = Math.round(response.data.main.temp);
  let fahrenheit = convertC(celsius);
  let description = response.data.weather[0].description;
  let humidity = response.data.main.humidity;
  let windspeed = response.data.wind.speed;
  let lat = response.data.coord.lat;
  let lon = response.data.coord.lon;
  let offset = response.data.timezone;
  let hourlyForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${apiKey}`;

  axios.get(hourlyForecast).then(function(response) {

    let weatherObj = {
      temperature: {
        celsius,
        fahrenheit
      },
      city,
      description,
      humidity,
      windspeed,
      offset,
      precipitation: (1 - Number(response.data.hourly[0].pop)) * 100 + '%'
    };
    
    updateData(weatherObj);

  });

  
}


function updateData(weatherObj){
  displayCity.innerHTML = weatherObj.city;
  displayTemperature.innerHTML = `${weatherObj.temperature.celsius}°`;
  displayCond.innerHTML = weatherObj.description;
  displayPrecip.innerHTML = weatherObj.precipitation;
  displayHumid.innerHTML = weatherObj.humidity;
  displayWind.innerHTML = weatherObj.windspeed;
  updateTime(weatherObj.offset);
}

searchField.addEventListener("submit", searchLocation);
geolocateBtn.addEventListener("click", runGeo);
celsiusBtn.addEventListener("click", setMetric);
fahrenheitBtn.addEventListener("click", setImperial);

navigator.geolocation.getCurrentPosition(getPosition);
