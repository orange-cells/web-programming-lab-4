// запуск программы: получение местоположения
function init() {
    if (!localStorage.getItem('currentCity')) {
        if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
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
        console.log("Город из хранилища:", savedCity);    
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

    document.getElementById("cityInputBtn").addEventListener('click', () => {
        const cityValue = document.getElementById("inputCity").value.trim();
        if (cityValue === "") {
            return;
        }
        localStorage.setItem('currentCity', JSON.stringify(cityValue));
        modal.style.display = "none";
        // получение коордиант
        // получение погоды
    })
}

init();
console.log(localStorage)
// localStorage.clear()