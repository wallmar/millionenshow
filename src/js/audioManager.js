export default class AudioManager {
    constructor() {
        this.audioNode = document.getElementById('audio')
        this.audioPath = 'audio/'
        this.audioLevel = 0
        this.event = new Event('audioFinished')
        this.jokerEvent = new Event('jokerAudioFinished')
        this.countdownEvent = new Event('countdownFinished')
        this.countdown = 30
        this.intervalId = 0
    }

    setAudioSrc(src, loop = false, ignoreAudioLevel = false) {
        const audioLevel = ignoreAudioLevel ? '' : this.audioLevel + '_'

        // e.g. audio/3_basic.mp3
        this.audioNode.setAttribute('src', this.audioPath + audioLevel + src)

        if (loop) {
            this.audioNode.setAttribute('loop', 'true')
        }
        else {
            this.audioNode.removeAttribute('loop')
        }

        //audio.volume = 0.5
    }

    resetListener() {
        this.audioNode.onended = null
    }

    setAudioLevel(audioLevel) {
        this.audioLevel = audioLevel
    }

    playIntro() {
        this.resetListener()
        this.setAudioSrc('intro.mp3')
    }

    playBasic() {
        this.resetListener()
        this.setAudioSrc('basic.mp3', true)
    }

    playSelected() {
        this.resetListener()
        this.setAudioSrc('selected.mp3')
        clearInterval(this.intervalId)
    }

    playCorrect() {
        this.resetListener()
        this.setAudioSrc('correct.mp3')
        this.audioNode.onended = () => {
            document.dispatchEvent(this.event)
        }
    }

    playFailure() {
        this.resetListener()
        this.setAudioSrc('failure.mp3')
        this.audioNode.onended = () => {
            document.dispatchEvent(this.event)
        }
    }

    play5050JokerUsed() {
        this.resetListener()
        this.setAudioSrc('50-50.mp3', false, true)
        this.audioNode.onended = () => {
            this.playBasic()
        }
    }

    playAudienceJokerUsed() {
        this.resetListener()
        this.setAudioSrc('audience.mp3', false, true)
        setInterval(() => {
            const timeRanges = this.audioNode.played

            if (timeRanges.end(0) > 32) {
                document.dispatchEvent(this.jokerEvent)
            }
        }, 100)

        this.audioNode.onended = () => {
            setTimeout(() => this.playBasic(), 4000)
        }
    }

    startCountdown() {
        this.resetListener()
        this.setAudioSrc('countdown.mp3', false, true)

        const node = document.querySelectorAll('.countdown')[0]
        let started = false
        setInterval(() => {
            const timeRanges = this.audioNode.played

            if (timeRanges.end(0) > 3 && !started) {
                started = true
                node.innerHTML = this.countdown.toString()
                node.classList.remove('countdown--disabled')
                this.intervalId = setInterval(() => {
                    if (this.countdown === 0) {
                        clearInterval(this.intervalId)
                        node.classList.add('countdown--disabled')
                        document.dispatchEvent(this.countdownEvent)
                    }
                    else {
                        this.countdown --
                        node.innerHTML = this.countdown.toString()
                    }
                }, 1000)
            }
        }, 100)
    }
}
