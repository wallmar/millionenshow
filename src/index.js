import './sass/style.scss'

require.context('./images', true, /\.(jpg|webp)$/);
require.context('./audio', true, /\.(mp3)$/);

const AUDIO_PATH = 'audio/'


window.addEventListener('DOMContentLoaded', () => {
    const answers = document.querySelectorAll('.box__answer')
    answers.forEach(answer => {
        answer.addEventListener('click', () => {
            const audio = document.getElementById('audio')
            audio.setAttribute('src', AUDIO_PATH+'1000000_wrong.mp3')
            audio.removeAttribute('loop')
            audio.volume = 0.5
        })
    })
})
