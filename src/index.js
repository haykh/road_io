import p5 from 'p5'
import { mySketch } from './sketch.js'

new p5(mySketch, document.getElementById('sketch'))

if (process.env.NODE_ENV !== 'production') {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  )
}
