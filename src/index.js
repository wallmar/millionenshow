import './sass/style.scss'
import gameConfig from './config/game.json'
import Game from './js/game'

require.context('./images', true, /\.(jpg|webp)$/);
require.context('./audio', true, /\.(mp3)$/);


window.addEventListener('DOMContentLoaded', () => {
    const game = new Game(gameConfig)
    game.round()
})
