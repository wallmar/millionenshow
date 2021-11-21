export default class VideoManager {
    constructor() {
        this.videoNode = document.querySelectorAll('.video')[0]
    }

    displayVideo() {
        this.videoNode.innerHTML = "<source src=\"video/hotel.mp4\" type=\"video/mp4\">"
        this.videoNode.classList.add("video--enabled")
        this.videoNode.setAttribute('autoplay', 'true')
        this.videoNode.setAttribute('loop', 'true')
        this.videoNode.volume = 0.05
    }

    removeVideo() {
        this.videoNode.remove()
    }

    isPlaying() {
        return this.videoNode.classList.contains('video--enabled')
    }
}
