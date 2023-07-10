import { Car, Cars } from "./models/cars.js";
import { Intersection } from "./models/intersection.js";
import "./draw.js";

export const mainSketch = (p) => {
  const street_width = 0.25;
  const zebra_width = 0.15;
  let total_size = 0;
  let grid;
  let cnv;

  const intersection = new Intersection();
  const cars = new Cars();
  const car = new Car();

  p.setup = () => {
    cnv = p.createCanvas(400, 400);
    total_size = Math.min(cnv.width, cnv.height);
    grid = {
      street_width: street_width,
      zebra_width: zebra_width,
      size: total_size,
      width: p.width,
      height: p.height
    };
  }

  p.draw = () => {
    p.background("#403F3C");
    intersection.evolve(p.frameCount);
    cars.addCars(0.01);
    cars.removeCars();
    cars.drive(intersection, grid);
    intersection.draw(p, grid);
    cars.draw(p, grid);
  }

  // let maxSize = 500
  // let wspeed = 1.66
  // let hspeed = 1.33
  // let w = 0
  // let h = maxSize
  // let r = 0

  // // Calling p5.js functions, using the variable 'p'
  // p.setup = () => {
  //   // Creating a canvas using the entire screen of the webpage
  //   p.createCanvas(window.innerWidth, window.innerHeight)
  //   p.strokeWeight(5)
  //   p.background(255)

  //   console.log('p5.js setup function executed!')
  // }

  // p.draw = () => {
  //   // Clear the frame
  //   p.background(255, 50)

  //   // Draw an ellipse
  //   p.translate(p.width / 2, p.height / 2)
  //   p.rotate(r)
  //   p.fill(0, 1)
  //   p.stroke(5)
  //   p.ellipse(0, 0, w, h)

  //   // Updating rotation and increment values
  //   r = r + 0.015
  //   w = w + wspeed
  //   h = h + hspeed
  //   if (w < 0 || w > maxSize) wspeed *= -1
  //   if (h < 0 || h > maxSize) hspeed *= -1
  // }

  // p.windowResized = () => {
  //   p.resizeCanvas(window.innerWidth, window.innerHeight)
  // }
}
