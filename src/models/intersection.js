import { Dir, From } from "./directions.js"

const Traffic = Object.freeze({
  GREEN: { place: 2, col: "lime" },
  YELLOW: { place: 1, col: "yellow" },
  RED: { place: 0, col: "red" },
});

class TrafficLight {
  constructor(state) {
    this.state = state;
  }
  switchState() {
    if (this.state === Traffic.GREEN) {
      this.state = Traffic.YELLOW;
    } else if (this.state === Traffic.YELLOW) {
      this.state = Traffic.RED;
    } else {
      this.state = Traffic.GREEN;
    }
  }
}

class Intersection {
  constructor() {
    // this.state = Traffic.NS;
    this.time = 0;
    this.period = 200.0;
    this.lights = [
      new TrafficLight(Traffic.GREEN),
      new TrafficLight(Traffic.RED),
    ];
  }

  evolve(time) {
    if (time - this.time >= this.period) {
      this.time = time;
      this.lights.forEach((l) => l.switchState());
    } else if (time - this.time >= 0.75 * this.period) {
      this.lights
        .filter((l) => l.state === Traffic.GREEN)
        .forEach((l) => l.switchState());
    }
  }

  canDrive(dir) {
    if (dir === From.N || dir === From.S) {
      return this.lights[0].state === Traffic.GREEN;
    } else {
      return this.lights[1].state === Traffic.GREEN;
    }
  }
}

export { Intersection };