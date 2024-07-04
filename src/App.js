import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import "./index.css";


function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState({
    description: "",
    temp: 0,
    humidity: 0,
    wind_speed: 0,
    country: "",
  });
  const [places, setPlaces] = useState([]);
  const [time, setTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMode = () => {
    setDarkMode(!darkMode);
  };

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const handleClick = () => {
    if (city === "") {
      alert("Please enter a city name");
      return;
    }
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=4eb6447526bde95b480f4f631816ea9e`
      )
      .then((response) => {
        const weatherData = response.data;
        setData({
          description: weatherData.weather[0].description,
          temp: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          wind_speed: weatherData.wind.speed,
          country: weatherData.sys.country,
        });
      })
      .catch((error) => {
        console.error("There was an error fetching the weather data!", error);
        alert("Error fetching weather data. Please try again.");
      });
  };

  const handleVoiceCommand = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCity(transcript);
      handleClick();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.start();
  };

  const fetchPlaces = (type) => {
    if (city === "") {
      alert("Please enter a city name");
      return;
    }

    // Fetch coordinates for the city using OpenStreetMap Nominatim API
    axios
      .get(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`)
      .then((response) => {
        if (response.data.length === 0) {
          alert("City not found. Please enter a valid city name.");
          return;
        }
        const { lat, lon } = response.data[0];
        const foursquareApiKey = "fsq3/XJY15rIeNXj8eSa7snfXrPTaUiVm00cZVKP1rokbgs=";
        const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&query=${type}`;

        return axios.get(url, {
          headers: {
            Accept: 'application/json',
            Authorization: foursquareApiKey,
          },
        });
      })
      .then((response) => {
        if (!response) return;
        const placesData = response.data.results.map((item) => ({
          name: item.name,
          distance: `${(item.distance / 1000).toFixed(2)} km`,
          //working_hours: item.hours ? item.hours.display : "N/A",
          google_maps_url: `https://www.google.com/maps/search/?api=1&query=${item.geocodes.main.latitude},${item.geocodes.main.longitude}`,
        }));
        setPlaces(placesData);
      })
      .catch((error) => {
        console.error(`There was an error fetching the ${type} data!`, error);
        alert(`Error fetching ${type} data. Please try again.`);
      });
  };



//actual code



  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <header>
        <div className="header-left">
          <div className="greeting">{getGreeting()}</div>
        </div>
        <div className="header-right">
          <div className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="time">
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search location"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="button" onClick={handleClick}>
          Search
        </button>
        <button
          className="voice-button"
          onClick={handleVoiceCommand}
          title="Use voice command"
        >
          <FaMicrophone />
        </button>
        <div className="mode-toggle" onClick={toggleMode}>
          {darkMode ? "☀" : "🌙"}
        </div>
      </div>

      <div className="buttons-container">
        <button
          className="fetch-button"
          onClick={() => fetchPlaces("bus station")}
        >
          Bus Stations
        </button>
        <button className="fetch-button" onClick={() => fetchPlaces("airport")}>
          Airports
        </button>
        <button
          className="fetch-button"
          onClick={() => fetchPlaces("restaurant")}
        >
          Restaurants
        </button>
        <button
          className="fetch-button"
          onClick={() => fetchPlaces("fuel station")}
        >
          Fuel Stations
        </button>
        <button className="fetch-button" onClick={() => fetchPlaces("hospital")}>
          Hospitals
        </button>
      </div>

      <main>
        <div className="weather-info">
          <div className="weather-card">
            <div className="weather-details">
              <div className="temperature">{data.temp}°C</div>
              <div className="description">{data.description}</div>
            </div>
            <div className="extra-info">
              <div>Humidity: {data.humidity}%</div>
              <br />
              <div>Wind Speed: {data.wind_speed} km/h</div>
            </div>
          </div>
          <div className="location-card">
            <iframe
              title="map"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCv7fpqfZiDTLwVj5NEObkBEzcyH5TadxA&q=${city}`}
            ></iframe>
          </div>
        </div>
        <div className="places-info">
          {places.map((place, index) => (
            <div key={index} className="place-card">
              <h3>{place.name}</h3>
              <p>Distance: {place.distance}</p>
              
              <a
                href={place.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  //this part of code can be escaped but this is giving approproate css somewhat

//   return (
//     <div className={`container ${darkMode ? "dark-mode" : ""}`}>
//       <header>
//         <div className="header-left">
//           <div className="greeting">{getGreeting()}</div>
//         </div>
//         <div className="header-right">
//           <div className="date">
//             {new Date().toLocaleDateString("en-US", {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}
//           </div>
//           <div className="time">
//             {time.toLocaleTimeString("en-US", {
//               hour: "2-digit",
//               minute: "2-digit",
//               second: "2-digit",
//             })}
//           </div>
//         </div>
//       </header>
  
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search location"
//           value={city}
//           onChange={(e) => setCity(e.target.value)}
//         />
//         <button className="button" onClick={handleClick}>
//           Search
//         </button>
//         <button
//           className="voice-button"
//           onClick={handleVoiceCommand}
//           title="Use voice command"
//         >
//           <FaMicrophone />
//         </button>
//         <div className="mode-toggle" onClick={toggleMode}>
//           {darkMode ? "☀" : "🌙"}
//         </div>
//       </div>
  
//       <div className="buttons-container">
//         <button className="fetch-button" onClick={() => fetchPlaces("bus station")}>
//           Bus Stations
//         </button>
//         <button className="fetch-button" onClick={() => fetchPlaces("airport")}>
//           Airports
//         </button>
//         <button className="fetch-button" onClick={() => fetchPlaces("restaurant")}>
//           Restaurants
//         </button>
//         <button className="fetch-button" onClick={() => fetchPlaces("fuel station")}>
//           Fuel Stations
//         </button>
//         <button className="fetch-button" onClick={() => fetchPlaces("hospital")}>
//           Hospitals
//         </button>
//       </div>
  
//       <div className="main-container">
//         <div className="weather-info">
//           <div className="weather-card">
//             <div className="weather-details">
//               <div className="temperature">{data.temp}°C</div>
//               <div className="description">{data.description}</div>
//             </div>
//             <div className="extra-info">
//               <div>Humidity: {data.humidity}%</div>
//               <br />
//               <div>Wind Speed: {data.wind_speed} km/h</div>
//             </div>
//           </div>
//           <div className="location-card">
//             <iframe
//               title="map"
//               allowFullScreen
//               src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${city}`}
//             ></iframe>
//           </div>
//         </div>
  
//         <div className="places-info">
//           {places.map((place, index) => (
//             <div key={index} className="place-card">
//               <h3>{place.name}</h3>
//               <p>Distance: {place.distance}</p>
//               <p>Working Hours: {place.working_hours}</p>
//               <a
//                 href={place.google_maps_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 View on Google Maps
//               </a>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );



  
 }

export default App;

