//Empty variables to hold the user's current latitude/longitude. 
var currentLatitude; 
var currentLongitude; 

//By default, set Fahrenheit to true; 
var fahrenheit = true; 

//Set the number of desired forecasts to be displayed. 
var numForecasts = 5; 

//HTML element variables.
var currentLocationElement = document.querySelector("#current-location"); 
var tempToggle = document.querySelector("#temp-toggle"); 
var searchButton = document.querySelector("#search-button"); 
var searchInput = document.querySelector("#user-input"); 
var alertContainer = document.querySelector("#alert-container"); 
var getLocalDiv = document.querySelector("#get-local"); 
var forecasts = document.querySelector("#forecasts"); 
var mostRecent = document.querySelector("#most-recent"); 
var addedSearches = document.querySelector("#added-searches"); 

//Set initial content of the current location element (#current-location) to waiting message. 
getLocalDiv.innerHTML = "Retrieving Local Coordinates..."; 

//Create array to store the stored searches. 
var storedSearches = []; 

//Load the searched terms from local storage. 
getStoredSearches();

//Determine where the user is located. This may take a few seconds to change content of #current-location element.
getCurrentLocation(); 

function getStoredSearches() {
    //Clear the current stored searches.
    storedSearches = [];

    //Go through each item in local stroage. 
    for(var i in localStorage) {
        var thisItem = String(i); 
        //console.log(thisItem); 
        
        //If not null or undefined, store in an array. 
        if(localStorage.getItem(thisItem) && thisItem.includes("WeatherAppSearchId")) {
            storedSearches.push(JSON.parse(localStorage.getItem(thisItem))); 
        }
    }

    //Display the stored searches in HTML.
    dispalyStoredSearches(); 
}

function dispalyStoredSearches() {
    //Create an element for each of the retrieved searches.

    //Display the most recent search.
    mostRecent.innerText = JSON.parse(localStorage.getItem("WeatherAppSearchMostRecent")); 

    //Clear the current items from the added searches. 
    addedSearches.innerHTML = ""; 

    //Display other searches in the dropdown. 
    for(var i = 0; i < storedSearches.length; i++) {
        //If this is the most recent search, don't repeat it in the list.
        if(storedSearches[i] === mostRecent.innerText) continue; 
        //Create an a element for each item in the dropdown from the local storage list.
        var thisSearch = document.createElement("a"); 
        thisSearch.classList.add("dropdown-item"); 
        thisSearch.setAttribute("href","#"); 
        thisSearch.innerText = storedSearches[i]; 
        addedSearches.appendChild(thisSearch); 
    }

    //When a user clicks a drop-down item, fill it into the search bar. 
    var dropDownItems = document.querySelectorAll(".dropdown-item"); 
    dropDownItems.forEach((dropDown) => {
        dropDown.addEventListener("click", function(event) { 
            searchInput.value = event.target.innerText; 
        }); 
    }); 
    
}

function getCurrentLocation() {
    //Using the navigator object, pass callback function required for getCurrentPosition method.
    navigator.geolocation.getCurrentPosition(locationRetrieved); 
}

function locationRetrieved(position) {
    //Callback function for getCurrentPosition. To be executed when the local coordinates are available. 

    //Clear the current location element. 
    currentLocationElement.innerHTML = ""; 

    //Create the button for getting local weather. 
    var getLocalWeatherButton = document.createElement("button"); 
    getLocalWeatherButton.setAttribute("type","button");
    getLocalWeatherButton.classList.add("btn","btn-info","btn-sm","mt-2"); 
    getLocalWeatherButton.setAttribute("id","get-local-weather-button"); 
    getLocalWeatherButton.innerHTML = `Get Local Weather`;  

    //Clear the loading message and replace with the get local weather button.
    getLocalDiv.innerHTML = ""; 
    getLocalDiv.appendChild(getLocalWeatherButton); 
  
    //Access the current latitude and longitude. 
    currentLatitude = position.coords.latitude; 
    currentLongitude = position.coords.longitude; 
   
    //Allow user to click the button to retrieve local weather.
    getLocalWeatherButton.addEventListener("click", constructQueryString); 
}

function constructQueryString() {
    //This function will build a request string to be sent to the weather api. 

    //Initialize constant components of the query url. 
    var APIKey = `cad48b62df2e8f5e0daca44aa7d21c78`; 
    var queryString = `https://api.openweathermap.org/data/2.5/weather?`; 

    if(event.target.id === "get-local-weather-button") {
        //If the button pressed was to get local weather data, use latitude and longitude that came from the navigator object in the window.
        queryString += `lat=${currentLatitude}&lon=${currentLongitude}`; 
    } else if(event.target.id === "search-button") {
        //If the button pressed was the search button, use the search terms. 
        queryString += `q=${searchInput.value}`; 
    }

    //Add the api key to the end of the query string. 
    queryString += `&appid=${APIKey}`; 

    //Using the constructed query string, retrieve the weather data 
    retrieveWeatherData(queryString, APIKey); 
}

function retrieveWeatherData(query, APIKey) {
    //Using the passed in query string, search the weather api for a response. Extract the response using .json, then read the results. 
    fetch(query)
    .then(response => {
        //If there is no found location, throw an error. 
        if(!response.ok) {
            throw new Error("Failed to find a location."); 
        }

        //Clear any error text and move on to next block if successful. 
        alertContainer.innerHTML = ""; 
        return response.json(); 
    })
    .then(weatherData => {
        //Make request to the api for UV data, using the retrieved data coordinates. 
        fetch(`https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${APIKey}&lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&cnt=1`)
        .then(uvResponse => uvResponse.json())
        .then(uvData => {
            //Fetch the 5-day forecast. 
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${APIKey}`)
            .then(forecastResponse => forecastResponse.json())
            .then(forecastData => {
                //Save the current search to search history.
                saveSearch(searchInput.value); 

                //Style the header depending on the weather data.  
                styleHeader(weatherData); 

                //Display the current weather by passing in the main data set, the uv data set, and the forecast data set. 
                displayCurrentWeather(weatherData, uvData); 

                //Display the weather forecast for the next 5 days. 
                displayForecast(forecastData); 
            }); 
        }); 
    })
    .catch(error => {
        //If there is an error, render the alert on the page.
        renderAlert(); 
    }); 
    
}

function saveSearch(search) {

    //Create unique key for this search. 
    var searchKey = `WeatherAppSearchId(${moment().valueOf()})`;

    //This will be set to true if we find an instance of this location name already searched.
    var containsSearch = false; 

    //Look at each item in local storage. 
    for(var i in localStorage) {
        //Save this current saved search. 
        var thisSearch = String(i); 

        //If the user's search input matches the current saved item, we know it is already in the search history and can stop looking.
        if(`"${search}"` === localStorage.getItem(thisSearch)) {
            containsSearch = true; 
            break; 
        }
    }

    //If the search term is not already saved, save it into the history. 
    if(!containsSearch) {
        //Save the search to local storage. 
        localStorage.setItem(searchKey, JSON.stringify(search)); 
    } 

    //Save this as the most recent search. 
    var recentKey = `WeatherAppSearchMostRecent`; 
    localStorage.setItem(recentKey, JSON.stringify(search)); 

    //Refill the storedSearches array with the updated search items. 
    storedSearches = getStoredSearches();
}

function styleHeader(data) {
    //Insert a random image from Unsplash to better fit the current city. 
    document.querySelector("header").style.backgroundImage = `url('https://source.unsplash.com/1600x900/?,${data.weather[0].description},sky,${data.name}')`; 
}

function displayCurrentWeather(data, uvdata) {
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
    iconImage.setAttribute("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`); 
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

function displayForecast(data) {
    //Clear the forecast section.
    forecasts.innerHTML = ""; 

    //Loop through each of the 5 forecasts over 24 hour increments, since the api returns data for every 3 hours. 
    for(var thisForecast = 0; thisForecast < (numForecasts * 8); thisForecast += 8) {
        //Main card. 
        var forecastCard = document.createElement("div"); 
        forecastCard.classList.add("card","mx-auto","mb-3"); 

        //Card header for date. 
        var forecastCardHeader = document.createElement("div"); 
        forecastCardHeader.classList.add("card-header","bg-info","text-light"); 
        forecastCardHeader.innerText = formatDate(String(data.list[thisForecast].dt_txt).slice(0,10));

        //Temperature output.
        var forecastTemp = document.createElement("h1"); 
        forecastTemp.classList.add("card-title"); 

        if(fahrenheit) {
            //If the user is currently selecting F, convert K to F. 
            forecastTemp.innerHTML = `<span class="temp">${kToFahrenheit(data.list[thisForecast].main.temp)}</span>&#176;`; 
        } else {
            //If the user is currently selecting C, convert K to C. 
            forecastTemp.innerHTML = `<span class="temp">${kToCelcius(data.list[thisForecast].main.temp)}</span>&#176;`; 
        }

        //Icon
        var forecastIcon = document.createElement("img"); 
        forecastIcon.setAttribute("src",`https://openweathermap.org/img/wn/${data.list[thisForecast].weather[0].icon}@2x.png`);
        forecastIcon.style.width = "100%"; 
        
        //Card body
        var forecastCardBody = document.createElement("div"); 
        forecastCardBody.classList.add("card-body"); 

        //Description of weather for card body. 
        var forecastDescription = document.createElement("h5"); 
        forecastDescription.classList.add("card-text"); 
        forecastDescription.innerText = data.list[thisForecast].weather[0].description; 

        //Humidity for card body. 
        var forecastHumidity = document.createElement("p"); 
        forecastHumidity.classList.add("card-text"); 
        forecastHumidity.innerText = `Humidity: ${data.list[thisForecast].main.humidity}%`; 

        //Append items. 
        forecastCardBody.appendChild(forecastDescription); 
        forecastCardBody.appendChild(forecastHumidity); 
        forecastCard.appendChild(forecastCardHeader); 
        forecastCard.appendChild(forecastTemp); 
        forecastCard.appendChild(forecastIcon); 
        forecastCard.appendChild(forecastCardBody); 
        forecasts.appendChild(forecastCard); 
    }
} 

//Unit conversion functions
function kToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * (9 / 5) + 32); 
}

function kToCelcius(kelvin) {
    return Math.round(kelvin - 273.15); 
}

function formatDate(date) { 
    //Formats date returned from API into MM/DD/YYYY format. 
    var year = date.slice(0,4); 
    var month = date.slice(5,7);  
    var day = date.slice(8,10); 
   
    return `${month}/${day}/${year}`; 
}

function toggleTemperature() {
    //When the user toggles the temperature unit, change the temperatures on the screen.
    
    //Access every element with the class of temp. 
    var elements = document.querySelectorAll(".temp"); 
    //For each element, change to the appropriate unit of measurement. 
    elements.forEach((element) => {
        //Access this particular element's inner temperature measurement. 
        var temp = Number(element.innerText); 
        //Convert between temperature units. 
        if(fahrenheit) {
            element.innerText = Math.round((temp - 32) * (5 / 9)); 
        } else {
            element.innerText = Math.round((temp * (9 / 5)) + 32); 
        }
    }); 

    //Change the value of fahrenheit (true/false). 
    fahrenheit = fahrenheit ? false : true; 
}

function renderAlert() {
    //Render the alert for invalid search.
    //Clear the alert container in case there is already an alert. 
    alertContainer.innerHTML = ""; 

    //Create the div where the alert will sit. 
    var alertDiv = document.createElement("div"); 
    alertDiv.classList.add("alert","alert-danger","alert-dismissible","fade","show","mt-3");
    alertDiv.setAttribute("role","alert"); 
    alertDiv.innerText = "Error. Enter another location."; 

    //Create the button that will be in the alert for dismissing it.
    var alertButton = document.createElement("button"); 
    alertButton.setAttribute("type","button"); 
    alertButton.classList.add("close"); 
    alertButton.setAttribute("data-dismiss","alert"); 

    //Create the span that will hold the x.
    var alertSpan = document.createElement("span"); 
    alertSpan.setAttribute("aria-hidden","true");
    alertSpan.innerHTML = "&times;"; 
    
    //Append all items. 
    alertButton.appendChild(alertSpan); 
    alertDiv.appendChild(alertButton); 
    alertContainer.appendChild(alertDiv); 
}

//EVENTS

tempToggle.addEventListener("click", toggleTemperature); 
searchButton.addEventListener("click", constructQueryString); 



