import React, { useRef, useEffect } from 'react';
import './ClassroomClock.css';

const tau = Math.PI * 2;

class Clock {
  constructor(canvas, timeOffset = 0) {
    this.canvas = canvas;
    if (!this.canvas || !this.canvas.getContext) {
      return;
    }

    this.context = this.canvas.getContext('2d');
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.numberFont = `${this.canvas.width / 8.3}px Fantasy`;
    this.quartzFont = `lighter ${this.canvas.width / 31}px Arial`;
    this.timeOffset = timeOffset;

    // Cache the clock face and start the animation
    this.cachedFace = this.drawFace();
    this.updateTime();
  }

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
      0, halfHeight,
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
      const angle = (num - 3) * tau / 12;
      const x = halfWidth + Math.cos(angle) * (width * 0.355);
      const y = halfHeight + Math.sin(angle) * (height * 0.355);
      context.fillText(num.toString(), x, y);
    }
    this.drawQuartz();

    for (let tick = 1; tick < 61; tick++) {
      const angle = (tick - 3) * tau / 60;
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

    return context.getImageData(0, 0, this.width, this.height);
  }

  drawQuartz() {
    this.context.font = this.quartzFont;
    this.context.fillText('QUARTZ', this.halfWidth, this.halfHeight * 1.3);
  }

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

  drawMinuteHand(minutes, seconds, shadow = false) {
    const ctx = this.context;
    const { halfWidth, halfHeight, canvas } = this;
    if (!shadow) {
      this.drawMinuteHand(minutes, seconds, true);
    }
    ctx.save();
    const translateWidth = halfWidth + (shadow ? 4 : 0);
    const translateHeight = halfHeight - (shadow ? 2 : 0);
    ctx.translate(translateWidth, translateHeight);
    ctx.rotate(Math.PI / 30 * (minutes + seconds / 60));
    ctx.beginPath();
    ctx.moveTo(-3, 40);
    ctx.lineTo(3, 40);
    ctx.lineTo(5, 0);
    ctx.lineTo(2, -canvas.width * 0.379);
    ctx.lineTo(-2, -canvas.width * 0.379);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-3, 40);
    ctx.fillStyle = shadow ? '#10060A33' : '#312136';
    ctx.fill();
    ctx.restore();
  }

  drawHourHand(hours, minutes, seconds, shadow = false) {
    const ctx = this.context;
    const { halfWidth, halfHeight, canvas } = this;
    if (!shadow) {
      this.drawHourHand(hours, minutes, seconds, true);
    }
    ctx.save();
    const translateWidth = halfWidth + (shadow ? 4 : 0);
    const translateHeight = halfHeight - (shadow ? 2 : 0);
    ctx.translate(translateWidth, translateHeight);
    ctx.rotate(Math.PI / 6 * (hours + minutes / 60 + seconds / 3600));
    ctx.beginPath();
    ctx.moveTo(-3, 40);
    ctx.lineTo(3, 40);
    ctx.lineTo(5, 0);
    ctx.lineTo(3, -canvas.width * 0.24);
    ctx.lineTo(-3, -canvas.width * 0.24);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-3, 40);
    ctx.fillStyle = shadow ? '#10060A33' : '#312136';
    ctx.fill();
    ctx.restore();
  }

  drawHands(hours, minutes, seconds) {
    this.drawHourHand(hours, minutes, seconds);
    this.drawMinuteHand(minutes, seconds);
    this.drawSecondHand(seconds);
    const { context, halfWidth, halfHeight } = this;
    context.beginPath();
    context.arc(halfWidth, halfHeight, 4, 0, tau);
    context.fillStyle = '#D40000';
    context.fill();
    context.beginPath();
    context.arc(halfWidth, halfHeight, 2.5, 0, tau);
    context.fillStyle = '#828170';
    context.fill();
  }

  updateTime() {
    const now = new Date();
    const hours = (now.getUTCHours() + this.timeOffset) % 24;
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();
    const fractionalSeconds = Math.floor(now.getUTCMilliseconds() / 200) * 0.2;

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.putImageData(this.cachedFace, 0, 0);
    this.drawHands(hours, minutes, seconds + fractionalSeconds);

    requestAnimationFrame(this.updateTime.bind(this));
  }
}

const ClassroomCLock = ({ timeOffset = 0, width = 400, height = 400 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      new Clock(canvasRef.current, timeOffset);
    }
  }, [timeOffset, width, height]);

  return (
    <canvas ref={canvasRef} className="classroom-clock-canvas" />
  );
};

export default ClassroomCLock;
