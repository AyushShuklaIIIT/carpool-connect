import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import {firebaseConfig, api} from "./firebaseconfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Books a ride by removing the matched ride and the user's ride from the database.
 * Prompts the user for confirmation before proceeding with the booking.
 *
 * @param {string} driver - The driver's name with whom the ride is being booked.
 * @param {string} userRideId - The ID of the user's ride to be removed.
 * @param {string} matchedrideId - The ID of the matched ride to be removed.
 * @returns {void} - Alerts the user upon successful booking and reloads the page. Logs an error and alerts the user if the booking fails.
 */

const bookRide = async(driver, userRideId, matchedrideId) => {
  if(confirm(`Are you sure you want to book a ride with ${driver}?`)) {
    const matchedRideRef = ref(database, `rides/${matchedrideId}`);
    const userRideRef = ref(database, `rides/${userRideId}`);

    try {
      await remove(matchedRideRef);
      await remove(userRideRef);

      alert(`You have successfully booked a ride with ${driver}!`);
      location.reload();
      document.getElementById("chatbox-section").classList.remove("hidden");
    }
    catch(error) {
      console.error("Error removing matched rides: ", error);
      alert("Failed to complete booking. Please try again.");
    }
  }
};

document.getElementById("carpool-form").addEventListener("submit", async(event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const time = document.getElementById("time").value;

  const fromCoords = [
   document.getElementById("from").dataset.lat,
   document.getElementById("from").dataset.lon
  ].map(Number);

  const toCoords = [
    document.getElementById("to").dataset.lat,
    document.getElementById("to").dataset.lon
  ].map(Number);

    const ridesRef = ref(database, "rides");
    const newRideRef = push(ridesRef);

    try {
      await set(newRideRef, {
        id: newRideRef.key,
        name: name,
        from: from,
        to: to,
        fromCoords: fromCoords,
        toCoords: toCoords,
        time: time,
      });
  
      alert("Ride request submitted successfully!");
      document.getElementById("carpool-form").reset();
  
      findMatchingRides(fromCoords, toCoords, newRideRef.key).then((matchRides) => {
        const rideContainer = document.getElementById("ride-container");
        const rideSection = document.getElementById("results");
        rideSection.classList.remove("hidden");
        rideContainer.innerHTML = ``;
        const noResultsMessage = document.getElementById("no-results");
        if(matchRides.length === 0) {
          noResultsMessage.classList.remove("hidden");
          return;
        }
    
        matchRides.forEach((ride) => {
          console.log(`${ride.name} is also travelling on the same route.`);
          const rideCard = document.createElement("div");
          rideCard.classList.add("ride-card");
    
          rideCard.innerHTML = `
            <h3>${ride.name}</h3>
            <p><strong>Pickup:</strong> ${ride.from}</p>
            <p><strong>Dropoff:</strong> ${ride.to}</p>
            <p><strong>Time:</strong> ${ride.time}</p>
            <button class="bookRide">Book Ride</button>
            `;
    
            const bookRideButton = rideCard.querySelector("button");
            bookRideButton.addEventListener("click", () => {
              bookRide(ride.name, newRideRef.key, ride.id);
            });
    
            rideContainer.appendChild(rideCard);
        });
      });
    }

    catch(error) {
      console.log("Error");
      alert("Failed to submit ride request. Please try again after after signing up if you have not done so or wait for the server to respond.");
    }
});

/**
 * Finds and returns a list of rides that match the specified route.
 *
 * @param {string} from - The starting location of the ride.
 * @param {string} to - The destination location of the ride.
 * @param {string} id - The ID of the newly created ride to exclude from matches.
 * @returns {Promise<Array>} - A promise that resolves to an array of matched rides.
 * Logs a message if no matches are found or if an error occurs while retrieving rides.
 */

async function findMatchingRides(fromCoords, toCoords, id) {
  const ridesRef = ref(database, "rides");

  try {
    const snapshot = await get(ridesRef);
    if (snapshot.exists()) {
      const rides = snapshot.val();
      const matchedRides = await filterRides(rides, fromCoords, toCoords, id);

      if (matchedRides.length > 0) {
        console.log("Matched rides:", matchedRides);
        return matchedRides;
      } else {
        console.log("No matching rides found.");
        return [];
      }
    } else {
      console.log("No rides found.");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving rides: ", error);
  }
}

/**
 * Filters rides based on proximity to the specified start and end coordinates.
 *
 * @param {Object} rides - An object containing ride details keyed by ride IDs.
 * @param {Object} fromCoords - The starting coordinates to compare with ride origins.
 * @param {Object} toCoords - The destination coordinates to compare with ride destinations.
 * @param {string} id - The ID of the current ride to exclude from the results.
 * @returns {Promise<Array>} - A promise that resolves to an array of rides that are within 5 km of the specified coordinates.
 */

async function filterRides(rides, fromCoords, toCoords, id) {
  const filteredRides = [];

  for (const rideId of Object.keys(rides)) { 
    const ride = rides[rideId];
    if(ride.id !== id) {
      const rideDistance = await calculateDistance(ride.fromCoords, fromCoords);
      const destinationDistance = await calculateDistance(ride.toCoords, toCoords);

      if(rideDistance < 5000 && destinationDistance < 5000) {
        filteredRides.push(ride);
      }
    }
  }
  return filteredRides;
}

/**
 * Calculates the driving distance between two locations.
 *
 * @param {string} from - The starting location.
 * @param {string} to - The destination location.
 * @returns {Promise<number>} - A promise that resolves to the distance in meters.
 * @throws {Error} - If there is an error in fetching the coordinates or calculating the distance.
 */

async function calculateDistance(from, to) {
  const url = `https://api.openrouteservice.org/v2/matrix/driving-car`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
      "Content-type": "application/json",
      "Authorization": api,
      },
      body: JSON.stringify({
      locations: [from, to],  
      metrics: ["distance"],
      }),
    });

    const data = await response.json();
    return data.distances[0][1];
  }
  catch (error) {
    console.error("Error calculating distance: ", error);
  }
}
