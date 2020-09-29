getStoredSearches = () => {
    //Clear the current stored searches.
    storedSearches = [];

    //Go through each item in local stroage. 
    for(let item in localStorage) {
        let thisItem = String(item); 
        
        //If not null or undefined, store in an array. 
        if(localStorage.getItem(thisItem) && thisItem.includes("WeatherAppSearchId")) {
            storedSearches.push(JSON.parse(localStorage.getItem(thisItem))); 
        }
    }

    //Display the stored searches in HTML.
    dispalyStoredSearches(); 
}

dispalyStoredSearches = () => {
    //Create an element for each of the retrieved searches.

    //Display the most recent search.
    mostRecent.innerText = JSON.parse(localStorage.getItem("WeatherAppSearchMostRecent")); 

    //Clear the current items from the added searches. 
    addedSearches.innerHTML = ""; 

    //Display other searches in the dropdown. 
    for(let searchIndex = 0; searchIndex < storedSearches.length; searchIndex++) {
        //If this is the most recent search, don't repeat it in the list.
        if(storedSearches[searchIndex] === mostRecent.innerText) continue; 
        //Create an a element for each item in the dropdown from the local storage list.
        const thisSearch = document.createElement("a"); 
        thisSearch.classList.add("dropdown-item"); 
        thisSearch.setAttribute("href","#"); 
        thisSearch.innerText = storedSearches[searchIndex]; 
        addedSearches.appendChild(thisSearch); 
    }

    //When a user clicks a drop-down item, fill it into the search bar. 
    const dropDownItems = document.querySelectorAll(".dropdown-item"); 
    dropDownItems.forEach((dropDown) => {
        dropDown.addEventListener("click", event => { 
            //If a user clicks a drop down item, fill in the search field and construct the query string. 
            searchInput.value = event.target.innerText;
            constructQueryString(); 
        }); 
    }); 
}