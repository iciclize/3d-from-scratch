import { Vec3d, Mat4x4, Triangle } from './primitives';
import { Model } from './model';
import cubeData from './cube-obj';
import modelData from './cat-obj';
import { start } from 'live-server';

let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.x;
  mouseY = e.y;
});

window.addEventListener('DOMContentLoaded', () => {
  const canvas: HTMLCanvasElement = document.getElementById(
    "canvas"
  ) as HTMLCanvasElement;
  const app = new App(canvas);
  app.run();
});


const camera = (location: Vec3d, target: Vec3d, up: Vec3d) => {
  const zAxis = Vec3d.sub(location, target).norm();
  const xAxis = Vec3d.cross(up, zAxis).norm();
  const yAxis = Vec3d.cross(zAxis, xAxis);
  // Vec3d.printVector('xAxis', xAxis);
  // Vec3d.printVector('yAxis', yAxis);
  // Vec3d.printVector('zAxis', zAxis);

  const translate = new Mat4x4(
    1, 0, 0, -location.x,
    0, 1, 0, -location.y,
    0, 0, 1, -location.z,
    0, 0, 0, 1
  );

  const axis = new Mat4x4(
    xAxis.x, xAxis.y, xAxis.z, 0,
    yAxis.x, yAxis.y, yAxis.z, 0,
    zAxis.x, zAxis.y, zAxis.z, 0,
    0, 0, 0, 1
  );

  return Mat4x4.mult(axis, translate);
}

const showPoints = (str: string, vertices: Vec3d[]) => {
  console.log(str);
  vertices.forEach((p, i) => {
    console.log(`p${i}: { x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}, z: ${p.z.toFixed(3)} }`);
  });
  console.log();
}

class App {
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;
  polygons: Triangle[] = [];

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = 364;
    canvas.height = 364;
    this.canvas = canvas;
    this.context2d = canvas.getContext("2d")!;
    const model = new Model(modelData);
    const polygons = model._polygons.map((polygon) => {
      const tri = polygon.map((v) => {
        return new Vec3d(v.vertex[0], v.vertex[1], v.vertex[2], 1);
      });
      return tri as Triangle;
    });
    this.polygons = polygons;
  }

  run() {
    const ctx = this.context2d;
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.draw();
  }

  theta = 0;

  draw() {
    const ctx = this.context2d;

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();

    this.theta += 0.05;
    const t = this.theta;

    const matRotateY = new Mat4x4(
      Math.cos(t), 0, -Math.sin(t), 0,
      0, 1, 0, 0,
      Math.sin(t), 0, Math.cos(t), 0,
      0, 0, 0, 1
    );

    const ratio = 0.05;
    const scale = new Mat4x4(
      ratio, 0, 0, 0,
      0, ratio, 0, 0,
      0, 0, ratio, 0,
      0, 0, 0, 1
    );

    this.polygons.forEach((polygon) => {

      // rotate local
      const model = polygon.map((p) => {
        const scaled = Mat4x4.multVec(scale, p)
        const r = Mat4x4.multVec(matRotateY, scaled);
        return r;
      });

      const world = model.map((p) => {
        const translate = new Mat4x4(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 5,
          0, 0, 0, 1
        );
        return Mat4x4.multVec(translate, p);
      });

      // showPoints('world', world);

      const camPos = new Vec3d(-4 + mouseX / 100, -5 + mouseY * 4 / 100, 30);
      const lookat = new Vec3d(0, 10, 0);
      const up = new Vec3d(0, 1, 0);
      const camMat = camera(camPos, lookat, up);
      Mat4x4.printMatrix('camera', camMat);

      const view = world.map((p) => {
        // lookAt
        return Mat4x4.multVec(camMat, p)
      });

      // showPoints('view', view);

      const near = -1;
      const far = -65;
      const fov = 75 / 180 * Math.PI;

      const screenW = 364;
      const screenH = 364;
      const aspectRatio = screenW / screenH;

      const halfWidth = Math.tan(fov / 2) * near;
      const halfHeight = halfWidth / aspectRatio;

      const projection = view.map((p, i) => {
        const perspective = new Mat4x4(
          near / halfWidth, 0, 0, 0,
          0, near / halfHeight, 0, 0,
          0, 0, (far + near) / (far - near), (-2 * far * near) / (far - near),
          0, 0, -1, 0
        );
        const proj = Mat4x4.multVec(perspective, p);
        // console.log(`pre p${i}: { x: ${proj.x.toFixed(3)}, y: ${proj.y.toFixed(3)}, z: ${proj.z.toFixed(3)}, w: ${proj.w.toFixed(3)} }`);
        return new Vec3d(proj.x / proj.w, proj.y / proj.w, proj.z / proj.w, 1);
      });

      // showPoints('projection', projection);

      const screenHalfW = ctx.canvas.width / 2;
      const screenHalfH = ctx.canvas.height / 2;
      const screenPoints = projection.filter((p) => {
        if (p.x < -1 || 1 < p.x) return false;
        if (p.y < -1 || 1 < p.y) return false;
        if (p.z < -1 || 1 < p.z) return false;
        return true;
      }).map((p) => {
        return new Vec3d(screenHalfW * p.x + screenHalfW, screenHalfH * -p.y + screenHalfH, 0);
      });

      // showPoints('screen', screenPoints);

      ctx.strokeStyle = "white";
      ctx.beginPath();
      if (screenPoints[0]) {
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      }
      screenPoints.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      screenPoints.forEach((p) => {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      });

    });

    const animation = true;
    if (animation) {
      setTimeout(() => {
        this.draw();
      }, 33);
    }
  }

}
