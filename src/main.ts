window.addEventListener("DOMContentLoaded", () => {
  const canvas: HTMLCanvasElement = document.getElementById(
    "canvas"
  ) as HTMLCanvasElement;
  const app = new App(canvas);
  app.run();
});

class Vec4 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w = 1
  ) {}
}

class Mat4x4 {
  constructor(
    public m11 = 1, public m12 = 0, public m13 = 0, public m14 = 0,
    public m21 = 0, public m22 = 1, public m23 = 0, public m24 = 0,
    public m31 = 0, public m32 = 0, public m33 = 1, public m34 = 0,
    public m41 = 0, public m42 = 0, public m43 = 0, public m44 = 1
  ) {}

  static mult(a: Mat4x4, b: Mat4x4) {
    new Mat4x4(
      a.m11 * b.m11 + a.m12 + b.m21 + a.m13 * b.m31 + a.m14 * b.m41,
      a.m11 * b.m12 + a.m12 + b.m22 + a.m13 * b.m32 + a.m14 * b.m42,
      a.m11 * b.m13 + a.m12 + b.m23 + a.m13 * b.m33 + a.m14 * b.m43,
      a.m11 * b.m14 + a.m12 + b.m24 + a.m13 * b.m34 + a.m14 * b.m44,

      a.m21 * b.m11 + a.m22 + b.m21 + a.m23 * b.m31 + a.m24 * b.m41,
      a.m21 * b.m12 + a.m22 + b.m22 + a.m23 * b.m32 + a.m24 * b.m42,
      a.m21 * b.m13 + a.m22 + b.m23 + a.m23 * b.m33 + a.m24 * b.m43,
      a.m21 * b.m14 + a.m22 + b.m24 + a.m23 * b.m34 + a.m24 * b.m44,

      a.m31 * b.m11 + a.m32 + b.m21 + a.m33 * b.m31 + a.m34 * b.m41,
      a.m31 * b.m12 + a.m32 + b.m22 + a.m33 * b.m32 + a.m34 * b.m42,
      a.m31 * b.m13 + a.m32 + b.m23 + a.m33 * b.m33 + a.m34 * b.m43,
      a.m31 * b.m14 + a.m32 + b.m24 + a.m33 * b.m34 + a.m34 * b.m44,

      a.m41 * b.m11 + a.m42 + b.m21 + a.m43 * b.m31 + a.m44 * b.m41,
      a.m41 * b.m12 + a.m42 + b.m22 + a.m43 * b.m32 + a.m44 * b.m42,
      a.m41 * b.m13 + a.m42 + b.m23 + a.m43 * b.m33 + a.m44 * b.m43,
      a.m41 * b.m14 + a.m42 + b.m24 + a.m43 * b.m34 + a.m44 * b.m44
    );
  }

  static multVec(m: Mat4x4, v: Vec4) {
    return new Vec4(
      m.m11 * v.x + m.m12 * v.y + m.m13 * v.z + m.m14 * v.w,
      m.m21 * v.x + m.m22 * v.y + m.m23 * v.z + m.m24 * v.w,
      m.m31 * v.x + m.m32 * v.y + m.m33 * v.z + m.m34 * v.w,
      m.m41 * v.x + m.m42 * v.y + m.m43 * v.z + m.m44 * v.w
    );
  }
}

class App {
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = 364;
    canvas.height = 364;
    this.canvas = canvas;
    this.context2d = canvas.getContext("2d")!;
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
    const halfW = ctx.canvas.width / 2;
    const halfH = ctx.canvas.height / 2;

    this.theta += 0.2;
    const t = this.theta;

    let localVertices = [
      new Vec4(0, 0, 0),
      new Vec4(2, 1, 0),
      new Vec4(1, 2, 1),
    ];

    const matRotateY = new Mat4x4(
      Math.cos(t), 0, -Math.sin(t), 0,
      0, 1, 0, 0,
      Math.sin(t), 0, Math.sin(t), 0,
      0, 0, 0, 1
    );

    localVertices = localVertices.map((p) => {
      return Mat4x4.multVec(matRotateY, p);
    });

    const world = localVertices.map((p) => {
      return new Vec4(p.x, p.y, p.z);
    });

    const view = world.map((p) => {
      // lookAt
      return new Vec4(p.x, p.y, p.z + 3);
    });

    const projection = view.map((p) => {
      return new Vec4(p.x / p.z, p.y / p.z, p.z);
    });

    const screenPoints = projection.map((p) => {
      return new Vec4(halfW * p.x + halfW, halfH * -p.y + halfH, 0);
    });

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    screenPoints.forEach((p) => {
      ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();

    screenPoints.forEach((p) => {
      ctx.fillStyle = "white";
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    });

    setTimeout(() => {
      this.draw();
    }, 33);
  }
}
