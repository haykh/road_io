import Highway from './components/car'

export const mySketch = (p) => {
  let hway;
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    hway = new Highway(3, p.width / 2, 0.9 * p.height);
    p.frameRate(60);
  }

  p.draw = () => {
    p.background("#2f2f2f");
    hway.run(p, 5.0 / p.frameRate(), 1.0);
    hway.draw(p);
    p.push();
    {
      p.textSize(30);
      p.fill(255);
      p.text("time: " + hway.time.toFixed(1), 10, 30);
      hway.lanes.forEach((lane, i) => {
        p.text("lane " + (i + 1) + ": " + lane.passed + " : " + (lane.passed / hway.time).toFixed(2), 10, 30 * (i + 2));
      });
    }
    p.pop();
  }

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  }
}
