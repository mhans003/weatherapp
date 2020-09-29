//Empty variables to hold the user's current latitude/longitude. 
let currentLatitude; 
let currentLongitude; 

//By default, set Fahrenheit to true; 
let fahrenheit = true; 

//Set the number of desired forecasts to be displayed. 
let numForecasts = 5; 

//HTML element variables.
const currentLocationElement = document.querySelector("#current-location"); 
const tempToggle = document.querySelector("#temp-toggle"); 
const searchButton = document.querySelector("#search-button"); 
const searchInput = document.querySelector("#user-input"); 
const alertContainer = document.querySelector("#alert-container"); 
const getLocalDiv = document.querySelector("#get-local"); 
const forecasts = document.querySelector("#forecasts"); 
const mostRecent = document.querySelector("#most-recent"); 
const addedSearches = document.querySelector("#added-searches"); 

//Set initial content of the current location element (#current-location) to waiting message. 
getLocalDiv.innerHTML = "Retrieving Local Coordinates..."; 

//Create array to store the stored searches. 
let storedSearches = []; 

//Load the searched terms from local storage. 
getStoredSearches();

//Determine where the user is located. This may take a few seconds to change content of #current-location element.
getCurrentLocation(); 

//FUNCTIONS

constructQueryString = () => { 
    //This function will build a request string to be sent to the weather api. 

    //Initialize constant components of the query url. 
    let APIKey = `cad48b62df2e8f5e0daca44aa7d21c78`; 
    let queryString = `https://api.openweathermap.org/data/2.5/weather?`; 

    if(event.target.id === "get-local-weather-button") {
        //Empty the search field if there is any text.
        searchInput.value = ""; 
        //If the button pressed was to get local weather data, use latitude and longitude that came from the navigator object in the window.
        queryString += `lat=${currentLatitude}&lon=${currentLongitude}`; 
    } else if(event.target.id === "search-button" || event.target.classList[0] === "dropdown-item") {
        //If the button pressed was the search button or the user selected a dropdown item from recent search, use the search terms. 
        queryString += `q=${searchInput.value}`; 
    }

    //Add the api key to the end of the query string. 
    queryString += `&appid=${APIKey}`; 

    //Using the constructed query string, retrieve the weather data 
    retrieveWeatherData(queryString, APIKey); 
}

retrieveWeatherData = (query, APIKey) => {
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

saveSearch = search => {

    //Create unique key for this search. 
    let searchKey = `WeatherAppSearchId(${moment().valueOf()})`;

    //This will be set to true if we find an instance of this location name already searched.
    let containsSearch = false; 

    //Look at each item in local storage. 
    for(let item in localStorage) {
        //Save this current saved search. 
        let thisSearch = String(item); 

        //If the user's search input matches the current saved item, we know it is already in the search history and can stop looking.
        if(`"${search}"` === localStorage.getItem(thisSearch)) {
            containsSearch = true; 
            break; 
        }
    }

    //If the search term is not already saved, save it into the history. 
    if(!containsSearch && search.length > 0) {
        //Save the search to local storage. 
        localStorage.setItem(searchKey, JSON.stringify(search)); 
    } 

    //Save this as the most recent search if it was typed in.
    if(search.length > 0) {
        let recentKey = `WeatherAppSearchMostRecent`; 
        localStorage.setItem(recentKey, JSON.stringify(search)); 
    }

    //Refill the storedSearches array with the updated search items. 
    storedSearches = getStoredSearches();
}

styleHeader = data => {
    //Insert a random image from Unsplash to better fit the current city. 
    document.querySelector("header").style.backgroundImage = `url('https://source.unsplash.com/1600x900/?,${data.weather[0].description},sky,${data.name}')`; 
}

displayCurrentWeather = (data, uvdata) => {
    //Clear the current weather data.
    currentLocationElement.innerHTML = ""; 

    //Display current location name.
    const locationOutput = document.createElement("div"); 
    locationOutput.classList.add("main-location"); 
    locationOutput.innerText = data.name; 

    //Add the location to the screen. 
    currentLocationElement.appendChild(locationOutput); 

    //Display the current date. 
    let currentDate = moment().format("dddd, MMMM Do YYYY"); 
    const dateOutput = document.createElement("div"); 
    dateOutput.classList.add("other-info"); 
    dateOutput.innerText = currentDate; 

    //Add the current date to the screen.
    currentLocationElement.appendChild(dateOutput); 

    //Display the description. 
    const descriptionOutput = document.createElement("div"); 
    descriptionOutput.classList.add("main-description"); 
    descriptionOutput.innerText = `- ${data.weather[0].description} -`; 

    //Add the description to the screen.
    currentLocationElement.appendChild(descriptionOutput); 

    //Display current temperature. 
    const tempOutput = document.createElement("div"); 
    tempOutput.classList.add("main-temp"); 

    if(fahrenheit) {
        //If the user is currently selecting F, convert K to F. 
        tempOutput.innerHTML = `<span class="temp">${kToFahrenheit(data.main.temp)}</span>&#176;`; 
    } else {
        //If the user is currently selecting C, convert K to C. 
        tempOutput.innerHTML = `<span class="temp">${kToCelcius(data.main.temp)}</span>&#176;`; 
    }

    //Check if hot or cold
    if(kToFahrenheit(data.main.temp) >= 95) {
        tempOutput.classList.add("is-hot"); 
    } else if(kToFahrenheit(data.main.temp) <= 40) {
        tempOutput.classList.add("is-cold"); 
    }
    
    //Add the temperature to the screen.
    currentLocationElement.appendChild(tempOutput); 

    //Display the current icon. 
    const iconDiv = document.createElement("div"); 
    iconDiv.innerHTML = icons[`${data.weather[0].icon}`]; 

    //Add the icon to the screen. 
    currentLocationElement.appendChild(iconDiv); 

    //Display the humidity. 
    const humidityOutput = document.createElement("div"); 
    humidityOutput.classList.add("other-info"); 
    humidityOutput.innerText = `Humidity: ${data.main.humidity}%`; 

    //Add the humidity to the screen.
    currentLocationElement.appendChild(humidityOutput); 

    //Display the wind speed. 
    const windOutput = document.createElement("div"); 
    windOutput.classList.add("other-info"); 
    windOutput.innerText = `Wind Speed: ${Number(data.wind.speed * 2.237).toFixed(1)} MPH`; 

    //Add the wind speed to the screen.
    currentLocationElement.appendChild(windOutput); 

    //Display the UV Index. 
    const uvOutput = document.createElement("div"); 
    uvOutput.classList.add("other-info"); 
    //Access the UV index and determine safety range. 
    let uvIndex = Math.round(uvdata[0].value); 
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

displayForecast = data => {
    //Clear the forecast section.
    forecasts.innerHTML = ""; 

    //Loop through each of the 5 forecasts over 24 hour increments, since the api returns data for every 3 hours. 
    for(let thisForecast = 0; thisForecast < (numForecasts * 8); thisForecast += 8) {
        //Main card. 
        const forecastCard = document.createElement("div"); 
        forecastCard.classList.add("card","mx-auto","mx-xl-2","mb-3"); 

        //Card header for date. 
        const forecastCardHeader = document.createElement("div"); 
        forecastCardHeader.classList.add("card-header","bg-info","text-light"); 
        forecastCardHeader.innerText = formatDate(String(data.list[thisForecast].dt_txt).slice(0,10));

        //Temperature output.
        const forecastTemp = document.createElement("h1"); 
        forecastTemp.classList.add("card-title"); 

        if(fahrenheit) {
            //If the user is currently selecting F, convert K to F. 
            forecastTemp.innerHTML = `<span class="temp">${kToFahrenheit(data.list[thisForecast].main.temp)}</span>&#176;`; 
        } else {
            //If the user is currently selecting C, convert K to C. 
            forecastTemp.innerHTML = `<span class="temp">${kToCelcius(data.list[thisForecast].main.temp)}</span>&#176;`; 
        }

        //Check if hot or cold
        if(kToFahrenheit(data.list[thisForecast].main.temp) >= 95) {
            forecastTemp.classList.add("is-hot"); 
        } else if(kToFahrenheit(data.list[thisForecast].main.temp) <= 40) {
            forecastTemp.classList.add("is-cold"); 
        }

        //Icon
        const forecastIcon = document.createElement("div"); 
        forecastIcon.innerHTML = icons[`${data.list[thisForecast].weather[0].icon}`]; 
        
        //Card body
        const forecastCardBody = document.createElement("div"); 
        forecastCardBody.classList.add("card-body"); 

        //Description of weather for card body. 
        const forecastDescription = document.createElement("h5"); 
        forecastDescription.classList.add("card-text"); 
        forecastDescription.innerText = data.list[thisForecast].weather[0].description; 

        //Humidity for card body. 
        const forecastHumidity = document.createElement("p"); 
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
kToFahrenheit = kelvin => Math.round((kelvin - 273.15) * (9 / 5) + 32); 

kToCelcius = kelvin => Math.round(kelvin - 273.15); 

formatDate = date => { 
    //Formats date returned from API into MM/DD/YYYY format. 
    let year = date.slice(0,4); 
    let month = date.slice(5,7);  
    let day = date.slice(8,10); 
   
    return `${month}/${day}/${year}`; 
}

toggleTemperature = () => {
    //When the user toggles the temperature unit, change the temperatures on the screen.
    
    //Access every element with the class of temp. 
    const elements = document.querySelectorAll(".temp"); 
    //For each element, change to the appropriate unit of measurement. 
    elements.forEach((element) => {
        //Access this particular element's inner temperature measurement. 
        let temp = Number(element.innerText); 
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

renderAlert = () => {
    //Render the alert for invalid search.
    //Clear the alert container in case there is already an alert. 
    alertContainer.innerHTML = ""; 

    //Create the div where the alert will sit. 
    const alertDiv = document.createElement("div"); 
    alertDiv.classList.add("alert","alert-danger","alert-dismissible","fade","show","mt-3");
    alertDiv.setAttribute("role","alert"); 
    alertDiv.innerText = "Error. Enter another location."; 

    //Create the button that will be in the alert for dismissing it.
    const alertButton = document.createElement("button"); 
    alertButton.setAttribute("type","button"); 
    alertButton.classList.add("close"); 
    alertButton.setAttribute("data-dismiss","alert"); 

    //Create the span that will hold the x.
    const alertSpan = document.createElement("span"); 
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



