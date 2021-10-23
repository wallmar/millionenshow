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
        this.cleanedUp = false
        this.isOver = false
    }

    init() {
        setTimeout(() => this.updateRanking(), 2000)
        this.disableJokers()
        this.clickListenerBind = (event) => {
            if (event.code === 'Space') {
                this.showQuestion();
            }
        }
        document.addEventListener('keyup', this.clickListenerBind)
    }

    /**
     * @return {{question: string, audioLevel: number, answers:[{text:string,correct:bool,disappears:bool}]}}
     */
    getCurrentRound() {
        if (this.isLastRound()) {
            return this.gameConfig[this.gameConfig.length - 1]
        }
        return this.gameConfig[this.currentRound]
    }

    getRightAnswerNode(avoidKey = 0) {
        const answerNodes = document.querySelectorAll('.box__answer')
        let rightAnswerNode = null
        let rightAnswerNodeAvoided = null
        answerNodes.forEach((answerNode, key) => {
            if (this.getCurrentRound().answers[key].correct) {
                if (key === avoidKey) {
                    rightAnswerNodeAvoided = answerNode
                }
                else {
                    rightAnswerNode = answerNode
                }
            }
        })
        return rightAnswerNode ? rightAnswerNode : rightAnswerNodeAvoided
    }

    isLastRound() {
        return this.currentRank === document.querySelectorAll('.ranking__entry').length - 1
    }

    showQuestion() {
        this.audioManager.setAudioLevel(this.getCurrentRound().audioLevel)
        this.audioManager.playIntro()
        document.querySelectorAll('.box__question__text')[0].innerHTML = this.getCurrentRound().question
        document.removeEventListener('keyup', this.clickListenerBind)
        this.clickListenerBind = (event) => {
            if (event.code === 'Space') {
                this.round()
            }
        }
        this.clickListenerBind = this.round.bind(this)
        document.addEventListener('keyup', this.clickListenerBind)
    }

    round() {
        const answerNodes = document.querySelectorAll('.box__answer')
        document.querySelectorAll('.box__question__text')[0].innerHTML = this.getCurrentRound().question
        document.removeEventListener('keyup', this.clickListenerBind)
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
        const rightAnswerNode = this.getRightAnswerNode(key)

        const interval = setInterval(() => {
            rightAnswerNode.classList.toggle('box--correct')
            rightAnswerNode.getElementsByClassName('box__option')[0].classList.toggle('box__option--correct')
        }, 250)

        this.cleanedUp = false

        document.addEventListener('audioFinished', () => {
            clearInterval(interval)

            if (!this.isOver) {
                this.cleanup()
                setTimeout(() => {
                    if (!this.cleanedUp) {
                        this.currentRound++
                        this.cleanedUp = true
                        document.querySelectorAll('.container')[0].classList.remove('container--faded')
                        this.init()
                    }
                }, 2000)
            }
        })

        if (rightAnswerNode.getElementsByClassName('box__option__text')[0].innerHTML === this.getCurrentRound().answers[key].text
            && !forceWrong) {
            this.audioManager.playCorrect()
            this.currentRank++;
        }
        else {
            this.audioManager.playFailure()

            if (this.isLastRound()) {
                this.isOver = true
            }
        }
    }

    cleanup() {
        const answerNodes = document.querySelectorAll('.box__answer')
        document.querySelectorAll('.box__question__text')[0].innerHTML = ''
        document.querySelectorAll('.container')[0].classList.add('container--faded')
        document.querySelectorAll('.audience')[0].classList.add('audience--disabled')
        this.selectedAnswer = null

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
