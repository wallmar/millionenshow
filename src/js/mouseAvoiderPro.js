export default class MouseAvoiderPro {
    constructor() {
        this.addedX = 0
        this.addedY = 0
        this.padding = 30
        this.maxTranslate = 20
    }

    perform(mouseEvent, node) {
        let mouseX = mouseEvent.pageX
        let mouseY = mouseEvent.pageY

        const offset = this.getOffset(node)

        // if mouse XY between both x-values AND both y-values -> within rect
        if (
            mouseX > offset.leftX && mouseX < offset.rightX &&
            mouseY > offset.topY && mouseY < offset.bottomY
        ) {
            node.classList.add('box__answer--last')
            this.addedX += this.transformValueFromPercentage((mouseX - offset.leftX) / (offset.rightX - offset.leftX))
            this.addedY += this.transformValueFromPercentage((mouseY - offset.topY) / (offset.bottomY - offset.topY))

            if (this.valuesOutOfBounds([offset.leftX, offset.rightX], window.innerWidth) ||
                this.valuesOutOfBounds([offset.topY, offset.bottomY], window.innerHeight)) {
                this.addedX = 0
                this.addedY = 0
                node.classList.remove('box__answer--last')
            }

            node.style.transform = `translate(${this.addedX}px, ${this.addedY}px)`
        }
    }

    valuesOutOfBounds(values, bounds) {
        let outOfBounds = true
        values.forEach(value => {
            if (value > 100 && value < bounds - 100) {
                outOfBounds = false
            }
        })
        return outOfBounds
    }

    transformValueFromPercentage(percentage) {
        return (((this.maxTranslate + this.maxTranslate) * percentage) - this.maxTranslate) * -1
    }

    getOffset(el) {
        const rect = el.getBoundingClientRect();
        const lengthX = Math.abs(rect.right - rect.left)
        return {
            leftX:  (rect.left + window.scrollX) + (0.03 * lengthX) - this.padding,
            topY: (rect.top + window.scrollY) - (this.padding * 2),
            rightX: (rect.right + window.scrollX) - (0.2 * lengthX) + this.padding,
            bottomY: (rect.bottom + window.scrollY) + (this.padding * 2)
        };
    }
}
