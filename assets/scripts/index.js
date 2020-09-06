//Empty variables to hold the user's current latitude/longitude. 
var currentLatitude; 
var currentLongitude; 

//By default, set Fahrenheit to true; 
var fahrenheit = true; 

//HTML element variables.
var currentLocationElement = document.querySelector("#current-location"); 
var tempToggle = document.querySelector("#temp-toggle"); 




//Set initial content of the current location element (#current-location) to waiting message. 
currentLocationElement.innerHTML = "Retrieving Local Coordinates..."; 

//Determine where the user is located. This may take a few seconds to change content of #current-location element.
getCurrentLocation(); 


function getCurrentLocation() {
    //Using the navigator object, pass callback function required for getCurrentPosition method.
    navigator.geolocation.getCurrentPosition(locationRetrieved); 
}

function locationRetrieved(position) {
    //currentLocationElement.innerHTML = `Lat: <span id="latitude">${position.coords.latitude}</span>, Lon: <span id="longitude">${position.coords.longitude}</span>`; 

    //Clear the loading message.
    currentLocationElement.innerHTML = ""; 

    var getLocalWeatherButton = document.createElement("button"); 
    getLocalWeatherButton.setAttribute("type","button");
    getLocalWeatherButton.classList.add("btn","btn-info","btn-sm"); 
    getLocalWeatherButton.setAttribute("id","get-local-weather-button"); 
    getLocalWeatherButton.innerHTML = `Get Local Weather`;  
    currentLocationElement.appendChild(getLocalWeatherButton); 

   

    //currentLatitude = document.querySelector("#latitude").innerText; 
    currentLatitude = position.coords.latitude; 
    //currentLongitude = document.querySelector("#longitude").innerText;
    currentLongitude = position.coords.longitude; 
    console.log(currentLatitude); 
    console.log(currentLongitude); 


    getLocalWeatherButton.addEventListener("click", constructQueryString); 
}

function constructQueryString() {
    //This function will build a request string to be sent to the weather api. 
    console.log(currentLatitude,currentLongitude);
    console.log(event.target.id); 

    //Initialize constant components of the query url. 
    var APIKey = `cad48b62df2e8f5e0daca44aa7d21c78`; 
    var queryString = `https://api.openweathermap.org/data/2.5/weather?`; 

    if(event.target.id === "get-local-weather-button") {
        //If the button pressed was to get local weather data, use latitude and longitude that came from the navigator object in the window.
        queryString += `lat=${currentLatitude}&lon=${currentLongitude}`; 
    } else {
        //PUT LOGIC IN HERE IF CONTENT IS COMING FROM SEARCH BAR(MODIFY QUERY)
    }

    //Add the api key to the end of the query string. 
    queryString += `&appid=${APIKey}`; 

    console.log(queryString); 

    //Using the constructed query string, retrieve the weather data 
    retrieveWeatherData(queryString, APIKey); 
}

function retrieveWeatherData(query, APIKey) {
    //Using the passed in query string, search the weather api for a response. Extract the response using .json, then read the results. 
    fetch(query)
    .then(response => response.json())
    .then(weatherData => {

        //console.log(Date.now() - 86400000); 
        //console.log(Date.now()); 
        //Call for UV data 
        fetch(`http://api.openweathermap.org/data/2.5/uvi/forecast?appid=${APIKey}&lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&cnt=1`)
        //fetch(`http://api.openweathermap.org/data/2.5/uvi/history?appid=${APIKey}&lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&cnt=5&start=${Date.now() - 86400000}&end=${Date.now()}`)
        .then(uvResponse => uvResponse.json())
        .then(uvData => {

            //console.log(weatherData);
            //console.log(uvData); 
            //console.log("something else");
            //Style the header depending on the weather data.  
            styleHeader(weatherData); 
            displayCurrentWeather(weatherData,uvData); 

        }); 

        /*
        console.log(weatherData);
        console.log("something else");
        //Style the header depending on the weather data.  
        styleHeader(weatherData); 
        displayCurrentWeather(weatherData); 
        */
    }); 
    
}

function styleHeader(data) {
    //console.log(data); 
    //console.log(data.weather[0].description); 
    //console.log(data.name); 

    //console.log(document.querySelector("header")); 

    //Insert a random image from Unsplash. 
    document.querySelector("header").style.backgroundImage = `url('https://source.unsplash.com/1600x900/?,${data.weather[0].description},sky,${data.name}')`; 
    //console.log(document.querySelector("header").style); 

    //Style depending on 
}

function displayCurrentWeather(data, uvdata) {

    console.log("WEATHER DATA:",data); 
    console.log("UV DATA:",uvdata); 

    //Clear the current weather data.
    currentLocationElement.innerHTML = ""; 

    //Display current location name.
    var locationOutput = document.createElement("div"); 
    locationOutput.classList.add("main-location"); 
    locationOutput.innerText = data.name; 

    //Add the location to the screen. 
    currentLocationElement.appendChild(locationOutput); 

    //Display the current date. 
    var currentDate = moment().format("dddd, MMMM Do YYYY"); 
    var dateOutput = document.createElement("div"); 
    dateOutput.classList.add("other-info"); 
    dateOutput.innerText = currentDate; 

    //Add the current date to the screen.
    currentLocationElement.appendChild(dateOutput); 

    //Display the description. 
    var descriptionOutput = document.createElement("div"); 
    descriptionOutput.classList.add("main-description"); 
    descriptionOutput.innerText = `- ${data.weather[0].description} -`; 

    //Add the description to the screen.
    currentLocationElement.appendChild(descriptionOutput); 

    //Display current temperature. 
    var tempOutput = document.createElement("div"); 
    tempOutput.classList.add("main-temp"); 

    if(fahrenheit) {
        //If the user is currently selecting F, convert K to F. 
        tempOutput.innerHTML = `<span class="temp">${kToFahrenheit(data.main.temp)}</span>&#176;`; 
    } else {
        //If the user is currently selecting C, convert K to C. 
        tempOutput.innerHTML = `<span class="temp">${kToCelcius(data.main.temp)}</span>&#176;`; 
    }
    
    //Add the temperature to the screen.
    currentLocationElement.appendChild(tempOutput); 

    //Display the current icon. 
    var iconDiv = document.createElement("div"); 
    var iconImage = document.createElement("img"); 
    iconImage.setAttribute("src", `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`); 
    iconDiv.appendChild(iconImage); 

    //Add the icon to the screen. 
    currentLocationElement.appendChild(iconDiv); 

    //Display the humidity. 
    var humidityOutput = document.createElement("div"); 
    humidityOutput.classList.add("other-info"); 
    humidityOutput.innerText = `Humidity: ${data.main.humidity}%`; 

    //Add the humidity to the screen.
    currentLocationElement.appendChild(humidityOutput); 

    //Display the wind speed. 
    var windOutput = document.createElement("div"); 
    windOutput.classList.add("other-info"); 
    windOutput.innerText = `Wind Speed: ${Number(data.wind.speed * 2.237).toFixed(1)} MPH`; 

    //Add the wind speed to the screen.
    currentLocationElement.appendChild(windOutput); 

    //Display the UV Index. 
    var uvOutput = document.createElement("div"); 
    uvOutput.classList.add("other-info"); 
    //Access the UV index and determine safety range. 
    var uvIndex = Math.round(uvdata[0].value); 
    uvOutput.innerText = `UV Index: ${uvIndex}`; 
    if(uvIndex >= 8) {
        uvOutput.innerHTML += `<span class="text-danger"><i class="uv-index"> (Very High)</i></span>`; 
    } else if(uvIndex >= 6) {
        uvOutput.innerHTML += `<span class="text-caution"><i class="uv-index"> (High)</i></span>`;
    } else if(uvIndex >= 3) {
        uvOutput.innerHTML += `<span class="text-warning"><i class="uv-index"> (Moderate)</i></span>`;
    } else {
        uvOutput.innerHTML += `<span class="text-success"><i class="uv-index"> (Low)</i></span>`;
    }

    //Add the UV Index to the screen.
    currentLocationElement.appendChild(uvOutput); 
}

function kToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * (9 / 5) + 32); 
}

function kToCelcius(kelvin) {
    return Math.round(kelvin - 273.15); 
}

function toggleTemperature() {
    //When the user toggles the temperature unit, change the temperatures on the screen.
    
    //Access every element with the class of temp. 
    var elements = document.querySelectorAll(".temp"); 
    //For each element, change to the appropriate unit of measurement. 
    elements.forEach((element) => {
        console.log(element); 

        //Access this particular element's inner temperature measurement. 
        var temp = Number(element.innerText); 
        console.log(temp); 
        //Convert
        if(fahrenheit) {
            element.innerText = Math.round((temp - 32) * (5 / 9)); 
        } else {
            element.innerText = Math.round((temp * (9 / 5)) + 32); 
        }
    }); 

    //Change the value of fahrenheit (true/false). 
    fahrenheit = fahrenheit ? false : true; 
    //console.log("in function"); 
    
}

//EVENTS

tempToggle.addEventListener("click", toggleTemperature); 


