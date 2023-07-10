import { Intersection } from "./models/intersection.js";
import { Car, Cars } from "./models/cars.js";
import { Vector } from "./utils/vector.js";

Intersection.prototype.draw = function (p, grid) {
  const size = grid.size;
  const street_width = grid.street_width;
  const zebra_width = grid.zebra_width;
  p.push();
  {
    p.noFill();
    p.stroke("black");
    p.translate(p.width / 2, p.height / 2);
    // road
    for (let i = 0; i < 4; i++) {
      p.strokeWeight(2);
      p.line(
        -size * street_width * 0.5,
        size * street_width * 0.5,
        -size * street_width * 0.5,
        p.height / 2
      );
      p.line(
        size * street_width * 0.5,
        size * street_width * 0.5,
        size * street_width * 0.5,
        p.height / 2
      );
      p.strokeWeight(1);
      p.push();
      {
        p.stroke("#EFB700");
        p.drawingContext.setLineDash([8, 17]);
        p.line(0, size * (street_width + zebra_width) * 0.5, 0, p.height / 2);
      }
      p.pop();
      p.push();
      {
        p.stroke("#EFB70096");
        p.strokeWeight(4);
        p.strokeCap(p.SQUARE);
        for (let k = 1; k < 10; k++) {
          let zi = ((k - 5) / 10) * size * street_width;
          p.line(
            zi,
            size * (street_width + zebra_width) * 0.5,
            zi,
            size * street_width * 0.5
          );
        }
      }
      p.pop();
      p.push();
      {
        p.fill("#59A608");
        p.rect(
          size * street_width * 0.5,
          size * street_width * 0.5,
          p.width - size * street_width * 0.5,
          p.height - size * street_width * 0.5
        );
      }
      p.pop();
      p.rotate(Math.PI / 2);
    }

    // traffic_lights
    p.push();
    {
      p.stroke("black");
      p.fill("rgb(65,65,65)");
      const disp = size * street_width * 0.5;
      const disp_z = size * zebra_width * 0.5;
      p.rectMode(p.CENTER);
      for (let i = 0; i < 4; i++) {
        p.push();
        {
          p.translate(disp + 0.7 * disp_z, disp + disp_z);
          p.rect(0, 0, 12, 35, 10);
          for (let t = 0; t < 3; t++) {
            p.push();
            {
              let light;
              if (i % 2 === 0) {
                light = this.lights[0].state;
              } else {
                light = this.lights[1].state;
              }
              if (t === light.place) {
                p.fill(light.col);
              } else {
                p.fill("rgb(25, 25, 25)");
              }
              p.circle(0, -11 + 11 * t, 9);
            }
            p.pop();
          }
        }
        p.pop();
        p.rotate(Math.PI / 2);
      }
    }
    p.pop();
  }
  p.pop();
};

Car.prototype.draw = function (p, grid) {
  p.push();
  {
    p.fill(this.col);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.translate(p.width / 2, p.height / 2);
    p.rotate(this.comes_from.align);
    p.translate(-p.width * grid.street_width * 0.25, 0);    
    p.push();
    {
      p.translate(this.loc.x, this.loc.y);
      const angle = Math.atan2(this.vel.y, this.vel.x);
      p.rotate(angle);
      p.strokeWeight(1);
      p.stroke("white");
      p.rect(0, 0, 20, 10);
    }
    p.pop();
  }
  p.pop();
};

Cars.prototype.draw = function (p, grid) {
  this.cars.forEach((c) => c.draw(p, grid));
};
