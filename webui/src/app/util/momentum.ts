export class Momentum {

  private animationOnGoing : boolean = true;
  private animationFrame : number;

  /**
   * @param speed initial speed in units per millisecond
   * @param efficiency the efficiency of mechanism
   */
  constructor(speed: number, efficiency: number, onUpdate: (distance: number) => boolean) {
    this.animationFrame = requestAnimationFrame((firstFrameTime) => {
      let lastTime = firstFrameTime;
      const update = (frameTime: number) => {
        if(!this.animationOnGoing) {
          return;
        }
        let effectiveDelta = speed * Math.pow(efficiency, frameTime - firstFrameTime) * (frameTime - lastTime);
        lastTime = frameTime;
        onUpdate(effectiveDelta);
        if(Math.abs(effectiveDelta) > 1) {
          this.animationFrame = requestAnimationFrame(update);
        } else {
          this.animationFrame = undefined;
        }
      }
      requestAnimationFrame(update);
    });
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
  }

  get going() : boolean {
    return this.animationFrame !== undefined;
  }
}
