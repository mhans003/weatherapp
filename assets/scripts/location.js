getCurrentLocation = () => {
    //Using the navigator object, pass callback function required for getCurrentPosition method.
    navigator.geolocation.getCurrentPosition(locationRetrieved); 
}

locationRetrieved = position => {
    //Callback function for getCurrentPosition. To be executed when the local coordinates are available. 

    //Clear the current location element. 
    currentLocationElement.innerHTML = ""; 

    //Create the button for getting local weather. 
    const getLocalWeatherButton = document.createElement("button"); 
    getLocalWeatherButton.setAttribute("type","button");
    getLocalWeatherButton.classList.add("btn","btn-info","btn-sm","mt-2"); 
    getLocalWeatherButton.setAttribute("id","get-local-weather-button"); 
    getLocalWeatherButton.style.animation = "popout 0.5s"; 
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