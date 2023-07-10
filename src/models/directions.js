const Dir = Object.freeze({
  F: {},
  R: {},
  L: {},
});

const From = Object.freeze({
  N: { align: 0 },
  E: { align: Math.PI / 2 },
  W: { align: -Math.PI / 2 },
  S: { align: Math.PI },
});

export { Dir, From };