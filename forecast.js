const API_KEY = 'af6291a95a09e4ca90d4baa55cbd1798';
const forecastList = document.getElementById('forecast-list');
const cityNameDisplay = document.getElementById('city-name');

// On récupère le choix de l'utilisateur
const selectedCity = localStorage.getItem('selectedCity') || "Vendée";
cityNameDisplay.innerText = "L'avenir à : " + selectedCity;

const lexiquePrevisions = {
    'Clear': "Soulail", 'Rain': "Mouillasse", 'Clouds': "Grisoux",
    'Thunderstorm': "Tounnâ", 'Snow': "Neige", 'Drizzle': "Fouine"
};

async function getForecast() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity},FR&units=metric&lang=fr&appid=${API_KEY}`);
        const data = await res.json();
        
        forecastList.innerHTML = ""; 

        // Filtrer pour avoir 1 point par jour (autour de midi)
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyData.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            const temp = Math.round(day.main.temp);
            const mainCond = day.weather[0].main;
            const patois = lexiquePrevisions[mainCond] || day.weather[0].description;
            const icon = day.weather[0].icon;

            const row = document.createElement('div');
            row.className = 'forecast-row';
            row.innerHTML = `
                <div style="text-align: left;">
                    <div class="day-name">${dayName}</div>
                    <small style="opacity: 0.7;">${patois}</small>
                </div>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="50" alt="icon">
                <span class="day-temp">${temp}°C</span>
            `;
            forecastList.appendChild(row);
        });
    } catch (e) {
        forecastList.innerHTML = "<p>Impossible de lire l'avenir, gâs.</p>";
    }
}

getForecast();