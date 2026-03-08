function init() {
    if (!localStorage.getItem('currentCity')) {
        if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // логика с полученной локацией
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
    })
}

init();
console.log(localStorage)
// localStorage.clear()