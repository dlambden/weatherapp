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

let weatherObj = {};
let forecastArr = [];
let globalUnits = 'metric';


function updateTime() {
  let offset = weatherObj.offset;
  let now = new Date();
  let localTime = now.getTime();
  let localOffset = now.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let time = new Date(utc + (1000*offset));
  let timeSplit = time.toLocaleString().split(' ');
  let shavedTime = timeSplit[1].slice(0,-3);
  let timeString = `${timeSplit[0]} ${shavedTime} ${timeSplit[2]}`;
  displayTime.innerHTML = timeString;
}

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
  for (let i = 0; i < forecastArr.length; i++) {
    parseIndex(forecastArr[i], i);
  }
  updateData();
}

function convertC(tempC) {
  return (Math.round(tempC * 1.8)+32);
}

function geoHandler(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  axios.get(weatherUrl).then(retrieveWeather).catch(function(error) {
    alert("geolocate failed");
  });
  let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=40&appid=${apiKey}&units=metric`;
  axios.get(forecastUrl).then(retrieveForecast);
}

function searchHandler(event) {
  event.preventDefault();
  let location = document.querySelector(`#location-input`);
  // check if location.value is valid??
  let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location.value}&appid=${apiKey}&units=metric`;
  let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location.value}&cnt=40&appid=${apiKey}&units=metric`;
  axios.get(forecastUrl).then(retrieveForecast).catch(function(error) {
    alert("search failed");
  });
  axios.get(weatherUrl).then(retrieveWeather);  
  searchField.reset();
}

function retrieveWeather(response) {
  let city = response.data.name;
  let country = response.data.sys.country;
  let celsius = Math.round(response.data.main.temp);
  let fahrenheit = convertC(celsius);
  let conditions = response.data.weather[0].description;
  let description = response.data.weather[0].main;
  let humidity = response.data.main.humidity;
  let kmh = Math.round(response.data.wind.speed);
  let mph = Math.round(response.data.wind.speed * 1.6);
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

function retrieveForecast(response) {
  forecastArr = [];
  let initData = response.data.list;
  let avgArr = initData.slice();

  for (let i = 3; i < initData.length; i+=8) {
    let dayBlock = avgArr.slice(0,8);
    let returnObj = { ...initData[i] };
    avgArr = avgArr.slice(8);
    let tempHigh;
    let tempLow;

    for (let j = 0; j < dayBlock.length; j++) {
      let day = dayBlock[j];
      let high = day.main.temp_max;
      let low = day.main.temp_min;

      if (tempHigh === undefined || high > tempHigh) {
        tempHigh = high;
      }
      if (tempLow === undefined || low < tempLow) {
        tempLow = low;
      }
    }
    returnObj.main.temp_max_C = Math.round(tempHigh);
    returnObj.main.temp_min_C = Math.round(tempLow);
    returnObj.main.temp_max_F = convertC(tempHigh);
    returnObj.main.temp_min_F = convertC(tempLow);
    forecastArr = [...forecastArr, returnObj];
  }
  if (forecastArr.length === 5) {
    for (let i = 0; i < 5; i++) {
      parseIndex(forecastArr[i], i);
    }
  }
}

function parseIndex(data, index) {
  let dateElem = document.getElementById(`date${index+1}`);
  let imgElem = document.getElementById(`img${index+1}`);
  let tempElem = document.getElementById(`temp${index+1}`);
  let descElem = document.getElementById(`desc${index+1}`);
  let dateSplit = data.dt_txt.split(' ');
  let shavedDate = dateSplit[0].slice(5,10).split("-").join("/");
  dateElem.innerText = shavedDate;
  descElem.innerText = data.weather[0].description;
  imgElem.src = calcIcon(data.weather[0].main, true);
  tempElem.innerText = globalUnits === 'metric' 
    ? `${data.main.temp_min_C}\n${data.main.temp_max_C}` 
    : `${data.main.temp_min_F}\n${data.main.temp_max_F}`;
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
  mainPic.src = calcIcon(weatherObj.description);
}

function calcIcon(test, forecast=false) {
  let sunUp = forecast ? true : (Date.now() >= (weatherObj.sunrise*1000) && Date.now() < (weatherObj.sunset*1000));
  if (test === "Clear") {
    return sunUp ? "img/ico/day_clear.svg" : "img/ico/night_half_moon_clear.svg";
  } 
  else if (test === "Clouds") {
    return sunUp ? "img/ico/day_partial_cloud.svg" : "img/ico/night_half_moon_partial_cloud.svg";
  }
  else if (test === "Rain") {
    return sunUp ? "img/ico/rain.svg" : "img/ico/rain.svg";
  }
  else if (test === "Drizzle") {
    return sunUp ? "img/ico/day_rain.svg" : "img/ico/night_half_moon_rain.svg";
  }
  else if (test === "Snow") {
    return sunUp ? "img/ico/snow.svg" : "img/ico/night_half_moon_snow.svg";
  }
  else if (test === "Thunderstorm") {
    return sunUp ? "img/ico/rain_thunder.svg" : "img/ico/night_half_moon_rain_thunder.svg";
  } else {
    return "img/ico/mist.svg";
  }
}

searchField.addEventListener("submit", searchHandler);
geolocateBtn.addEventListener("click", geoHandler);
tempBtn.addEventListener("click", toggleTempHandler);

navigator.geolocation.getCurrentPosition(getPosition);
