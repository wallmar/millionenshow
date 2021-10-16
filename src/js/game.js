import AudioManager from "./audioManager";
import Loader from '../js/loader'

export default class Game {
    constructor(gameConfig) {
        this.gameConfig = gameConfig
        this.currentRound = 0
        this.selectedAnswer = null
        this.countDown = 5000
        this.audioManager = new AudioManager()
        this.currentRank = 0
        this.updateRanking()
        this.registerJokers()
    }

    /**
     * @return {{question: string, audioLevel: number, answers:[{text:string,correct:bool,disappears:bool}]}}
     */
    getCurrentRound() {
        return this.gameConfig[this.currentRound]
    }

    getRightAnswerNode() {
        const answerNodes = document.querySelectorAll('.box__answer')
        let rightAnswerNode = null
        answerNodes.forEach((answerNode, key) => {
            if (this.getCurrentRound().answers[key].correct) {
                rightAnswerNode = answerNode
            }
        })
        return rightAnswerNode
    }

    getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: ((rect.left + window.scrollX) + (rect.right + window.scrollX)) / 2,
            top: ((rect.top + window.scrollY) + (rect.bottom + window.scrollY)) / 2
        };
    }

    lastQuestionAction(e) {
        let mouseX = e.pageX
        let mouseY = e.pageY

        const node = this.getRightAnswerNode()
        let nodeX = this.getOffset(node).left
        let nodeY = this.getOffset(node).top

        let diffX = Math.abs(mouseX - nodeX)
        let diffY = Math.abs(mouseY - nodeY)

        let diff = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))

        if (diff < 250) {
            //this.getRightAnswerNode().style.transform = `translate(10px, 10px)`
        }
        else {
            //this.getRightAnswerNode().style.transform = `translate(0px, 0px)`
        }
    }

    round() {
        setTimeout(() => this.updateRanking(), 2000)

        const answerNodes = document.querySelectorAll('.box__answer')
        document.querySelectorAll('.box__question__text')[0].innerHTML = this.getCurrentRound().question

        this.audioManager.setAudioLevel(this.getCurrentRound().audioLevel)
        this.audioManager.playIntro()

        // last question
        if (this.currentRound === this.gameConfig.length - 1 || true) {
            document.onmousemove = ((e) => this.lastQuestionAction(e))
        }

        answerNodes.forEach((answerNode, key) => {
            const answer = this.getCurrentRound().answers[key]

            answerNode.getElementsByClassName('box__option__text')[0].innerHTML = answer.text

            const onClickHandler = () => {
                if (!this.selectedAnswer && !answerNode.classList.contains('box--disabled')) {
                    answerNode.classList.add('box--selected')
                    answerNode.classList.remove('box--unselected')
                    this.selectedAnswer = answer

                    this.audioManager.playSelected()

                    setTimeout(() => {this.checkAnswer(key)}, this.countDown)
                }
            }

            answerNode.addEventListener('click', onClickHandler)
        })
    }

    checkAnswer(key) {
        const rightAnswerNode = this.getRightAnswerNode()

        const interval = setInterval(() => {
            rightAnswerNode.classList.toggle('box--correct')
            rightAnswerNode.getElementsByClassName('box__option')[0].classList.toggle('box__option--correct')
        }, 250)

        document.addEventListener('audioFinished', () => {
            clearInterval(interval)

            if (this.gameConfig.length > this.currentRound + 1) {
                this.cleanup()
                setTimeout(() => {
                    document.querySelectorAll('.container')[0].classList.remove('container--faded')
                    this.round()
                }, 2000)
            }
        })
        /* TODO
        letzte frage (z.B. Hauptstadt von Ö) - richtige Antwort lässt sich nicht anklicken (bewegt sich immer weg)
        davor ca. 30 sekunden mit Countdown (ohne Container mit Frage) - und Bild von z.B. Malediven
        Moderator präsentiert in dieser Zeit den Hauptgewinn (z.B. Urlaub auf Malediven)
        fake-Gutschein ausdrucken und präsentieren

        50-50-Joker: jede answer hat einfach definiert (bool), ob sie bei 50-50 verschwinden würde

        Publikumsjoker: Popup (mit kurzer Ladedauer (mit  countdown)), wo angezeigt wird, dass alle 4 Fragen jeweils 25 % haben

        custom cursor (evtl. cursor none und mit JS cursor Position lösen), damit man besser zusehen kann (vor allem bei letzter frage)

        nach jeder Frage einfach ein Button "nächste Frage"
         */

        if (this.getCurrentRound().answers[key].correct) {
            this.audioManager.playCorrect()
            this.currentRank++;
        }
        else {
            this.audioManager.playFailure()
        }
    }

    cleanup() {
        const answerNodes = document.querySelectorAll('.box__answer')
        document.querySelectorAll('.box__question__text')[0].innerHTML = ''
        document.querySelectorAll('.container')[0].classList.add('container--faded')
        document.querySelectorAll('.audience')[0].classList.add('audience--disabled')
        this.selectedAnswer = null
        this.currentRound++

        answerNodes.forEach(answerNode => {
            answerNode.classList.remove('box--correct', 'box--selected', 'box--disabled')
            answerNode.classList.add('box--unselected')
            answerNode.getElementsByClassName('box__option')[0].classList.remove('box__option--correct')
            answerNode.getElementsByClassName('box__option__text')[0].innerHTML = ''
        })
    }

    updateRanking() {
        const rankingEntries = document.querySelectorAll('.ranking__entry')

        rankingEntries.forEach((ranking, key) => {
            if (key === this.currentRank) {
                ranking.classList.add('ranking__entry--selected')
            }
            else {
                ranking.classList.remove('ranking__entry--selected')
            }
        })
    }

    handle5050Joker() {
        this.getCurrentRound().answers.forEach((answer, key) => {
            if (answer.disappears) {
                const answerNode = document.querySelectorAll('.box__answer')[key]
                answerNode.getElementsByClassName('box__option__text')[0].innerHTML = ''
                answerNode.removeEventListener('click', this.onClickHandler)
                answerNode.classList.add('box--disabled')
            }
        })
        this.audioManager.play5050JokerUsed()
    }

    handleAudienceJoker() {
        const audienceGraph = document.querySelectorAll('.audience')[0]
        audienceGraph.classList.remove('audience--disabled')

        this.audioManager.playAudienceJokerUsed()
        Loader.open()

        document.addEventListener('jokerAudioFinished', () => {
            audienceGraph.querySelectorAll('#audienceGraph')[0].classList.remove('audience__graph--disabled')
            Loader.close()
        })
    }

    registerJokers() {
        const jokers = document.querySelectorAll('.joker__image')

        jokers.forEach(joker => {
            const jokerType = joker.getAttribute('data-joker')

            if (jokerType === '50-50') {
                joker.addEventListener('click', () => {
                    if (!joker.classList.contains('joker__image--inactive')) {
                        this.handle5050Joker()
                        joker.classList.add('joker__image--inactive')
                    }
                })
            }
            else if (jokerType === 'audience') {
                joker.addEventListener('click', () => {
                    if (!joker.classList.contains('joker__image--inactive')) {
                        this.handleAudienceJoker()
                        joker.classList.add('joker__image--inactive')
                    }
                })
            }
        })
    }
}
