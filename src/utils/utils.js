const WeightedRandom = (options, weights) => {
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

const Linspace = (start, stop, num) => {
  const step = (stop - start) / (num - 1);
  return [...Array(num).keys()].map((i) => start + i * step);
};

export { WeightedRandom, Linspace };