import p5 from 'p5'

export const mySketch = (p) => {
  // auxiliary
  const linspace = (vmin, vmax, n) =>
    Array.from({ length: n }, (_, i) => vmin + ((vmax - vmin) * i) / n);

  // parameters
  // ... visual
  const SCALE = 1.0; // global scale

  // ... physics
  const PERIOD = 1.0; // spin period
  const OMEGA = (2.0 * Math.PI) / PERIOD;
  const CHI = 0.4; // inclination in radians
  const RLC = 200.0; // light-cylinder radius
  const RADIUS = 1.0; // neutron star radius

  // vectors
  const vOMEGA = new p5.Vector(0.0, 0.0, 1.0); // angular velocity unit vector

  const vMU = (t) =>
    p.createVector(
      Math.cos(OMEGA * t) * Math.sin(CHI),
      Math.sin(OMEGA * t) * Math.sin(CHI),
      Math.cos(CHI)
    ); // magnetic moment vector (as a function of time)

  // ... A and B are the basis vectors in the rotating equatorial plane
  const vA = (t) => p5.Vector.div(p5.Vector.cross(vOMEGA, vMU(t)), Math.sin(CHI));

  const vB = (t) => p5.Vector.cross(vA(t), vMU(t));

  let model = undefined;

  const makeCurrentSheet = (rmax, nr, nphi) => new p5.Geometry(
    1, 1,
    function createGeometry() {
      const phis = linspace(0.0, 2.0 * Math.PI, nphi);
      const radii = linspace(0.0, rmax, nr);
      const points = phis.map(ang => radii.map(t => p5.Vector.mult(p5.Vector.add(p5.Vector.mult(vA(-t), Math.cos(ang)), p5.Vector.mult(vB(-t), Math.sin(ang))), RLC * (1.0 + t))));
      this.vertices.push(
        ...[].concat.apply([], points)
      );
      const npoints = nr * nphi;
      for (let j = 0; j < nphi; j++) {
        for (let i = 0; i < nr - 1; i++) {
          let I = i + j * nr;
          this.faces.push([I % npoints, (I + 1) % npoints, (nr + I) % npoints]);
          this.faces.push([(nr + I) % npoints, (I + 1) % npoints, (nr + I + 1) % npoints]);
        }
      }

      this.computeNormals();
      this.gid = 'tri';
    }
  );

  p.preload = () => {
    model = makeCurrentSheet(2.0, 1000, 100);
  }

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.perspective(1.1, p.width / p.height, 0.1, 50000);
  }

  p.draw = () => {
    p.background(220);
    p.orbitControl(2, 1);
    // p.debugMode();
    p.smooth();

    p.push(); {
      p.rotateX(Math.PI / 2);

      p.noStroke();
      p.ambientLight(255);
      p.directionalLight(255, 255, 255, -2000, -2000, 0);
      p.directionalLight(255, 255, 255, 2000, 2000, 1000);

      p.push(); {
        p.ambientMaterial(130, 50, 250);
        p.sphere(RADIUS, 32, 64);
        p.ambientMaterial(25, 50, 25);
        p.model(model);
      }
      p.pop();
    }
    p.pop();
  }

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    p.perspective(1.2, p.width / p.height, 0.1, 10000);
  }
}
