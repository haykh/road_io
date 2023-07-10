import { Vector, vectorSub, distance } from "../utils/vector.js";
import { Bezier1, Bezier3, Bezier5 } from "../utils/bezier.js";
import { choiceRandom, weightedRandom, gaussianRandom } from "../utils/random.js";
import { Dir, From } from "./directions.js"

const colors = [
  "#0d1116",
  "#1c1d21",
  "#32383d",
  "#454b4f",
  "#999da0",
  "#c2c4c6",
  "#979a97",
  "#637380",
  "#63625c",
  "#3c3f47",
  "#444e54",
  "#1d2129",
  "#13181f",
  "#26282a",
  "#515554",
  "#151921",
  "#1e2429",
  "#333a3c",
  "#8c9095",
  "#39434d",
  "#506272",
  "#1e232f",
  "#363a3f",
  "#a0a199",
  "#d3d3d3",
  "#b7bfca",
  "#778794",
  "#c00e1a",
  "#da1918",
  "#b6111b",
  "#a51e23",
  "#7b1a22",
  "#8e1b1f",
  "#6f1818",
  "#49111d",
  "#b60f25",
  "#d44a17",
  "#c2944f",
  "#f78616",
  "#cf1f21",
  "#732021",
  "#f27d20",
  "#ffc91f",
  "#9c1016",
  "#de0f18",
  "#8f1e17",
  "#a94744",
  "#b16c51",
  "#371c25",
  "#132428",
  "#122e2b",
  "#12383c",
  "#31423f",
  "#155c2d",
  "#1b6770",
  "#66b81f",
  "#22383e",
  "#1d5a3f",
  "#2d423f",
  "#45594b",
  "#65867f",
  "#222e46",
  "#233155",
  "#304c7e",
  "#47578f",
  "#637ba7",
  "#394762",
  "#d6e7f1",
  "#76afbe",
  "#345e72",
  "#0b9cf1",
  "#2f2d52",
  "#282c4d",
  "#2354a1",
  "#6ea3c6",
  "#112552",
  "#1b203e",
  "#275190",
  "#608592",
  "#2446a8",
  "#4271e1",
  "#3b39e0",
  "#1f2852",
  "#253aa7",
  "#1c3551",
  "#4c5f81",
  "#58688e",
  "#74b5d8",
  "#ffcf20",
  "#fbe212",
  "#916532",
  "#e0e13d",
  "#98d223",
  "#9b8c78",
  "#503218",
  "#473f2b",
  "#221b19",
  "#653f23",
  "#775c3e",
  "#ac9975",
  "#6c6b4b",
  "#402e2b",
  "#a4965f",
  "#46231a",
  "#752b19",
  "#bfae7b",
  "#dfd5b2",
  "#f7edd5",
  "#3a2a1b",
  "#785f33",
  "#b5a079",
  "#fffff6",
  "#eaeaea",
  "#b0ab94",
  "#453831",
  "#2a282b",
  "#726c57",
  "#6a747c",
  "#354158",
  "#9ba0a8",
  "#5870a1",
  "#eae6de",
  "#dfddd0",
  "#f2ad2e",
  "#f9a458",
  "#83c566",
  "#f1cc40",
  "#4cc3da",
  "#4e6443",
  "#bcac8f",
  "#f8b658",
  "#fcf9f1",
  "#fffffb",
  "#81844c",
  "#ffffff",
  "#f21f99",
  "#fdd6cd",
  "#df5891",
  "#f6ae20",
  "#b0ee6e",
  "#08e9fa",
  "#0a0c17",
  "#0c0d18",
  "#0e0d14",
  "#9f9e8a",
  "#621276",
  "#0b1421",
  "#11141a",
  "#6b1f7b",
  "#1e1d22",
  "#bc1917",
  "#2d362a",
  "#696748",
  "#7a6c55",
  "#c3b492",
  "#5a6352",
  "#81827f",
  "#afd6e4",
  "#7a6440",
  "#7f6a48",
];

const color_weights = colors.map((_, i) => i / colors.length);

const parametrize = (to, grid) => (t) => {
  let pt0 = new Vector(0, -grid.size / 2);
  if (to === Dir.F) {
    let pt1 = new Vector(0, grid.size / 2);
    return Bezier1(pt0, pt1, t);
  } else if (to === Dir.L) {
    let disp_w = (grid.size * grid.street_width) / 2;
    let disp_z = (grid.size * grid.zebra_width) / 2;
    let pt1 = new Vector(0, -disp_w);
    let pt2 = new Vector(0, -disp_w / 2);
    let pt3 = new Vector(0, disp_w / 2);
    let pt4 = new Vector(disp_z, disp_w / 2);
    let pt5 = new Vector(grid.size / 2, disp_w / 2);
    return Bezier5(pt0, pt1, pt2, pt3, pt4, pt5, t);
  } else {
    let disp_w = (grid.size * grid.street_width) / 2;
    let pt1 = new Vector(0, 0);
    let pt2 = new Vector(0, -disp_w / 2);
    let pt3 = new Vector(-grid.size / 2, -disp_w / 2);
    return Bezier3(pt0, pt1, pt2, pt3, t);
  }
};

class Car {
  constructor() {
    this.position = 0;
    this.comes_from = choiceRandom([From.N, From.S, From.E, From.W]);
    this.goes_to = choiceRandom([Dir.R, Dir.L, Dir.F]);
    this.col = weightedRandom(colors, color_weights);
    this.original_speed = Math.abs(gaussianRandom(0.01, 0.002));
    this.speed = this.original_speed;
    this.vel = new Vector(0, 1);
    this.loc = undefined;
    this.gloc = undefined;
    this.prev_loc = undefined;
  }

  g_position(grid, l_position = this.loc) {
    let g_pos = new Vector(l_position.x, l_position.y);
    g_pos.x -= grid.width * grid.street_width * 0.25;
    const x_ = g_pos.x, y_ = g_pos.y;
    const angle = -this.comes_from.align;
    g_pos.x = x_ * Math.cos(angle) + y_ * Math.sin(angle);
    g_pos.y = -x_ * Math.sin(angle) + y_ * Math.cos(angle);
    g_pos.x += grid.width / 2;
    g_pos.y += grid.height / 2;
    return g_pos;
  }

  next_loc(grid) {
    let position = this.position + this.speed;
    return parametrize(this.goes_to, grid)(position);
  }

  drive(grid) {
    if (this.position < 1) {
      let next = this.next_loc(grid);
      this.prev_loc = this.loc;
      this.position += this.speed;
      this.loc = next;
      if (this.loc !== undefined && this.prev_loc !== undefined) {
        this.vel = vectorSub(this.loc, this.prev_loc);
      }
    }
  }
};

class Cars {
  constructor() {
    this.cars = [];
  }
  addCars(rate) {
    if (Math.random() < rate) {
      this.cars.push(new Car());
    }
  }
  removeCars() {
    this.cars = this.cars.filter((c) => c.position < 1);
  }
  drive(intersection, grid) {
    this.cars
      .filter((c) => intersection.canDrive(c.comes_from) || c.position < 0.2)
      .forEach((c) => c.drive(grid));

    this.cars.forEach((c1) => {
      this.cars.filter((c2) => c2 !== c1).forEach((c2) => {
        const c1_next = c1.g_position(grid, c1.next_loc(grid));
        const c1_cur = c1.g_position(grid);
        const c2_cur = c2.g_position(grid);
        if (distance(c1_cur, c2_cur) < 20 || distance(c1_next, c2_cur) < 20) {
          c1.speed = 0;
        } else {
          c1.speed = c1.original_speed;
        }
      });
    });
  }
};

export { Car, Cars };