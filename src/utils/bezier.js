import { Vector, scalarMult, vectorAdd } from "../utils/vector.js"

const Bezier1 = (p1, p2, t) => {
  return vectorAdd(scalarMult(p1, 1 - t), scalarMult(p2, t));
};

const Bezier2 = (p1, pC, p2, t) => {
  return vectorAdd(
    vectorAdd(
      scalarMult(p1, (1 - t) ** 2),
      scalarMult(pC, 2 * (1 - t) * t)
    ),
    scalarMult(p2, t ** 2)
  );
};

const Bezier3 = (p1, p2, p3, p4, t) => {
  let res = new Vector(0, 0);
  res.add(scalarMult(p1, (1 - t) ** 3));
  res.add(scalarMult(p2, 3 * (1 - t) ** 2 * t));
  res.add(scalarMult(p3, 3 * (1 - t) * t ** 2));
  res.add(scalarMult(p4, t ** 3));
  return res;
};

const Bezier5 = (pt0, pt1, pt2, pt3, pt4, pt5, t) => {
  let res = new Vector(0, 0);
  res.add(scalarMult(pt0, (1 - t) ** 5));
  res.add(scalarMult(pt1, 5 * (1 - t) ** 4 * t));
  res.add(scalarMult(pt2, 10 * (1 - t) ** 3 * t ** 2));
  res.add(scalarMult(pt3, 10 * (1 - t) ** 2 * t ** 3));
  res.add(scalarMult(pt4, 5 * t ** 4 * (1 - t)));
  res.add(scalarMult(pt5, t ** 5));
  return res;
};

export { Bezier1, Bezier2, Bezier3, Bezier5 };