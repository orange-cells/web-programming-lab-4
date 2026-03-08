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
                // получение погоды
            },

            () => {
                showModal();
            }
        );
        } else {
            showModal();
        }
    }
    const savedCity = JSON.parse(localStorage.getItem('currentCity'));
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
    modalText.textContent = "не получилось определить ваше местоположение";

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
        localStorage.setItem('currentLatitude', JSON.stringify(coords.latitude));
        localStorage.setItem('currentLongitude', JSON.stringify(coords.longitude));
        localStorage.setItem('currentCity', JSON.stringify(cityValue));
        modal.style.display = "none";
        // получение погоды
    })
}

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

init();
console.log(localStorage)
// localStorage.clear()