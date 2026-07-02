/* ============================================
   SkyCast — Real-Time Weather Dashboard
   Asynchronous JavaScript & RESTful API Logic
   ============================================ */

// ─── Configuration ───────────────────────────────────────────
const CONFIG = {
    API_KEY: '271d1234d3f497eed5b1d80a07b3fcd1',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    ICON_URL: 'https://openweathermap.org/img/wn',
    UNITS: 'metric',
    DEBOUNCE_MS: 400,
    TOAST_DURATION: 5000,
    MAX_SUGGESTIONS: 5,
};

// ─── DOM Element References ──────────────────────────────────
const DOM = {
    searchInput:      document.getElementById('city-search-input'),
    searchBtn:        document.getElementById('search-btn'),
    suggestions:      document.getElementById('search-suggestions'),
    locationBtn:      document.getElementById('location-btn'),
    errorToast:       document.getElementById('error-toast'),
    errorMessage:     document.getElementById('error-message'),
    errorClose:       document.getElementById('error-close'),
    loadingOverlay:   document.getElementById('loading-overlay'),
    welcomeSection:   document.getElementById('welcome-section'),
    dashboard:        document.getElementById('weather-dashboard'),
    cityName:         document.getElementById('city-name'),
    countryName:      document.getElementById('country-name'),
    currentDatetime:  document.getElementById('current-datetime'),
    tempValue:        document.getElementById('temp-value'),
    weatherDesc:      document.getElementById('weather-description'),
    feelsLikeTemp:    document.getElementById('feels-like-temp'),
    weatherIcon:      document.getElementById('weather-icon'),
    tempMax:          document.getElementById('temp-max'),
    tempMin:          document.getElementById('temp-min'),
    humidityValue:    document.getElementById('humidity-value'),
    humidityBar:      document.getElementById('humidity-bar'),
    humidityStatus:   document.getElementById('humidity-status'),
    windValue:        document.getElementById('wind-value'),
    compassNeedle:    document.getElementById('compass-needle'),
    windDirectionText:document.getElementById('wind-direction-text'),
    pressureValue:    document.getElementById('pressure-value'),
    pressureStatus:   document.getElementById('pressure-status'),
    visibilityValue:  document.getElementById('visibility-value'),
    visibilityStatus: document.getElementById('visibility-status'),
    cloudsValue:      document.getElementById('clouds-value'),
    cloudsBar:        document.getElementById('clouds-bar'),
    cloudsStatus:     document.getElementById('clouds-status'),
    sunriseTime:      document.getElementById('sunrise-time'),
    sunsetTime:       document.getElementById('sunset-time'),
    sunPositionDot:   document.getElementById('sun-position-dot'),
    forecastCards:    document.getElementById('forecast-cards'),
    particlesBg:      document.getElementById('particles-bg'),
};

// ─── State ───────────────────────────────────────────────────
let debounceTimer = null;
let toastTimer = null;
let currentAbortController = null;

// ─── Utility Functions ───────────────────────────────────────

/**
 * Returns the full country name from a 2-letter ISO country code.
 * Uses the built-in Intl.DisplayNames API.
 */
function getCountryName(code) {
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return regionNames.of(code);
    } catch {
        return code;
    }
}

/**
 * Formats a Unix timestamp to a localized time string.
 */
function formatTime(unixTimestamp, timezoneOffset) {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    });
}

/**
 * Formats a Unix timestamp to a localized date/time string.
 */
function formatDateTime(unixTimestamp, timezoneOffset) {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    });
}

/**
 * Gets day name from a date string.
 */
function getDayName(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Converts wind degree to compass direction string.
 */
function degToCompass(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}

/**
 * Returns a human-readable status string for humidity percentage.
 */
function getHumidityStatus(humidity) {
    if (humidity < 30) return 'Low — Dry conditions';
    if (humidity < 60) return 'Comfortable';
    if (humidity < 80) return 'Moderate — Slightly humid';
    return 'High — Very humid';
}

/**
 * Returns a human-readable status string for atmospheric pressure.
 */
function getPressureStatus(pressure) {
    if (pressure < 1000) return 'Low pressure — Possible storms';
    if (pressure < 1013) return 'Below normal';
    if (pressure < 1025) return 'Normal';
    return 'High pressure — Clear skies';
}

/**
 * Returns a human-readable status string for visibility distance.
 */
function getVisibilityStatus(visKm) {
    if (visKm < 1) return 'Very poor — Dense fog';
    if (visKm < 4) return 'Poor — Fog or mist';
    if (visKm < 10) return 'Moderate';
    return 'Excellent — Clear';
}

/**
 * Returns a human-readable status for cloud cover percentage.
 */
function getCloudStatus(clouds) {
    if (clouds < 10) return 'Clear sky';
    if (clouds < 25) return 'Few clouds';
    if (clouds < 50) return 'Partly cloudy';
    if (clouds < 85) return 'Mostly cloudy';
    return 'Overcast';
}

/**
 * Calculates the sun's position along the arc (0 = sunrise, 1 = sunset).
 */
function calculateSunPosition(sunrise, sunset, timezoneOffset) {
    const now = Math.floor(Date.now() / 1000) + timezoneOffset;
    const sunriseLocal = sunrise + timezoneOffset;
    const sunsetLocal = sunset + timezoneOffset;

    if (now <= sunriseLocal) return 0;
    if (now >= sunsetLocal) return 1;

    return (now - sunriseLocal) / (sunsetLocal - sunriseLocal);
}

// ─── Background Particles ────────────────────────────────────

function initParticles() {
    const container = DOM.particlesBg;
    const count = 25;
    const colors = [
        'rgba(91, 140, 255, 0.15)',
        'rgba(168, 85, 247, 0.12)',
        'rgba(0, 212, 255, 0.1)',
        'rgba(255, 215, 0, 0.08)',
    ];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(particle);
    }
}

// ─── Error Handling ──────────────────────────────────────────

/**
 * Displays an error toast message with auto-dismiss.
 * Implements comprehensive error handling for failed network requests.
 */
function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorToast.classList.remove('hidden');

    // Clear existing timer
    if (toastTimer) clearTimeout(toastTimer);

    // Auto dismiss after configured duration
    toastTimer = setTimeout(() => {
        hideError();
    }, CONFIG.TOAST_DURATION);
}

function hideError() {
    DOM.errorToast.classList.add('hidden');
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
}

/**
 * Shows the loading overlay.
 */
function showLoading() {
    DOM.loadingOverlay.classList.remove('hidden');
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    DOM.loadingOverlay.classList.add('hidden');
}

// ─── API Fetch Functions (async/await) ───────────────────────

/**
 * Generic fetch wrapper with comprehensive error handling.
 * Uses the modern Fetch API with async/await pattern.
 * Handles network errors, HTTP status errors, and JSON parse errors.
 *
 * @param {string} url - The API endpoint URL
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} On network failure, HTTP error, or invalid JSON
 */
async function fetchJSON(url, signal) {
    try {
        const response = await fetch(url, { signal });

        // Handle HTTP error responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP Error ${response.status}`;

            switch (response.status) {
                case 401:
                    throw new Error('Invalid API key. Please check your configuration.');
                case 404:
                    throw new Error('City not found. Please check the spelling and try again.');
                case 429:
                    throw new Error('Too many requests. Please wait a moment and try again.');
                case 500:
                case 502:
                case 503:
                    throw new Error('Weather service is temporarily unavailable. Please try again later.');
                default:
                    throw new Error(errorMessage);
            }
        }

        // Parse the JSON response — handles complex nested JSON objects
        const data = await response.json();
        return data;

    } catch (error) {
        // Handle AbortController cancellations silently
        if (error.name === 'AbortError') {
            throw error;  // Re-throw so callers can handle
        }

        // Handle network connectivity errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }

        // Re-throw API errors
        throw error;
    }
}

/**
 * Fetches current weather data for a given city name.
 * Demonstrates async/await with the Fetch API.
 *
 * @param {string} city - The city name to search for
 * @returns {Promise<Object>} Current weather data (nested JSON object)
 */
async function fetchCurrentWeather(city) {
    const url = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    return await fetchJSON(url, currentAbortController?.signal);
}

/**
 * Fetches current weather data using geographic coordinates.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
async function fetchWeatherByCoords(lat, lon) {
    const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    return await fetchJSON(url, currentAbortController?.signal);
}

/**
 * Fetches 5-day / 3-hour forecast data for given coordinates.
 * Parses complex nested JSON structure with forecast list.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Forecast data with nested list array
 */
async function fetchForecast(lat, lon) {
    const url = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    return await fetchJSON(url, currentAbortController?.signal);
}

/**
 * Fetches city suggestions from the Geocoding API for autocomplete.
 *
 * @param {string} query - Partial city name
 * @returns {Promise<Array>} Array of location suggestions
 */
async function fetchCitySuggestions(query) {
    const url = `${CONFIG.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${CONFIG.MAX_SUGGESTIONS}&appid=${CONFIG.API_KEY}`;
    return await fetchJSON(url);
}

// ─── Data Processing & Rendering ─────────────────────────────

/**
 * Processes and renders current weather data from the nested JSON response.
 * Extracts data from nested objects: weather[0], main, wind, clouds, sys.
 *
 * @param {Object} data - The raw API response (complex nested JSON)
 */
function renderCurrentWeather(data) {
    // Parse nested JSON structure
    // data.weather is an array of weather condition objects
    const weather = data.weather[0]; // Primary weather condition
    // data.main contains temperature, pressure, humidity (nested object)
    const main = data.main;
    // data.wind contains speed and direction (nested object)
    const wind = data.wind;
    // data.clouds contains cloudiness percentage (nested object)
    const clouds = data.clouds;
    // data.sys contains country code, sunrise/sunset (nested object)
    const sys = data.sys;
    // data.visibility is in meters
    const visibility = data.visibility;
    // data.timezone is the UTC offset in seconds
    const timezone = data.timezone;

    // ── Location & Time ──
    DOM.cityName.textContent = data.name;
    DOM.countryName.textContent = getCountryName(sys.country);
    DOM.currentDatetime.textContent = formatDateTime(data.dt, timezone);

    // ── Primary Temperature ──
    DOM.tempValue.textContent = Math.round(main.temp);
    DOM.weatherDesc.textContent = weather.description;
    DOM.feelsLikeTemp.textContent = `${Math.round(main.feels_like)}°C`;

    // ── Weather Icon ──
    const iconCode = weather.icon;
    DOM.weatherIcon.src = `${CONFIG.ICON_URL}/${iconCode}@4x.png`;
    DOM.weatherIcon.alt = weather.description;

    // ── Temperature Range ──
    DOM.tempMax.textContent = `${Math.round(main.temp_max)}°`;
    DOM.tempMin.textContent = `${Math.round(main.temp_min)}°`;

    // ── Humidity ──
    DOM.humidityValue.textContent = main.humidity;
    DOM.humidityBar.style.width = `${main.humidity}%`;
    DOM.humidityStatus.textContent = getHumidityStatus(main.humidity);

    // ── Wind ──
    DOM.windValue.textContent = wind.speed.toFixed(1);
    const windDeg = wind.deg || 0;
    DOM.compassNeedle.style.transform = `translate(-50%, 0) rotate(${windDeg}deg)`;
    DOM.windDirectionText.textContent = `${degToCompass(windDeg)} (${windDeg}°)`;

    // ── Pressure ──
    DOM.pressureValue.textContent = main.pressure;
    DOM.pressureStatus.textContent = getPressureStatus(main.pressure);

    // ── Visibility ──
    const visKm = (visibility / 1000).toFixed(1);
    DOM.visibilityValue.textContent = visKm;
    DOM.visibilityStatus.textContent = getVisibilityStatus(parseFloat(visKm));

    // ── Cloudiness ──
    DOM.cloudsValue.textContent = clouds.all;
    DOM.cloudsBar.style.width = `${clouds.all}%`;
    DOM.cloudsStatus.textContent = getCloudStatus(clouds.all);

    // ── Sunrise & Sunset ──
    DOM.sunriseTime.textContent = formatTime(sys.sunrise, timezone);
    DOM.sunsetTime.textContent = formatTime(sys.sunset, timezone);

    // ── Sun Arc Position ──
    const sunPos = calculateSunPosition(sys.sunrise, sys.sunset, timezone);
    positionSunDot(sunPos);

    // ── Update page title ──
    document.title = `${data.name} — ${Math.round(main.temp)}°C | SkyCast`;
}

/**
 * Positions the sun indicator dot along the arc based on current time.
 * @param {number} progress - 0 to 1 representing sunrise to sunset
 */
function positionSunDot(progress) {
    // Arc is a semicircle — map progress to angle (π to 0)
    const angle = Math.PI * (1 - progress);
    const arcWidth = 80;
    const arcHeight = 40;
    const x = (arcWidth / 2) + (arcWidth / 2) * Math.cos(angle) - 5;
    const y = -(arcHeight) * Math.sin(angle) - 5;

    DOM.sunPositionDot.style.left = `${x}px`;
    DOM.sunPositionDot.style.top = `${y}px`;
}

/**
 * Processes 5-day forecast data from the complex nested JSON response.
 * The API returns 3-hourly forecasts — we aggregate by day.
 *
 * @param {Object} data - Forecast API response with nested list[]
 */
function renderForecast(data) {
    // data.list is an array of forecast entries (nested JSON)
    // Each entry contains: dt, main{}, weather[], clouds{}, wind{}, etc.
    const dailyMap = new Map();

    // Aggregate 3-hourly data into daily summaries
    for (const entry of data.list) {
        const dateStr = entry.dt_txt.split(' ')[0]; // Extract date portion

        if (!dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, {
                date: dateStr,
                temps: [],
                icons: [],
                descriptions: [],
            });
        }

        const day = dailyMap.get(dateStr);
        day.temps.push(entry.main.temp);
        day.icons.push(entry.weather[0].icon);
        day.descriptions.push(entry.weather[0].description);
    }

    // Take up to 5 future days (skip today if we have enough)
    const days = Array.from(dailyMap.values()).slice(0, 5);

    // Clear existing forecast cards
    DOM.forecastCards.innerHTML = '';

    days.forEach((day) => {
        const maxTemp = Math.round(Math.max(...day.temps));
        const minTemp = Math.round(Math.min(...day.temps));

        // Pick the most common icon for the day (midday preference)
        const middayIndex = Math.min(Math.floor(day.icons.length / 2), day.icons.length - 1);
        const icon = day.icons[middayIndex];
        const desc = day.descriptions[middayIndex];

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="forecast-day">${getDayName(day.date)}</p>
            <img class="forecast-icon" src="${CONFIG.ICON_URL}/${icon}@2x.png" alt="${desc}" loading="lazy">
            <div class="forecast-temp-range">
                <span class="forecast-hi">${maxTemp}°</span>
                <span class="forecast-lo">${minTemp}°</span>
            </div>
            <p class="forecast-desc">${desc}</p>
        `;
        DOM.forecastCards.appendChild(card);
    });
}

// ─── Main Search / Fetch Flow ────────────────────────────────

/**
 * Main function to search weather by city name.
 * Orchestrates multiple async API calls using async/await.
 * Fetches both current weather and 5-day forecast in parallel.
 *
 * @param {string} city - City name to search
 */
async function searchWeather(city) {
    if (!city || !city.trim()) {
        showError('Please enter a city name.');
        return;
    }

    // Cancel any in-flight request
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    showLoading();
    hideSuggestions();

    try {
        // Step 1: Fetch current weather (async/await)
        const currentWeather = await fetchCurrentWeather(city.trim());

        // Step 2: Extract coordinates from response for forecast API
        const { lat, lon } = currentWeather.coord;

        // Step 3: Fetch 5-day forecast in parallel (async/await)
        const forecast = await fetchForecast(lat, lon);

        // Step 4: Render the parsed JSON data to the dashboard
        renderCurrentWeather(currentWeather);
        renderForecast(forecast);

        // Step 5: Show dashboard, hide welcome
        showDashboard();

    } catch (error) {
        if (error.name === 'AbortError') return; // Silently ignore aborted requests
        console.error('Weather fetch error:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    } finally {
        hideLoading();
        currentAbortController = null;
    }
}

/**
 * Fetches weather using the browser's Geolocation API + weather API.
 * Demonstrates async/await with Promise-based geolocation.
 */
async function searchByLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    // Cancel any in-flight request
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    showLoading();

    try {
        // Wrap geolocation callback API in a Promise for async/await usage
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, (err) => {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        reject(new Error('Location access denied. Please allow location access or search by city name.'));
                        break;
                    case err.POSITION_UNAVAILABLE:
                        reject(new Error('Location information is unavailable.'));
                        break;
                    case err.TIMEOUT:
                        reject(new Error('Location request timed out. Please try again.'));
                        break;
                    default:
                        reject(new Error('An unknown error occurred while getting your location.'));
                }
            }, { timeout: 10000 });
        });

        const { latitude: lat, longitude: lon } = position.coords;

        // Fetch current weather and forecast in parallel using Promise.all
        const [currentWeather, forecast] = await Promise.all([
            fetchWeatherByCoords(lat, lon),
            fetchForecast(lat, lon),
        ]);

        renderCurrentWeather(currentWeather);
        renderForecast(forecast);
        showDashboard();

    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Geolocation weather error:', error);
        showError(error.message || 'Failed to get weather for your location.');
    } finally {
        hideLoading();
        currentAbortController = null;
    }
}

// ─── Autocomplete Suggestions ────────────────────────────────

/**
 * Handles search input for autocomplete suggestions.
 * Uses debouncing to avoid excessive API calls.
 *
 * @param {string} query - The current input value
 */
function handleSearchInput(query) {
    // Clear previous debounce
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!query || query.trim().length < 2) {
        hideSuggestions();
        return;
    }

    // Debounce the API call
    debounceTimer = setTimeout(async () => {
        try {
            const suggestions = await fetchCitySuggestions(query.trim());
            renderSuggestions(suggestions);
        } catch (error) {
            // Silently fail for suggestions — non-critical feature
            console.warn('Suggestion fetch failed:', error.message);
            hideSuggestions();
        }
    }, CONFIG.DEBOUNCE_MS);
}

/**
 * Renders the autocomplete suggestion dropdown.
 *
 * @param {Array} suggestions - Array of geocoding results (complex nested objects)
 */
function renderSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    DOM.suggestions.innerHTML = '';

    suggestions.forEach(location => {
        // Each suggestion object contains nested properties: name, country, state, lat, lon
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        const stateStr = location.state ? `, ${location.state}` : '';
        const countryStr = getCountryName(location.country);

        item.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${location.name}${stateStr}</span>
            <span class="suggestion-country">${countryStr}</span>
        `;

        item.addEventListener('click', () => {
            DOM.searchInput.value = location.name;
            hideSuggestions();
            searchWeather(location.name);
        });

        DOM.suggestions.appendChild(item);
    });

    DOM.suggestions.classList.remove('hidden');
}

function hideSuggestions() {
    DOM.suggestions.classList.add('hidden');
    DOM.suggestions.innerHTML = '';
}

// ─── UI State Management ─────────────────────────────────────

function showDashboard() {
    DOM.welcomeSection.classList.add('hidden');
    DOM.dashboard.classList.remove('hidden');

    // Re-trigger card animations
    const cards = DOM.dashboard.querySelectorAll('.metric-card, .forecast-card');
    cards.forEach(card => {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = '';
    });
}

// ─── Event Listeners ─────────────────────────────────────────

// Search button click
DOM.searchBtn.addEventListener('click', () => {
    searchWeather(DOM.searchInput.value);
});

// Enter key in search input
DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWeather(DOM.searchInput.value);
    }
});

// Autocomplete on input
DOM.searchInput.addEventListener('input', (e) => {
    handleSearchInput(e.target.value);
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!DOM.suggestions.contains(e.target) && e.target !== DOM.searchInput) {
        hideSuggestions();
    }
});

// Location button
DOM.locationBtn.addEventListener('click', searchByLocation);

// Error toast close
DOM.errorClose.addEventListener('click', hideError);

// Quick city buttons on welcome screen
document.querySelectorAll('.quick-city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        DOM.searchInput.value = city;
        searchWeather(city);
    });
});

// ─── Initialization ─────────────────────────────────────────

function init() {
    initParticles();
    DOM.searchInput.focus();
}

// Start the app
init();
