//Empty variables to hold the user's current latitude/longitude. 
var currentLatitude; 
var currentLongitude; 

//HTML element variables.
var currentLocationElement = document.querySelector("#current-location"); 

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
    getLocalWeatherButton.classList.add("btn","btn-primary","btn-sm"); 
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
    retrieveWeatherData(queryString); 
}

function retrieveWeatherData(query) {
    //Using the passed in query string, search the weather api for a response. Extract the response using .json, then read the results. 
    fetch(query)
    .then(response => response.json())
    .then(weatherData => {
        console.log(weatherData);
        console.log("something else"); 
    }); 

    
    
}