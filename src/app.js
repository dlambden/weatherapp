let apiKey = `3bfeb5b01631989c9755b5bc4d802195`;

let displayTime = document.querySelector(`#display-time`);
let displayLocation =  document.querySelector(`#display-location`);
let displayTemperature = document.querySelector(`#display-temp`);
let displayCond = document.querySelector(`#display-cond`);
let displayPrecip = document.querySelector(`#display-precip`);
let displayHumid = document.querySelector(`#display-humid`);
let displayWind = document.querySelector(`#display-wind`);
let searchField = document.querySelector(`#search-field`);
let geolocateBtn = document.querySelector(`#geolocate`);

let mainPic = document.getElementById(`mainpic`);
let windUnit = document.querySelector(`#windunit`);
let tempBtn = document.getElementById(`temptoggle`);

let globalUnits = 'metric';

let weatherObj = {};

function toggleTempHandler(e) {
  let check = e.target.innerText;
  if (check === 'C') {
    globalUnits = 'imperial';
    e.target.innerText = 'F';
    windUnit.innerText = 'mph';
  } else {
    globalUnits = 'metric'
    e.target.innerText = 'C';
    windUnit.innerText = 'km/h';
  }

  updateData();
}

function updateTime() {
  let offset = weatherObj.offset;

  let now = new Date();
  let localTime = now.getTime();
  let localOffset = now.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;

  let time = new Date(utc + (1000*offset));
  weatherObj.timeData = time.getTime();

  let timeSplit = time.toLocaleString().split(' ');
  let shavedTime = timeSplit[1].slice(0, 4);
  let timeString = `${timeSplit[0]} ${shavedTime} ${timeSplit[2]}`;

  displayTime.innerHTML = timeString;
}

function geoHandler(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(retrieveWeather); 
}

function searchHandler(event) {
  event.preventDefault();
  let location = document.querySelector(`#location-input`);
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location.value}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(retrieveWeather);
}

function convertC(tempC) {
  return (tempC * 1.8)+32;
}

function retrieveWeather(response) {
  let city = response.data.name;
  let country = response.data.sys.country;
  let celsius = Math.round(response.data.main.temp);
  let fahrenheit = convertC(celsius);
  let conditions = response.data.weather[0].description;
  let description = response.data.weather[0].main;
  let humidity = response.data.main.humidity;
  let kmh = response.data.wind.speed;
  let mph = response.data.wind.speed * 1.6;
  let lat = response.data.coord.lat;
  let lon = response.data.coord.lon;
  let offset = response.data.timezone;
  let sunrise = response.data.sys.sunrise;
  let sunset = response.data.sys.sunset;
  let hourlyForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${apiKey}`;

  axios.get(hourlyForecast).then(function(response) {

    weatherObj = {
      temperature: {
        celsius,
        fahrenheit
      },
      city,
      country,
      conditions,
      description,
      humidity,
      windspeed: {
        kmh,
        mph
      },
      offset,
      sunrise,
      sunset,
      precipitation: (1 - Number(response.data.hourly[0].pop)) * 100 + '%'
    };
    
    updateData();

  });

  
}


function updateData(){
  updateTime();

  displayLocation.innerHTML = `${weatherObj.city}, ${weatherObj.country}`;
  
  displayCond.innerHTML = weatherObj.conditions;
  displayPrecip.innerHTML = weatherObj.precipitation;
  displayHumid.innerHTML = weatherObj.humidity;
  displayWind.innerHTML = globalUnits === 'metric' ? 
  `${weatherObj.windspeed.kmh}` : `${weatherObj.windspeed.mph}`;

  displayTemperature.innerHTML = globalUnits === 'metric' ? 
    `${weatherObj.temperature.celsius}°` : `${weatherObj.temperature.fahrenheit}°`;


  let test = weatherObj.description;
  let sunUp = (
    weatherObj.timeData >= weatherObj.sunrise 
    && weatherObj.timeData < weatherObj.sunset)

  if (test === "Clear") {
  //  sunUp ? "img/ico/day_clear.svg" : "img/ico/night_half_moon_clear.svg";
    mainPic.src = "img/ico/day_clear.svg";
  } 
  else if (test === "Clouds") {
    mainPic.src = "img/ico/cloudy.svg";
  }
  else if (test === "Rain") {
    mainPic.src = "img/ico/rain.svg";
  }
  else if (test === "Drizzle") {
    mainPic.src = "img/ico/day_rain.svg";
  }
  else if (test === "Snow") {
    mainPic.src = "img/ico/snow.svg";
  }
  else if (test === "Thunderstorm") {
    mainPic.src = "img/ico/rain_thunder.svg";
  } else {
    mainPic.src = "img/ico/mist.svg";
  }

}

searchField.addEventListener("submit", searchHandler);
geolocateBtn.addEventListener("click", geoHandler);
tempBtn.addEventListener("click", toggleTempHandler);


navigator.geolocation.getCurrentPosition(getPosition);
