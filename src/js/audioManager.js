export default class AudioManager {
    constructor() {
        this.audioNode = document.getElementById('audio')
        this.audioPath = 'audio/'
        this.audioLevel = 0
        this.event = new Event('audioFinished')
    }

    setAudioSrc(src, loop = false) {
        // e.g. audio/3_basic.mp3
        this.audioNode.setAttribute('src', this.audioPath + this.audioLevel + '_' + src)

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
}
