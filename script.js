if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js'); });
}

const API_KEY = 'af6291a95a09e4ca90d4baa55cbd1798'; 
// URL mise à jour pour le logo Vendée (format PNG plus léger)
const LOGO_VENDEE = "./logo-85.png";

const lexiqueConditions = { 
    'Clear': "Grand Soulail", 'Rain': "Ça moulle dur", 'Drizzle': "Ça fouine dehors", 
    'Clouds': "Y'a point de soulail", 'Thunderstorm': "Orage", 'Snow': "Y'a du Fré et de la neige"
};
const threats = { 
    'Clear': ["V'là le Soulail !", "O fét un biau temps !"], 
    'Rain': ["O moille, on va êt'tout guenés."], 
    'Clouds': ["O s'abernzit, le temps est grisoux."], 
    'Thunderstorm': ["Le tounnâ s'en vient !"], 
    'Drizzle': ["O guenasse un p'tit peu."],
    'Snow': ["Quel Fré... Couvre-toi !"]
};
const icons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Drizzle': '🌦️' };

const cityInput = document.getElementById('city-input');
const cityOptions = document.getElementById('city-options');

let vendeeCities = []; 

document.getElementById('date').innerText = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

async function init() {
    try {
        const res = await fetch(`https://geo.api.gouv.fr/departements/85/communes?fields=nom,codesPostaux`);
        vendeeCities = await res.json();
        vendeeCities.sort((a, b) => a.nom.localeCompare(b.nom));
    } catch (e) { console.error("Erreur chargement Vendée"); }

    const lastCity = localStorage.getItem('selectedCity') || "La Roche-sur-Yon";
    cityInput.value = lastCity;
    fetchWeather(lastCity);
}

async function handleSearch(query) {
    if (query.length < 2) {
        cityOptions.classList.add('select-hide');
        return;
    }

    const lowerQuery = query.toLowerCase();
    let matches = vendeeCities.filter(c => 
        c.nom.toLowerCase().includes(lowerQuery) || 
        c.codesPostaux.some(cp => cp.startsWith(lowerQuery))
    ).slice(0, 8);

    if (matches.length < 5) {
        try {
            const isCP = /^\d+$/.test(query);
            const url = isCP 
                ? `https://geo.api.gouv.fr/communes?codePostal=${query}&limit=10`
                : `https://geo.api.gouv.fr/communes?nom=${query}&limit=10&fields=nom,codesPostaux`;
            
            const res = await fetch(url);
            const nationalMatches = await res.json();
            
            nationalMatches.forEach(nm => {
                if (!matches.some(m => m.nom === nm.nom)) {
                    matches.push(nm);
                }
            });
        } catch (e) { console.error("Erreur recherche nationale"); }
    }
    renderCityList(matches.slice(0, 12));
}

function renderCityList(cities) {
    cityOptions.innerHTML = "";
    if (cities.length > 0) {
        cityOptions.classList.remove('select-hide');
        cities.forEach(city => {
            let div = document.createElement('div');
            const cp = city.codesPostaux ? city.codesPostaux[0] : "";
            const isVendee = cp.startsWith('85');
            
            // Correction ici : on ajoute l'image avec un fallback (si l'image bug, on ne montre rien)
            div.innerHTML = `
                <span>${city.nom} (${cp})</span>
                ${isVendee ? `<img src="${LOGO_VENDEE}" class="vendee-logo-mini" onerror="this.style.display='none'">` : ''}
            `;
            
            div.onclick = (e) => {
                e.stopPropagation();
                selectCity(city.nom);
            };
            cityOptions.appendChild(div);
        });
    } else {
        cityOptions.classList.add('select-hide');
    }
}

function selectCity(cityName) {
    cityInput.value = cityName;
    cityOptions.classList.add('select-hide');
    fetchWeather(cityName);
    cityInput.blur(); 
}

cityInput.oninput = (e) => handleSearch(e.target.value);
cityInput.onkeydown = (e) => {
    if (e.key === "Enter") {
        const firstOption = cityOptions.querySelector('div');
        if (firstOption) firstOption.click();
        else selectCity(cityInput.value);
    }
};

async function fetchWeather(city) {
    localStorage.setItem('selectedCity', city);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},FR&units=metric&lang=fr&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error();

        const main = data.weather[0].main;
        const temp = Math.round(data.main.temp);

        document.getElementById('temperature').innerText = `${temp}°C`;
        document.getElementById('condition').innerText = temp < 5 ? `Y'a du Fré (${temp}°C)` : (lexiqueConditions[main] || data.weather[0].description);
        document.getElementById('humidity').innerText = `${data.main.humidity}%`;
        document.getElementById('wind').innerText = `${Math.round(data.wind.speed * 3.6)} km/h`;
        document.getElementById('weather-icon').innerText = icons[main] || '🌡️';

        const sayings = threats[main] || ["Je te surveille, mon gâs."];
        document.getElementById('threat-text').innerText = sayings[Math.floor(Math.random() * sayings.length)];
    } catch (e) {
        document.getElementById('threat-text').innerText = "V'la une erreur, mon gâs.";
    }
}

document.onclick = () => cityOptions.classList.add('select-hide');
cityInput.onclick = (e) => {
    e.stopPropagation();
    if (cityInput.value === "") renderCityList(vendeeCities.slice(0, 20));
};

document.getElementById('btn-forecast').onclick = () => { window.location.href = "forecast.html"; };


init();
