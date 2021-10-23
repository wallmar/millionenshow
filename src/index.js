import './sass/style.scss'
import gameConfig from './config/game.json'
import Game from './js/game'

require.context('./images', true, /\.(jpg|webp|png|cur)$/);
require.context('./audio', true, /\.(mp3)$/);

import Chart from 'chart.js/auto';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game(gameConfig)
    game.init()

    Chart.defaults.font.size = 16
    Chart.defaults.color = '#fff'
    Chart.defaults.scales.linear.min = 0
    Chart.defaults.scales.linear.max = 100
    Chart.defaults.scales.linear.ticks.stepSize = 25
    Chart.defaults.animation.delay = 0
    Chart.defaults.animation.duration = 0

    const ctx = document.getElementById('audienceGraph');
    const audienceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['A', 'B', 'C', 'D'],
            datasets: [{
                data: [25, 25, 25, 25],
                backgroundColor: [
                    'rgb(241,128,0)',
                    'rgb(241,128,0)',
                    'rgb(241,128,0)',
                    'rgb(241,128,0)',
                ],
                maxBarLength: 100,
            }]
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function(value, index, values) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
        }
    });
})
