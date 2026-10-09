// --- src/pixelMode.js ---

export class PixelResolutionController {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {HTMLCanvasElement} [canvas]
   * @param {number} [pixelScale=0.25]
   */
  constructor(renderer, canvas = renderer.domElement, pixelScale = 0.25) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.pixelScale = pixelScale;
    this.isEnabled = false;

    window.addEventListener('resize', () => this.update());
  }

  setPixelMode(enabled) {
    this.isEnabled = enabled;
    this.canvas.classList.toggle('pixel-art-canvas', enabled);
    this.update();
  }

  toggle() {
    this.setPixelMode(!this.isEnabled);
    return this.isEnabled;
  }

  update() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ratio = this.isEnabled
      ? this.pixelScale
      : Math.min(window.devicePixelRatio || 1, 1.5);

    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height);
  }
}
