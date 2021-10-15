export default class AudioManager {
    constructor() {
        this.audioNode = document.getElementById('audio')
        this.audioPath = 'audio/'
        this.audioLevel = 0
        this.event = new Event('audioFinished')
        this.jokerEvent = new Event('jokerAudioFinished')
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

    setAudioLevel(audioLevel) {
        this.audioLevel = audioLevel
    }

    playIntro() {
        this.setAudioSrc('intro.mp3')
        this.audioNode.onended = () => {
            this.playBasic()
        }
    }

    playBasic() {
        this.setAudioSrc('basic.mp3', true)
    }

    playSelected() {
        this.setAudioSrc('selected.mp3')
    }

    playCorrect() {
        this.setAudioSrc('correct.mp3')
        this.audioNode.onended = () => {
            document.dispatchEvent(this.event)
        }
    }

    playFailure() {
        this.setAudioSrc('failure.mp3')
        this.audioNode.onended = () => {
            document.dispatchEvent(this.event)
        }
    }

    play5050JokerUsed() {
        this.setAudioSrc('50-50.mp3', false, true)
        this.audioNode.onended = () => {
            this.playBasic()
        }
    }

    playAudienceJokerUsed() {
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
}
