import { apiKey } from "./firebaseconfig.js";

async function searchLocation(query, listId) {
    if(query.length < 3) {
        return;
    }
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${query}&format=json`

    try {
        const response = await fetch(url);
        const data = await response.json();

        const suggestionList = document.getElementById(listId);
        suggestionList.innerHTML = "";

        data.forEach((place) => {
            const li = document.createElement("li");
            li.textContent = place.display_name;
            li.onclick = () => selectLocation(place, listId);
            suggestionList.appendChild(li);
        });
    }

    catch(error) {
        console.error("Error fetching location data: ", error);
    }
}

function selectLocation(place, listId) {
    const inputField = listId === "from-list" ? "from" : "to";
    document.getElementById(inputField).value = place.display_name;

    document.getElementById(inputField).dataset.lat = place.lat;
    document.getElementById(inputField).dataset.lon = place.lon;

    document.getElementById(listId).innerHTML = "";
}

window.searchLocation = searchLocation;