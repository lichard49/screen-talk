class Flicker {
  constructor(canvas, img, alpha) {
    this.canvas = canvas;

    this.context = this.canvas.getContext('2d');
    this.alpha_buffer = Flicker.createFlickerBuffer(img, alpha,
      canvas.width, canvas.height);
    this.clear_buffer = Flicker.createFlickerBuffer(img, null,
      canvas.width, canvas.height);
    this.fill_state = false;
  }

  startFlicker(frequency) {
    this.animate = new AnimationFrame(frequency, this.refreshScreen);
    this.animate.start(this);
  }

  stopFlicker() {
    this.fill_state = false;
    this.refreshScreen();
    if (this.animate != null) {
      this.animate.stop();
    }
  }

  refreshScreen() {
    if (this.fill_state) {
      this.context.drawImage(this.alpha_buffer, 0, 0);
    } else {
      this.context.drawImage(this.clear_buffer, 0, 0);
    }

    this.fill_state = !this.fill_state;
  }

  static createFlickerBuffer(img, alpha, width, height) {
    const buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;

    // draw the background image
    buffer.getContext('2d').drawImage(img, 0, 0);

    // if alpha overlay is enabled, draw that
    if (alpha != null) {
      const color = 'rgba(0, 0, 0, ' + alpha + ')';
      buffer.getContext('2d').fillStyle = color;
      buffer.getContext('2d').fillRect(0, 0,
        buffer.width, buffer.height);
    }

    return buffer;
  }
}

// Source: https://gist.github.com/addyosmani/5434533
class AnimationFrame {
  constructor(fps = 60, animate) {
    this.requestID = 0;
    this.fps = fps;
    this.animate = animate;
  }

  start(caller) {
    let then = performance.now();
    const interval = 1000 / this.fps;
    const tolerance = 0.001;

    const animateLoop = (now) => {
      this.requestID = requestAnimationFrame(animateLoop);
      const delta = now - then;

      if (delta >= interval - tolerance) {
        then = now - (delta % interval);
        this.animate.call(caller);
      }
    };
    this.requestID = requestAnimationFrame(animateLoop);
  }

  stop() {
    cancelAnimationFrame(this.requestID);
  }
}