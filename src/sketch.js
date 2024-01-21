import Simulation from './components/car'

export const mySketch = (p) => {
  let sim;
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    sim = new Simulation(3, p.width / 2, 0.9 * p.height);
    p.frameRate(60);
  }

  p.draw = () => {
    p.background("#2f2f2f");
    sim.run(p, 1.0 / p.frameRate(), 1.0);
    sim.draw(p);
  }

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  }
}
