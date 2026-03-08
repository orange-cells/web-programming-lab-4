async function start() {  // иначе отрисовывается только после обновления страницы
    const latitude = JSON.parse(localStorage.getItem('currentLatitude'));
    const longitude = JSON.parse(localStorage.getItem('currentLongitude'));
    const city = JSON.parse(localStorage.getItem('currentCity'));
    if (latitude && longitude && city) {
        createWeatherCard(city, latitude, longitude);
    } else {
        init();
    }
    const otherCities = JSON.parse(localStorage.getItem('otherCities'));
    if (otherCities && !(otherCities.length === 0)) {
        otherCities.forEach(async function(city){
            const coords = await getCityCoords(city);
            createWeatherCard(city, coords.latitude, coords.longitude);
        })
    }
}

// запуск программы: получение местоположения
function init() {
    if (!localStorage.getItem('currentCity')) {
        if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                localStorage.setItem('currentLatitude', JSON.stringify(latitude));
                localStorage.setItem('currentLongitude', JSON.stringify(longitude));
                const cityName = await getCityName(latitude, longitude);
                localStorage.setItem('currentCity', JSON.stringify(cityName));
                createWeatherCard(cityName, latitude, longitude);
            },
        () => {
            showModal();
        }
        );
        } else {
            showModal();
        }
    }
}

// получение названия города
async function getCityName(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=ru`);
        const data = await response.json(); 
        const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || "ваше местоположение";
        return city;
    } catch (error) {
        return "ваше местоположение";
    }
}

// просим пользователя ввести свой город
function showModal() {
    const modal = document.createElement('div');
    modal.className = "modal";

    const modalContent = document.createElement('div');
    modalContent.className = "modal-content";

    const modalText = document.createElement('h2');
    modalText.textContent = "введите ваше местоположение";

    const inputCity = document.createElement('input');
    inputCity.id = "inputCity"
    inputCity.type = "text";
    inputCity.placeholder = "введите город";

    const button = document.createElement('button');
    button.id = "cityInputBtn"
    button.textContent = "далее";
    
    modalContent.append(modalText, inputCity, button);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.style.display = "block";

    document.getElementById("cityInputBtn").addEventListener('click', async () => {
        const cityValue = document.getElementById("inputCity").value.trim();
        if (cityValue === "") {
            return;
        }
        const coords = await getCityCoords(cityValue);
        let otherCities = JSON.parse(localStorage.getItem('otherCities'));
        otherCities = otherCities.filter(c => c !== cityValue);
        localStorage.setItem('otherCities', JSON.stringify(otherCities));

        localStorage.setItem('currentLatitude', JSON.stringify(coords.latitude));
        localStorage.setItem('currentLongitude', JSON.stringify(coords.longitude));
        localStorage.setItem('currentCity', JSON.stringify(cityValue));
        modal.style.display = "none";
        if (document.querySelector('.weather-card')){
            document.querySelector('.weather-card').remove();
        }
        createWeatherCard(cityValue, coords.latitude, coords.longitude);
    })
}

// получение координат по названию города
async function getCityCoords(cityName) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            alert ("город не найден")
            throw new Error("город не найден");
        }
        return {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude
        };
    } catch (error) {
        throw error;
    }
}

// получение погоды
async function getWeatherData(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m&forecast_days=3`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка при загрузке погоды");
    return await response.json();
}

async function createWeatherCard(city, lat, long) {
    // функция для нахождения среднего
    const average = array => array.reduce((a, b) => a + b) / array.length;
    // функция для суммы
    function sum(array) {
        let arraySum = 0;
        array.forEach(el => {
            arraySum += el;
        });
        return arraySum;
    }

    // получение прогноза
    const data = (await getWeatherData(lat, long)).hourly;

    const card = document.createElement('div');
    card.classList.add('weather-card');

    const cityName = document.createElement('h2');
    cityName.textContent = city;
    card.appendChild(cityName);

    const columnsContainer = document.createElement('div');
    columnsContainer.classList.add('weather-columns');

    const dayLabels = ['сегодня', 'завтра', 'послезавтра'];
    for (let i = 0; i < 3; i++) {
        let startHour = 0;
        let endHour = 23;
        if (i === 1) {
            startHour = 24;
            endHour = 47;
        } else if (i === 2) {
            startHour = 48;
            endHour = 71;
        }
        const column = document.createElement('div');
        column.classList.add('weather-column');

        // день
        const label = document.createElement('div');
        label.classList.add('day');
        label.textContent = dayLabels[i];

        // контейнер для температуры
        const tempContainer = document.createElement('div');
        tempContainer.classList.add('tempContainer');

        // температура
        const temp = document.createElement('div');
        temp.classList.add('temp');
        temp.textContent = `${average(data.temperature_2m.slice(startHour, endHour)).toFixed(1)}°C`;

        // ощущается как
        const tempFeels = document.createElement('div');
        tempFeels.classList.add('temp');
        tempFeels.textContent = `${average(data.apparent_temperature.slice(startHour, endHour)).toFixed(1)}°C`;
        tempContainer.append(temp, tempFeels)

        // осадки
        const precip = document.createElement('div');
        precip.classList.add('precipitation');
        precip.textContent = `осадки: ${sum(data.precipitation.slice(startHour, endHour)).toFixed(1)} мм`;
       
        // вероятность осадков
        const precipProb = document.createElement('div');
        precipProb.classList.add('precipitation_probability');
        precipProb.textContent = `вероятность осадков: ${average(data.precipitation_probability.slice(startHour, endHour)).toFixed(1)}%`;

        // влажность
        const humidity = document.createElement('div');
        humidity.classList.add('relative_humidity');
        humidity.textContent = `влажность: ${average(data.relative_humidity_2m.slice(startHour, endHour)).toFixed(1)}%`;
        
        // скорость ветра
        const windSpeed = document.createElement('div');
        windSpeed.classList.add('wind_speed');
        windSpeed.textContent = `скорость ветра: ${average(data.wind_speed_10m.slice(startHour, endHour)).toFixed(1)} км/ч`;

        column.append(label, tempContainer, precip, precipProb, humidity, windSpeed);
        columnsContainer.appendChild(column);
    }
    card.appendChild(columnsContainer);
    if (city !== JSON.parse(localStorage.getItem('currentCity'))) {
        const delButton = document.createElement('button');
        delButton.className = "delete-button";
        delButton.textContent = 'x';
        card.appendChild(delButton);
        document.querySelector('.otherCitiesCards').appendChild(card);
        delButton.addEventListener('click', () => {
            let otherCities = JSON.parse(localStorage.getItem('otherCities'));
            otherCities = otherCities.filter(c => c !== city);
            localStorage.setItem('otherCities', JSON.stringify(otherCities));
            card.remove();
        })
    } else {
        document.querySelector('.currentCityCard').appendChild(card);
    }
}

document.getElementById("changeCity").addEventListener('click', () => {
    showModal();
})

function showAddCityModal() {
    const modal = document.createElement('div');
    modal.className = "modal";

    const modalContent = document.createElement('div');
    modalContent.className = "modal-content";

    const modalText = document.createElement('h2');
    modalText.textContent = "введите город";

    const inputCity = document.createElement('input');
    inputCity.id = "inputCity"
    inputCity.type = "text";
    inputCity.placeholder = "сюда введите";

    const button = document.createElement('button');
    button.id = "cityInputBtn"
    button.textContent = "далее";
    
    modalContent.append(modalText, inputCity, button);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.style.display = "block";

    document.getElementById("cityInputBtn").addEventListener('click', async () => {
        const cityValue = document.getElementById("inputCity").value.trim();
        const currentCity = JSON.parse(localStorage.getItem('currentCity'));
        if (cityValue === "" || cityValue === currentCity) {
            alert('введите что-то еще')
            return;
        }
        const coords = await getCityCoords(cityValue);
        modal.style.display = "none";
        const otherCities = JSON.parse(localStorage.getItem('otherCities')) || [];
        if (!otherCities.includes(cityValue)) {
            otherCities.push(cityValue);
            localStorage.setItem('otherCities', JSON.stringify(otherCities));
            createWeatherCard(cityValue, coords.latitude, coords.longitude);
        }    
    })
}

document.getElementById("addCity").addEventListener('click', () => {
    showAddCityModal();
})

start();
console.log(localStorage)
// localStorage.clear()