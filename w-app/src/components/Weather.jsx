import React, { useEffect, useState } from 'react';
import './Weather.css';
import { CiSearch } from "react-icons/ci";
import { MdLocationSearching } from "react-icons/md";
import wind_icon from '../assets/wind.jpeg';
import pressure_icon from '../assets/pressure.png';
import humidity_icon from '../assets/humidity.png';
import { GiSunset, GiSunrise } from "react-icons/gi";
import sunnyBg from '../assets/sunny.png';
import coldBg from '../assets/cold.png';
import rainyBg from '../assets/rainy2.png';
import nightBg from '../assets/night5.png'; // Add your night background image

const Weather = () => {
    const [weatherdata, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [city, setCity] = useState("");
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [showForecastCanvas, setShowForecastCanvas] = useState(false);

    const apiKey = '76b203b334d7822a13f70509c13f92d5';

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const search = async (cityName) => {
        if (!cityName) {
            alert("Please enter a city or country to get weather updates.");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            setWeatherData({
                humidity: data.main.humidity,
                windspeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                pressure: data.main.pressure,
                icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                sunrise: formatTime(data.sys.sunrise),
                sunset: formatTime(data.sys.sunset),
                sunriseTimestamp: data.sys.sunrise,
                sunsetTimestamp: data.sys.sunset,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getCurrentLocationWeather = () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();

                setWeatherData({
                    humidity: data.main.humidity,
                    windspeed: data.wind.speed,
                    temperature: Math.floor(data.main.temp),
                    location: data.name,
                    pressure: data.main.pressure,
                    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    sunrise: formatTime(data.sys.sunrise),
                    sunset: formatTime(data.sys.sunset),
                    sunriseTimestamp: data.sys.sunrise,
                    sunsetTimestamp: data.sys.sunset,
                });
            } catch (error) {
                console.error("Error fetching current location weather:", error);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to access location. Please check location settings and try again.");
        });
    };

    const getForecast = async (cityName) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            const dailyForecast = data.list.filter((_, index) => index % 8 === 0).map((forecast) => ({
                date: new Date(forecast.dt * 1000).toLocaleDateString(),
                temperature: Math.floor(forecast.main.temp),
                icon: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`,
            }));

            setForecastData(dailyForecast);
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    const handleForecastClick = () => {
        setShowForecastCanvas(true);
        getForecast(city || "Russia");
    };

    const getBackgroundImage = () => {
        if (!weatherdata) return sunnyBg;
        const { temperature, sunriseTimestamp, sunsetTimestamp } = weatherdata;
        const currentTime = Math.floor(Date.now() / 1000);

        // Determine if it's night based on current time compared to sunrise and sunset
        const isNight = currentTime < sunriseTimestamp || currentTime > sunsetTimestamp;

        if (isNight) return nightBg;
        if (temperature > 25) return sunnyBg;
        if (temperature < 15) return coldBg;
        return rainyBg;
    };

    useEffect(() => {
        search("Russia");
    }, []);

    return (
        <div 
            className='weather' 
            style={{ 
                backgroundImage: `url(${getBackgroundImage()})`, 
                backgroundSize: 'cover', 
                backgroundRepeat: 'no-repeat' 
            }}
        >
            <div className='Search-bar'>
                <input 
                    type="text" 
                    placeholder='Search by city' 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                />
                <CiSearch className='icon' onClick={() => search(city)} />
                <MdLocationSearching className='icon1' onClick={getCurrentLocationWeather} />
            </div>

            {weatherdata && (
                <>
                    <img src={weatherdata.icon} alt="weather icon" width="100px" height="100px" className='image' />
                    <p className='temperature'>{weatherdata.temperature}°c</p>
                    <p className='Location'>{weatherdata.location}</p>
                    <div className='weather-data'>
                        <div className='col'>
                            <img src={humidity_icon} alt="Humidity icon" width="50px" height="50px" />
                            <div className='icons-data'>
                                <p>{weatherdata.humidity} %</p>
                                <span>Humidity</span>
                            </div>
                        </div>
                        <div className='col'>
                            <img src={wind_icon} alt="Wind Speed icon" width="50px" height="50px" />
                            <div className='icons-data'>
                                <p>{weatherdata.windspeed} km/hr</p>
                                <span>Wind Speed</span>
                            </div>
                        </div>
                        <div className='col'>
                            <img src={pressure_icon} alt="Pressure icon" width="50px" height="50px" />
                            <div className='icons-data'>
                                <p>{weatherdata.pressure}</p>
                                <span>Pressure</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowOffCanvas(true)} className="offcanvas-button">Show Sunrise & Sunset</button>
                    <button onClick={handleForecastClick} className="offcanvas-button">Show 5-Day Forecast</button>
                    {showOffCanvas && (
                        <div className={`offcanvas ${showOffCanvas ? 'open' : 'closed'}`}>
                            <button onClick={() => setShowOffCanvas(false)} className="close-btn">Close</button>
                            <div className='main-section'>
                                <div className='sunrise1'>
                                    <p><strong>Sunrise:</strong> {weatherdata.sunrise}</p>
                                    <GiSunrise className='sunrise'/>
                                </div>
                                <div className='sunset1'>
                                    <p><strong>Sunset:</strong> {weatherdata.sunset}</p>
                                    <GiSunset className='sunset'/>
                                </div>
                            </div>
                        </div>
                    )}
                    {showForecastCanvas && (
                        <div className={`forecast-canvas ${showForecastCanvas ? 'open' : 'closed'}`}>
                            <button onClick={() => setShowForecastCanvas(false)} className="close-btn">Close</button>
                            <div className='forecast-section'>
                                {forecastData.map((day, index) => (
                                    <div key={index} className='forecast-item'>
                                        <p><strong>{day.date}</strong></p>
                                        <img src={day.icon} alt="forecast icon" />
                                        <p>{day.temperature}°C</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Weather;
