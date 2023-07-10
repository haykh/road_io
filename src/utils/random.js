const choiceRandom = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const weightedRandom = (options, weights) => {
  let wei = [weights[0]];
  for (let i = 1; i < options.length; i++) {
    wei[i] = weights[i] + wei[i - 1];
  }
  let rnd = Math.random() * wei[wei.length - 1];
  let i;
  for (i = 0; i < weights.length; i++) {
    if (wei[i] > rnd) {
      break;
    }
  }
  return options[i];
};

const gaussianRandom = (mean, stdev) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
};

export { choiceRandom, weightedRandom, gaussianRandom };