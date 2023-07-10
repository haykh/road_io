class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }
};

const vectorAdd = (v1, v2) => {
  return new Vector(v1.x + v2.x, v1.y + v2.y);
};

const vectorSub = (v1, v2) => {
  return new Vector(v1.x - v2.x, v1.y - v2.y);
}

const scalarMult = (v, s) => {
  return new Vector(v.x * s, v.y * s);
};

const distance = (v1, v2) => {
  return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
};

export { Vector, vectorAdd, vectorSub, scalarMult, distance };