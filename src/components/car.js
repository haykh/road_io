import p5 from 'p5';
import { colors, color_weights, lighten } from '../utils/colors.js';
import { WeightedRandom, Linspace } from '../utils/utils.js';

const PIXEL_PER_FT = 1.0;
const CAR_LENGTH = 16 * PIXEL_PER_FT;
const AVERAGE_SPEED = 70 * PIXEL_PER_FT;
const CAR_WIDTH = 7 * PIXEL_PER_FT;
const LANE_WIDTH = 12 * PIXEL_PER_FT;
const LANE_LINE_WIDTH = 0.3 * PIXEL_PER_FT;
const asphalt_color = "#5e5e5d";
const glass_color = "#2f2f2f";
const light_glass_color = lighten(glass_color, 50);

class Car {
  constructor(p, x0, y0, speed = undefined, col = undefined) {
    if (col === undefined) {
      this.col = WeightedRandom(colors, color_weights);
    } else {
      this.col = col;
    }
    this.light_col = lighten(this.col, 40);
    if (speed === undefined) {
      this.speed = (p.random() + 0.5) * AVERAGE_SPEED;
    } else {
      this.speed = speed;
    }
    this.speed0 = this.speed;
    this.ghost = false;
    this.removeIn = -10000;
    this.w = CAR_WIDTH;
    this.l = CAR_LENGTH;
    this.vel = p.createVector(0, -1);
    this.coord = p.createVector(x0, y0);
  }
  drive(dt) {
    this.coord.add(p5.Vector.mult(this.vel, this.speed * dt));
    if (this.removeIn > 0) {
      this.removeIn -= dt;
    }
  }
  accelerate(rate) {
    if (this.speed < this.speed0 - rate) {
      this.speed += rate;
    }
  }
  draw(p) {
    if (this.ghost) {
      return;
    }
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
  transfer = () => (this.removeIn < 0 && this.removeIn > -1000);
};

class Lane {
  constructor(x0, y0) {
    this.x0 = x0;
    this.y0 = y0;
    this.w = LANE_WIDTH;
    this.cars = [];
    this.crash = false;
    this.crash_y = undefined;
    this.passed = 0;
  }
  drive(dt) {
    if (!this.crash) {
      this.cars.forEach((c) => {
        // steer
        const dx = (this.x0 - c.coord.x) / this.w;
        const angle = (20 * Math.PI / 180) * Math.tanh(dx * 3);
        c.vel.x = Math.sin(angle);
        c.vel.y = -Math.cos(angle);
        c.drive(dt);
      });
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
              c.speed = 0.9 * Math.min(other.speed, c.speed);
            } else if (dist < 3 * dd) {
              c.speed = 0.99 * Math.max(other.speed, c.speed);
            } else {
              c.speed = 0.995 * Math.max(other.speed, c.speed);
            }
          } else {
            c.accelerate(0.05);
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
    const n0 = this.cars.length;
    this.cars = this.cars.filter((c) => !c.remove(w, h) || (c.ghost));
    const n1 = this.cars.length;
    this.cars = this.cars.filter((c) => !c.transfer());
    return n0 - n1;
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
  canComeToLane(y) {
    return this.cars.every((c) => ((y > c.coord.y) && (y - c.coord.y > 2 * c.l)) ||
      ((y < c.coord.y) && (c.coord.y - y > 4 * c.l)));
  }
}

class Highway {
  constructor(nlanes, x0, y0) {
    this.nlanes = nlanes;
    this.w = LANE_WIDTH * (nlanes - 1);
    this.x0 = x0;
    this.y0 = y0;
    this.lanes = Linspace(-this.w * 0.5, this.w * 0.5, nlanes).map((xl) => {
      return new Lane(x0 + xl, y0);
    });
    this.time = 0;
  }
  run(p, dt, rate) {
    this.time += dt;
    // change lanes
    for (let i = 0; i < this.nlanes; i++) {
      let j = [];
      if (i === 0) {
        j = [i + 1];
      } else if (i === this.nlanes - 1) {
        j = [i - 1];
      } else {
        j = [i - 1, i + 1];
      }
      for (let k of j) {
        if (!this.lanes[i].crash && !this.lanes[k].crash) {
          this.lanes[i].cars.forEach((c) => {
            if (!c.ghost && (c.speed < c.speed0) && this.lanes[k].canComeToLane(c.coord.y)) {
              this.lanes[k].cars.push(new Car(p, c.coord.x, c.coord.y, c.speed, c.col));
              c.ghost = true;
              c.removeIn = 2;
            }
          });
        }
      }
    }
    this.lanes.forEach((lane) => {
      if (!lane.crash) {
        lane.drive(dt);
        lane.break_accelerate();
        lane.passed += lane.remove(p.width, p.height);
        lane.addCars(p, rate * dt);
      }
    });

  }
  draw(p) {
    this.lanes.forEach((lane, i) => {
      lane.drawLane(p, i, this.nlanes);
    });
    this.lanes.forEach((lane) => lane.drawCars(p));
  }
}

export default Highway;