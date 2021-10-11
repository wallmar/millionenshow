import './sass/style.scss'

var context = require.context('./images', true, /\.(jpg)$/);
var files={};

context.keys().forEach((filename)=>{
    files[filename] = context(filename);
});

window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', () => {
        let nav = document.getElementById('js-nav')
        let links = document.querySelectorAll('.header__link')

        if(window.scrollY) {
            nav.classList.add('header__bar--scroll')
            nav.classList.remove('header__bar--scroll-top')
        }
        else {
            nav.classList.add('header__bar--scroll-top')
            nav.classList.remove('header__bar--scroll')
        }
    })

    // copyright year in footer
    const copyright = document.getElementById('js-copyright')
    const year = new Date().getFullYear()
    copyright.innerText = year.toString()

    validate()

    initializeLeaflet()
})

function initializeLeaflet() {
    if (!document.querySelectorAll('#leaflet').length)
        return

    const map = new L.Map('leaflet', {
        center: [47.154791, 13.098801],
        zoom: 10,
        scrollWheelZoom: false,
        layers: [
            new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                'attribution': 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            })
        ]
    });
    const marker = L.marker([47.154791, 13.098801]).addTo(map);
}

function validate() {
    const messages = {
        error: (message) => {
            return `
            <button class="delete"></button>
            <p>${message}</p>
`
        },
        success: () => {
            return `
            <button class="delete"></button>
            <p>Die Kontaktanfrage wurde erfolgreich gesendet!</p>
        `
        }
    }

    const validations = {
        required: {
            rule: (value) => {
                return value !== '';
            },
            message: (field) => {
                return `${field} darf nicht leer sein`
            }
        },
        email: {
            rule: (value) => {
                return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
            },
            message: (field) => {
                return `Die E-Mail-Adresse ist ungültig`
            }
        }
    }

    const registerEventListener = (notification) => {
        notification.addEventListener('click', () => {
            notification.remove()
        })
    }

    window.submitForm = () => {
        const form = document.getElementById('form')
        const sendButton = document.getElementById('js-send')

        sendButton.classList.add('is-loading')

        fetch(form.action, {
            method: form.method,
            body: new FormData(form)
        }).then(res => {
            sendButton.classList.remove('is-loading')
            if (res.ok){
                let div = document.createElement("div")
                div.innerHTML = messages.success()
                div.classList.add(...['form__alert', 'notification', 'is-success', 'is-light', 'fade-in'])
                form.appendChild(div)
                registerEventListener(div)
            }
            else {
                let div = document.createElement("div")
                div.innerHTML = messages.error('Es ist ein Fehler aufgetreten, bitte versuchen Sie es später erneut.')
                div.classList.add(...['form__alert', 'notification', 'is-danger', 'is-light', 'fade-in'])
                form.appendChild(div)
                registerEventListener(div)
            }
        })
        form.reset()
    }

    const form = document.getElementById('form');

    if (!form)
        return;

    const inputsArr = form.querySelectorAll('.js-input');

    form.addEventListener('submit', e => {
        e.preventDefault()
        const alerts = document.querySelectorAll('.notification')
        alerts.forEach(alert => {
            alert.remove()
        })

        inputsArr.forEach(input => {
            input.classList.remove('form__error')
        })

        let i = 0;
        while (i < inputsArr.length) {
            let attr = inputsArr[i].getAttribute('data-validation'),
                rules = attr ? attr.split(' ') : '',
                parent = inputsArr[i].closest(".field"),
                j = 0;
            while (j < rules.length) {
                if(rules[j] === 'checked') {
                    if (!inputsArr[i].checked) {
                        e.preventDefault();
                        let div = document.createElement("div")
                        div.innerHTML = messages.error('Den Datenschutzbestimmungen muss zugestimmt werden')
                        div.classList.add(...['form__alert', 'notification', 'is-danger', 'is-light', 'fade-in'])
                        form.appendChild(div)
                        registerEventListener(div)
                        return false;
                    }
                }
                else if(!validations[rules[j]].rule(inputsArr[i].value)) {
                    e.preventDefault();
                    let div = document.createElement("div")
                    div.innerHTML = messages.error(validations[rules[j]].message(inputsArr[i].name))
                    div.classList.add(...['form__alert', 'notification', 'is-danger', 'is-light', 'fade-in'])
                    form.appendChild(div)
                    registerEventListener(div)
                    inputsArr[i].classList.add('form__error')
                    inputsArr[i].focus()
                    return false;
                }
                parent.className = "field";
                j++;
            }
            i++;
        }
        grecaptcha.execute();
    }, false)
}
