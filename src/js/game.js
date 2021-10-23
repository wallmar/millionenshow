import AudioManager from "./audioManager";
import MouseAvoiderPro from "./mouseAvoiderPro";
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
        this.mouseAvoider = new MouseAvoiderPro()
        this.clickListenerBind = null
    }

    init() {
        setTimeout(() => this.updateRanking(), 2000)
        this.disableJokers()
        this.clickListenerBind = this.showQuestion.bind(this);
        document.querySelectorAll('.box__question')[0].addEventListener('click', this.clickListenerBind)
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

    isLastRound() {
        return this.currentRound === this.gameConfig.length - 1
    }

    showQuestion() {
        this.audioManager.setAudioLevel(this.getCurrentRound().audioLevel)
        this.audioManager.playIntro()
        document.querySelectorAll('.box__question__text')[0].innerHTML = this.getCurrentRound().question
        const question = document.querySelectorAll('.box__question')[0]
        question.removeEventListener('click', this.clickListenerBind)
        this.clickListenerBind = this.round.bind(this)
        question.addEventListener('click', this.clickListenerBind)
    }

    round() {
        const answerNodes = document.querySelectorAll('.box__answer')
        document.querySelectorAll('.box__question__text')[0].innerHTML = this.getCurrentRound().question
        document.querySelectorAll('.box__question')[0].removeEventListener('click', this.clickListenerBind)
        this.enableJokers()

        // last question
        if (this.isLastRound()) {
            this.audioManager.startCountdown()
            this.disableJokers()

            document.addEventListener('countdownFinished', () => {
                this.mouseAvoider.reset(this.getRightAnswerNode())
                this.checkAnswer(1, true)
                this.selectedAnswer = 1
            })

            document.onmousemove = ((e) => this.mouseAvoider.perform(e, this.getRightAnswerNode()))
        }
        else {
            this.audioManager.playBasic()
        }

        answerNodes.forEach((answerNode, key) => {
            const answer = this.getCurrentRound().answers[key]
            answerNode.classList.add('box--unselected')
            answerNode.classList.remove('box--disabled')

            answerNode.getElementsByClassName('box__option__text')[0].innerHTML = answer.text

            const onClickHandler = () => {
                if (!this.selectedAnswer && !answerNode.classList.contains('box--disabled')) {

                    if (!this.isLastRound() || answerNode !== this.getRightAnswerNode()) {
                        answerNode.classList.add('box--selected')
                        answerNode.classList.remove('box--unselected')
                        this.disableJokers()
                        this.selectedAnswer = answer

                        this.audioManager.playSelected()
                        if (this.isLastRound()) {
                            this.mouseAvoider.reset(this.getRightAnswerNode())
                        }

                        setTimeout(() => {this.checkAnswer(key)}, this.countDown)
                    }
                }
            }

            answerNode.addEventListener('click', onClickHandler)
        })
    }

    checkAnswer(key, forceWrong = false) {
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
                    this.init()
                }, 2000)
            }
        })
        /* TODO
        letzte frage (z.B. Hauptstadt von Ö) - richtige Antwort lässt sich nicht anklicken (bewegt sich immer weg)
        davor ca. 30 sekunden mit Countdown (ohne Container mit Frage) - und Bild von z.B. Malediven
        Moderator präsentiert in dieser Zeit den Hauptgewinn (z.B. Urlaub auf Malediven)
        fake-Gutschein ausdrucken und präsentieren

        korrekte Antwort von letzter Frage soll rechts unten sein, und Antwort der vorherigen korrekten frage (einfach)
        diagonal davon links oben (damit man nicht versehentlich hover auslöst)

        nach jeder Frage einfach ein Button "nächste Frage"

        bug beheben, wo musik bei erster runde nicht startet
         */

        if (this.getCurrentRound().answers[key].correct && !forceWrong) {
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
            answerNode.classList.remove('box--correct', 'box--selected')
            answerNode.classList.add('box--disabled')
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
                    if (!joker.classList.contains('joker__image--inactive') && !joker.classList.contains('joker__image--disabled')) {
                        this.handle5050Joker()
                        joker.classList.add('joker__image--inactive')
                    }
                })
            }
            else if (jokerType === 'audience') {
                joker.addEventListener('click', () => {
                    if (!joker.classList.contains('joker__image--inactive') && !joker.classList.contains('joker__image--disabled')) {
                        this.handleAudienceJoker()
                        joker.classList.add('joker__image--inactive')
                    }
                })
            }
        })
    }

    disableJokers() {
        const jokers = document.querySelectorAll('.joker__image')

        jokers.forEach(joker => {
            joker.classList.add('joker__image--disabled')
        })
    }

    enableJokers() {
        const jokers = document.querySelectorAll('.joker__image')

        jokers.forEach(joker => {
            joker.classList.remove('joker__image--disabled')
        })
    }
}
