import { Vec3d, Mat4x4, Triangle } from './primitives';
import { Model } from './model';
import cubeData from './cube-obj';
import modelData from './cube-obj';

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
  return;
  console.log(str);
  vertices.forEach((p, i) => {
    console.log(`p${i}: { x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}, z: ${p.z.toFixed(3)}, w: ${p.w.toFixed(3)}}`);
  });
  console.log();
}

class App {
  _canvas: HTMLCanvasElement;
  _context2d: CanvasRenderingContext2D;
  _model: Model;
  _polygons: Triangle[] = [];

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = 364;
    canvas.height = 364;
    this._canvas = canvas;
    this._context2d = canvas.getContext("2d")!;
    const model = new Model(modelData);
    this._model = model;
    const polygons = model._polygons.map((polygon) => {
      const tri = polygon.map((v) => {
        return new Vec3d(v.vertex[0], v.vertex[1], v.vertex[2], 1);
      });
      return tri as Triangle;
    });
    this._polygons = polygons;
  }

  run() {
    const ctx = this._context2d;
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.draw();
  }

  theta = 0;

  draw() {
    const ctx = this._context2d;

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();

    this.theta += 0.03;
    const t = this.theta;

    const matRotateY = new Mat4x4(
      Math.cos(t), 0, -Math.sin(t), 0,
      0, 1, 0, 0,
      Math.sin(t), 0, Math.cos(t), 0,
      0, 0, 0, 1
    );

    const ratio = 1;
    const scale = new Mat4x4(
      ratio, 0, 0, 0,
      0, ratio, 0, 0,
      0, 0, ratio, 0,
      0, 0, 0, 1
    );

    const vertices = this._model._vertices.map((v) => {
      return new Vec3d(v[0], v[1], v[2]);
    });
    const bindings = this._model._bindings;

    // rotate local
    const model = vertices.map((p) => {
      const scaled = Mat4x4.multVec(scale, p)
      const r = Mat4x4.multVec(matRotateY, scaled);
      return r;
    });

    const world = model.map((p) => {
      const translate = new Mat4x4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
      return Mat4x4.multVec(translate, p);
    });

    showPoints('world', world);

    const camPos = new Vec3d(0, -5 + mouseY * 4 / 100, mouseX / 100);
    // const camPos = new Vec3d(0, 0, 2.5);
    const lookat = new Vec3d(0, 0, 0);
    const up = new Vec3d(0, 1, 0);
    const camMat = camera(camPos, lookat, up);
    // Mat4x4.printMatrix('camera', camMat);

    const view = world.map((p) => {
      // lookAt
      return Mat4x4.multVec(camMat, p)
    });

    showPoints('view', view);

    const near = -1;
    const far = -65;
    const fov = 90 / 180 * Math.PI;

    const screenW = 364;
    const screenH = 364;
    const aspectRatio = screenW / screenH;

    const halfWidth = Math.tan(fov / 2) * near;
    const halfHeight = halfWidth / aspectRatio;

    const projectionMatrix = new Mat4x4(
      near / halfWidth, 0, 0, 0,
      0, near / halfHeight, 0, 0,
      0, 0, (far + near) / (far - near), (-2 * far * near) / (far - near),
      0, 0, -1, 0
    );

    Mat4x4.printMatrix('projection matrix', projectionMatrix);

    // カメラ座標系をクリップ座標系に変換
    const clipping = view.map((p) => {
      return Mat4x4.multVec(projectionMatrix, p);
    });
    showPoints('clip', clipping);

    // クリップ座標系
    // ここでクリッピングする
    const clipTriangle = (_v0: Vec3d, _v1: Vec3d, _v2: Vec3d) => {

      const _initialPoly: Vec3d[] = [_v0, _v1, _v2];
      const clipWithPlane = (initialPoly: Vec3d[], compare: (v: Vec3d) => number) => { 
        const outPolygons: Vec3d[] = [];
        for (let i = 0; i < initialPoly.length; i++) {
          const v1 = initialPoly[i];
          const v2 = initialPoly[(i+1) % initialPoly.length]; // [(i+1) % poly.length]

          const d1 = compare(v1);
          const d2 = compare(v2);

          const getIntersectingPoint = () => {
            const t = d1 / (d1 - d2);
            return Vec3d.add(Vec3d.multScalar(1 - t, v1), Vec3d.multScalar(t, v2));
          }

          if (d1 > 0) {
            if (d2 > 0) {
              // 2点とも内側らしい
              outPolygons.push(v2);
            } else {
              // v1: 内側, v2: 外側
              outPolygons.push(getIntersectingPoint());
            }
          } else if (d2 > 0) {
            // v1: 外側, v2: 内側
            outPolygons.push(getIntersectingPoint());
            outPolygons.push(v2);
          }
        }
        return outPolygons;
      };

      const poly1 = clipWithPlane(_initialPoly, v => v.w - v.x);
      const poly2 = clipWithPlane(poly1, v => v.w + v.x);
      const poly3 = clipWithPlane(poly2, v => v.w - v.y);
      const poly4 = clipWithPlane(poly3, v => v.w + v.y);
      const poly5 = clipWithPlane(poly4, v => v.w - v.z);
      const poly = clipWithPlane(poly5, v => v.w + v.z);

      // console.log();
      // console.log(_initialPoly);
      // console.log(poly1);
      // console.log(poly2);
      // console.log(poly3);
      // console.log(poly4);
      // console.log(poly5);
      // console.log(poly);

      const newTriangles: [Vec3d, Vec3d, Vec3d][] = [];
      if (poly.length > 0) {
        const p1 = poly[0];
        for (let i = 1; i < poly.length - 1; i++) {
          const p2 = poly[i];
          const p3 = poly[(i+1) % poly.length];
          newTriangles.push([p1, p2, p3]);
        }
      }
      return newTriangles;
    };

    const trianglesToBeDrawn: Triangle[] = [];
    bindings.forEach((bind) => {
      const v0 = clipping[bind[0].v];
      const v1 = clipping[bind[1].v];
      const v2 = clipping[bind[2].v];
      const triangles = clipTriangle(v0, v1, v2);
      triangles.forEach(t => {
        trianglesToBeDrawn.push(t);
      });
    });

    const clipped = clipping;

    // クリップ座標系をデバイス座標系に変換
    // perspective devision
    const projection = clipped.map((p, i) => {
      // console.log(`pre p${i}: { x: ${proj.x.toFixed(3)}, y: ${proj.y.toFixed(3)}, z: ${proj.z.toFixed(3)}, w: ${proj.w.toFixed(3)} }`);
      return new Vec3d(p.x / p.w, p.y / p.w, p.z / p.w, p.w / p.w);
    });
    // showPoints('devided', projection);

    const screenHalfW = ctx.canvas.width / 2;
    const screenHalfH = ctx.canvas.height / 2;
    const screenPoints = projection.map((p) => {
      return new Vec3d(screenHalfW * p.x + screenHalfW, screenHalfH * -p.y + screenHalfH, p.z, p.w);
    });

    trianglesToBeDrawn.forEach((t) => {
      ctx.strokeStyle = "white";
      const projDevide = (p: Vec3d) => new Vec3d(p.x / p.w, p.y / p.w, p.z / p.w, p.w / p.w);
      const viewport = (p: Vec3d) => new Vec3d(screenHalfW * p.x + screenHalfW, screenHalfH * -p.y + screenHalfH, p.z, p.w);
      const ts = t.map( v => viewport(projDevide(v)) );
      const v0 = ts[0];
      const v1 = ts[1];
      const v2 = ts[2];
      ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(v0.x, v0.y, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(v1.x, v1.y, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(v2.x, v2.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // bindings.forEach((b) => {
    //   ctx.strokeStyle = "white";
    //   const v0 = screenPoints[b[0].v];
    //   const v1 = screenPoints[b[1].v];
    //   const v2 = screenPoints[b[2].v];
    //   ctx.beginPath();
    //     ctx.moveTo(v0.x, v0.y);
    //     ctx.lineTo(v1.x, v1.y);
    //     ctx.lineTo(v2.x, v2.y);
    //   ctx.closePath();
    //   ctx.stroke();
    // });


    // screenPoints.forEach((p) => {
    //   ctx.fillStyle = "white";
    //   ctx.beginPath();
    //   ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    //   ctx.fill();
    //   ctx.closePath();
    // });

    const animation = true;
    if (animation) {
      setTimeout(() => {
        this.draw();
      }, 100);
      // requestAnimationFrame(() => { this.draw(); });
    }
  }

}
