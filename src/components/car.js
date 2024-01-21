import p5 from 'p5';
import { colors, color_weights, lighten } from '../utils/colors.js';
import { WeightedRandom, Linspace } from '../utils/utils.js';

const PIXEL_PER_FT = 2.0;
const CAR_LENGTH = 16 * PIXEL_PER_FT;
const AVERAGE_SPEED = 70 * PIXEL_PER_FT;
const CAR_WIDTH = 7 * PIXEL_PER_FT;
const LANE_WIDTH = 12 * PIXEL_PER_FT;
const LANE_LINE_WIDTH = 0.3 * PIXEL_PER_FT;
const asphalt_color = "#5e5e5d";
const glass_color = "#2f2f2f";
const light_glass_color = lighten(glass_color, 50);

class Car {
  constructor(p, x0, y0) {
    this.col = WeightedRandom(colors, color_weights);
    this.light_col = lighten(this.col, 40);
    this.speed = (p.random() + 0.5) * AVERAGE_SPEED;
    this.speed0 = this.speed;
    this.w = CAR_WIDTH;
    this.l = CAR_LENGTH;
    this.vel = p.createVector(0, -1);
    this.coord = p.createVector(x0, y0);
  }
  drive(dt) {
    this.coord.add(p5.Vector.mult(this.vel, this.speed * dt));
  }
  accelerate(rate) {
    if (this.speed < this.speed0 - rate) {
      this.speed += rate;
    }
  }
  draw(p) {
    p.push();
    {
      p.noStroke();
      p.translate(this.coord.x, this.coord.y);
      p.rotate(Math.atan2(this.vel.y, this.vel.x) + p.HALF_PI);

      p.rectMode(p.CENTER);
      p.fill(this.col);
      p.rect(0, 0, this.w, this.l);

      p.rectMode(p.CORNER);
      p.fill(this.light_col);
      // back shine
      p.rect(-0.5 * this.w, 0.5 * this.l, 0.3 * this.w, -0.1 * this.l);
      // front shine
      p.rect(-0.5 * this.w, -0.5 * this.l, 0.3 * this.w, 0.2 * this.l);
      // top shine
      p.rect(-0.5 * this.w, -0.5 * this.l, 0.15 * this.w, this.l);
      p.fill(glass_color);
      p.rectMode(p.CORNER);
      // front glass
      p.rect(-0.4 * this.w, -0.3 * this.l, 0.8 * this.w, 0.2 * this.l);
      // rear glass
      p.rect(-0.4 * this.w, 0.25 * this.l, 0.8 * this.w, 0.15 * this.l);
      // right glass
      p.rect(0.43 * this.w, -0.15 * this.l, 0.02 * this.w, 0.4 * this.l);

      // left glass
      p.fill(light_glass_color);
      p.rect(-0.45 * this.w, -0.15 * this.l, 0.02 * this.w, 0.4 * this.l);

      // front glass
      p.beginShape();
      p.vertex(-0.4 * this.w, -0.3 * this.l);
      p.vertex(-0.2 * this.w, -0.3 * this.l);
      p.vertex(-0.35 * this.w, -0.1 * this.l);
      p.vertex(-0.4 * this.w, -0.1 * this.l);
      p.endShape(p.CLOSE);
      // rear glass

      p.beginShape();
      p.vertex(-0.4 * this.w, 0.25 * this.l);
      p.vertex(-0.35 * this.w, 0.25 * this.l);
      p.vertex(-0.2 * this.w, 0.4 * this.l);
      p.vertex(-0.4 * this.w, 0.4 * this.l);
      p.endShape(p.CLOSE);
    }
    p.pop();
  }
  remove = (w, h) => (this.coord.x > w + this.l * 0.5 ||
    this.coord.x < - this.l * 0.5 ||
    this.coord.y > h + this.l * 0.5 ||
    this.coord.y < - this.l * 0.5);
};

class Lane {
  constructor(x0, y0) {
    this.x0 = x0;
    this.y0 = y0;
    this.w = LANE_WIDTH;
    this.cars = [];
    this.crash = false;
    this.crash_y = undefined;
  }
  drive(dt) {
    if (!this.crash) {
      this.cars.forEach((c) => c.drive(dt));
    }
  }
  break_accelerate() {
    this.cars.forEach((c) => {
      this.cars.forEach((other) => {
        if (c !== other) {
          const dist = c.coord.y - other.coord.y;
          const dd = 0.5 * (c.l + other.l);
          // detect a crash
          if (Math.abs(dist) < dd) {
            this.crash = true;
            this.crash_y = 0.5 * (c.coord.y + other.coord.y);
          }
          // break or accelerate
          if (dist > 0 && dist < 4 * dd) {
            if (dist < 2 * dd) {
              c.speed = Math.max(other.speed, 0.9 * c.speed);
            } else if (dist < 3 * dd) {
              c.speed = Math.max(other.speed, 0.99 * c.speed);
            } else {
              c.speed = Math.max(other.speed, 0.995 * c.speed);
            }
          } else {
            c.accelerate(0.15);
          }
        }
      });
    });
  }
  drawLane(p, i, n) {
    p.push();
    {
      p.noStroke();
      p.fill(asphalt_color);
      p.rectMode(p.CENTER);
      p.translate(this.x0, this.y0 * 0.5);
      p.rect(0, 0, LANE_WIDTH, this.y0);
    }
    p.pop();

    let xedge;
    p.push();
    {
      p.strokeWeight(LANE_LINE_WIDTH);
      p.stroke(255);
      p.translate(this.x0, this.y0 * 0.5);
      if (i === 0 || i === n - 1) {
        if (i === 0) {
          xedge = -this.w * 0.45;
        } else {
          xedge = this.w * 0.45;
        }
        p.line(xedge, this.y0 * 0.5, xedge, -this.y0 * 0.5);
      }
      if (i < n - 1) {
        xedge = 0.5 * this.w;
        p.drawingContext.setLineDash([3 * PIXEL_PER_FT, 9 * PIXEL_PER_FT]);
        p.line(xedge, this.y0 * 0.5, xedge, -this.y0 * 0.5);
      }
    }
    p.pop();
  }
  drawCars(p) {
    this.cars.forEach((c) => c.draw(p));
    if (this.crash) {
      p.push();
      {
        p.stroke(255, 0, 0);
        p.strokeWeight(3);
        p.circle(this.x0, this.crash_y, 20);
      }
      p.pop();
    }
  }
  remove(w, h) {
    this.cars = this.cars.filter((c) => !c.remove(w, h));
  }
  addCar(p) {
    this.cars.push(new Car(p, this.x0, this.y0 - 0.5 * CAR_LENGTH));
  }
  addCars(p, rate) {
    let occupied = this.cars.some((c) => c.coord.y + 4 * c.l > this.y0);
    if (!occupied && p.random() < rate) {
      this.addCar(p);
    }
  }
}

class Simulation {
  constructor(nlanes, x0, y0) {
    const tot_width = LANE_WIDTH * (nlanes - 1);
    this.x0 = x0;
    this.y0 = y0;
    this.nlanes = nlanes;
    this.lanes = Linspace(-tot_width * 0.5, tot_width * 0.5, nlanes).map((xl) => {
      return new Lane(x0 + xl, y0);
    });
  }
  run(p, dt, rate) {
    this.lanes.forEach((lane) => {
      lane.drive(dt);
      lane.break_accelerate();
      lane.remove(p.width, p.height);
      lane.addCars(p, rate * dt);
    });
  }
  draw(p) {
    this.lanes.forEach((lane, i) => {
      // lane.draw(p);
      lane.drawLane(p, i, this.nlanes);
    });
    this.lanes.forEach((lane) => lane.drawCars(p));
  }
}

export default Simulation;