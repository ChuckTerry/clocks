/**
 * Constant representing a full circle in radians.
 * @type {number}
 */
const tau = Math.PI * 2;

/**
 * Class representing a clock that draws itself on a canvas.
 */
export class ClassroomClock {
    /**
     * Create a Classroom Clock.
     * Passing an element ID will draw the clock on the canvas with that ID.
     * Otherwise, a canvas element will be created and returned instead of the class instance.
     * @param {string|null} [elementId=null] - The ID of the canvas element where the clock will be drawn.
     * @param {number} [timeOffset=0] - The time offset in hours for different time zones.
     */
    constructor(elementId = null, timeOffset = 0) {
        /**
         * The canvas element where the clock is drawn.
         * @type {HTMLCanvasElement}
         */
        if (elementId === null) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = 400;
            this.canvas.height = 400;
        } else {
            this.canvas = document.getElementById(elementId);
        }

        /**
         * The 2D rendering context for the canvas.
         * @type {CanvasRenderingContext2D}
         */
        this.context = this.canvas.getContext('2d');
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';

        /**
         * The width of the canvas.
         * @type {number}
         */
        this.width = this.canvas.width;

        /**
         * The height of the canvas.
         * @type {number}
         */
        this.height = this.canvas.height;

        /**
         * Half the width of the canvas.
         * @type {number}
         */
        this.halfWidth = this.width / 2;

        /**
         * Half the height of the canvas.
         * @type {number}
         */
        this.halfHeight = this.height / 2;

        /**
         * The font size and style for the clock numbers.
         * @type {string}
         */
        this.numberFont = `${this.canvas.width / 8.3}px Fantasy`;

        /**
         * The font size and style for the "QUARTZ" text.
         * @type {string}
         */
        this.quartzFont = `lighter ${this.canvas.width / 31}px Arial`;

        /**
         * The time offset in hours for different time zones.
         * @type {number}
         */
        this.timeOffset = timeOffset;

        // Cache the clock face
        this.cachedFace = this.drawFace();

        this.updateTime();
		if (elementId === null) {
			return this.canvas;
		}
    }

    /**
     * Draw and cache the clock face.
     * @returns {ImageData} - The cached clock face.
     */
    drawFace() {
        const { context, halfWidth, halfHeight, width, height } = this;

        context.save();
        context.beginPath();
        context.arc(halfWidth, halfHeight, halfWidth, 0, tau);
        context.fillStyle = '#5F4428';
        context.fill();
        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(halfWidth, halfHeight, halfWidth - 12, 0, tau);
        context.fill();
        context.globalCompositeOperation = "destination-over";
        context.beginPath();
        context.shadowOffsetX = 7.5;
        context.shadowOffsetY = -11;
        context.shadowColor = '#FEFEFEFF';
        context.arc(halfWidth, halfHeight, halfWidth - 12, 0, tau);
        context.stroke();
        context.fillStyle = '#CCCCCC';
        context.fill();
        context.restore();

        context.save();
        context.beginPath();
        context.arc(halfWidth, halfHeight, halfWidth - 12, 0, tau);
        context.clip();
        const shadeGradient = context.createLinearGradient(
            halfWidth - halfWidth, halfHeight,
            halfWidth, halfHeight
        );
        shadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        shadeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        context.fillStyle = shadeGradient;
        context.fillRect(0, 0, halfWidth, height);
        context.restore();

        context.fillStyle = '#413136';
        context.font = this.numberFont;
        for (let num = 1; num <= 12; num++) {
            const angle = (num - 3) * (tau) / 12;
            const x = halfWidth + Math.cos(angle) * (width * 0.355);
            const y = halfHeight + Math.sin(angle) * (height * 0.355);
            context.fillText(num.toString(), x, y);
        }
        this.drawQuartz();

        for (let tick = 1; tick < 61; tick++) {
            const angle = (tick - 3) * (tau) / 60;
            const xInner = halfWidth + Math.cos(angle) * (width * 0.439);
            const yInner = halfHeight + Math.sin(angle) * (height * 0.439);
            const xOuter = halfWidth + Math.cos(angle) * (width * 0.456);
            const yOuter = halfHeight + Math.sin(angle) * (height * 0.456);
            context.beginPath();
            context.moveTo(xInner, yInner);
            context.lineTo(xOuter, yOuter);
            context.lineWidth = (tick - 3) % 5 === 0 ? 7 : 2;
            context.stroke();
        }

        // Cache the clock face
        return context.getImageData(0, 0, this.width, this.height);
    }

    /**
     * Draw the "QUARTZ" text on the clock face.
     */
    drawQuartz() {
        this.context.font = this.quartzFont;
        this.context.fillText('QUARTZ', this.halfWidth, this.halfHeight * 1.3);
    }

    /**
     * Draw the second hand.
     * @param {number} seconds - The current second.
     * @param {boolean} [shadow=false] - Whether to draw the shadow of the second hand.
     */
    drawSecondHand(seconds, shadow = false) {
        const { context, halfWidth, halfHeight, width } = this;
        if (!shadow) {
            this.drawSecondHand(seconds, true);
        }
        const translateWidth = halfWidth + (shadow ? 4 : 0);
        const translateHeight = halfHeight - (shadow ? 2 : 0);
        context.save();
        context.translate(translateWidth, translateHeight);
        context.rotate(Math.PI / 30 * seconds);
        context.beginPath();
        context.moveTo(-3, 82);
        context.lineTo(3, 82);
        context.lineTo(5, 40);
        context.lineTo(1, 40);
        context.lineTo(2, 0);
        context.lineTo(0.75, -width * 0.434);
        context.lineTo(-0.75, -width * 0.434);
        context.lineTo(-2, 0);
        context.lineTo(-1, 40);
        context.lineTo(-5, 40);
        context.lineTo(-3, 82);
        context.fillStyle = shadow ? '#10060A33' : '#EE1116';
        context.fill();
        context.restore();
    }

    /**
     * Draw the minute hand.
     * @param {number} minutes - The current minute.
     * @param {number} seconds - The current second.
     * @param {boolean} [shadow=false] - Whether to draw the shadow of the minute hand.
     */
    drawMinuteHand(minutes, seconds, shadow = false) {
        const { context, halfWidth, halfHeight, canvas } = this;
        if (!shadow) {
            this.drawMinuteHand(minutes, seconds, true);
        }
        context.save();
        const translateWidth = halfWidth + (shadow ? 4 : 0);
        const translateHeight = halfHeight - (shadow ? 2 : 0);
        context.translate(translateWidth, translateHeight);
        context.rotate(Math.PI / 30 * (minutes + seconds / 60));
        context.beginPath();
        context.moveTo(-3, 40);
        context.lineTo(3, 40);
        context.lineTo(5, 0);
        context.lineTo(2, -canvas.width * 0.379);
        context.lineTo(-2, -canvas.width * 0.379);
        context.lineTo(-5, 0);
        context.lineTo(-3, 40);
        context.fillStyle = shadow ? '#10060A33' : '#312136';
        context.fill();
        context.restore();
    }

    /**
     * Draw the hour hand.
     * @param {number} hours - The current hour.
     * @param {number} minutes - The current minute.
     * @param {number} seconds - The current second.
     * @param {boolean} [shadow=false] - Whether to draw the shadow of the hour hand.
     */
    drawHourHand(hours, minutes, seconds, shadow = false) {
        const { context, halfWidth, halfHeight, canvas } = this;
        if (!shadow) {
            this.drawHourHand(hours, minutes, seconds, true);
        }
        context.save();
        const translateWidth = halfWidth + (shadow ? 4 : 0);
        const translateHeight = halfHeight - (shadow ? 2 : 0);
        context.translate(translateWidth, translateHeight);
        context.rotate(Math.PI / 6 * (hours + minutes / 60 + seconds / 3600));
        context.beginPath();
        context.moveTo(-3, 40);
        context.lineTo(3, 40);
        context.lineTo(5, 0);
        context.lineTo(3, -canvas.width * 0.24);
        context.lineTo(-3, -canvas.width * 0.24);
        context.lineTo(-5, 0);
        context.lineTo(-3, 40);
        context.fillStyle = shadow ? '#10060A33' : '#312136';
        context.fill();
        context.restore();
    }

    /**
     * Draw all the clock hands.
     * @param {number} hours - The current hour.
     * @param {number} minutes - The current minute.
     * @param {number} seconds - The current second.
     */
    drawHands(hours, minutes, seconds) {
        const { context, halfWidth, halfHeight } = this;
        this.drawHourHand(hours, minutes, seconds);
        this.drawMinuteHand(minutes, seconds);
        this.drawSecondHand(seconds);
        context.beginPath();
        context.arc(halfWidth, halfHeight, 4, 0, tau);
        context.fillStyle = '#D40000';
        context.fill();
        context.beginPath();
        context.arc(halfWidth, halfHeight, 2.5, 0, tau);
        context.fillStyle = '#828170';
        context.fill();
    }

    /**
     * Update the clock time.
     */
    updateTime() {
        const now = new Date();
        const hours = (now.getUTCHours() + this.timeOffset) % 24;
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();
        const fractionalSeconds = Math.floor(now.getUTCMilliseconds() / 200) * 0.2;

        // Clear the canvas
        this.context.clearRect(0, 0, this.width, this.height);

        // Draw the cached clock face
        this.context.putImageData(this.cachedFace, 0, 0);

        // Draw the hands
        this.drawHands(hours, minutes, seconds + fractionalSeconds);

        requestAnimationFrame(this.updateTime.bind(this));
    }
}
