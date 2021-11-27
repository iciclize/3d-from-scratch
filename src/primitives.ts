export type Triangle = [ Vec3d, Vec3d, Vec3d ];

const DEBUG = false;

export class Vec3d {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w = 1
  ) { }

  norm() {
    const len = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    if (len > 0) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    } else {
      this.x = this.y = this.z = 0;
    }
    return this;
  }

  static add(a: Vec3d, b: Vec3d) {
    return new Vec3d(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
  }

  static sub(a: Vec3d, b: Vec3d) {
    return new Vec3d(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
  }

  static multScalar(k: number, v: Vec3d) {
    return new Vec3d(k * v.x, k * v.y, k * v.z, k * v.w);
  }

  static inv(v: Vec3d) {
    return new Vec3d(-v.x, -v.y, -v.z, -v.w);
  }

  static dot(a: Vec3d, b: Vec3d) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a: Vec3d, b: Vec3d) {
    return new Vec3d(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static printVector(str: string, v: Vec3d) {
    if (!DEBUG) return;
    console.log(`${str}: { x: ${v.x}, y: ${v.y}, z: ${v.z}, w: ${v.w}}`);
  }
}

export class Mat4x4 {
  constructor(
    public m11 = 1, public m12 = 0, public m13 = 0, public m14 = 0,
    public m21 = 0, public m22 = 1, public m23 = 0, public m24 = 0,
    public m31 = 0, public m32 = 0, public m33 = 1, public m34 = 0,
    public m41 = 0, public m42 = 0, public m43 = 0, public m44 = 1
  ) { }

  static mult(a: Mat4x4, b: Mat4x4) {
    return new Mat4x4(
      a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41,
      a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42,
      a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43,
      a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44,

      a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41,
      a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42,
      a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43,
      a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44,

      a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41,
      a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42,
      a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43,
      a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44,

      a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41,
      a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42,
      a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43,
      a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44
    );
  }

  static multVec(m: Mat4x4, v: Vec3d) {
    return new Vec3d(
      m.m11 * v.x + m.m12 * v.y + m.m13 * v.z + m.m14 * v.w,
      m.m21 * v.x + m.m22 * v.y + m.m23 * v.z + m.m24 * v.w,
      m.m31 * v.x + m.m32 * v.y + m.m33 * v.z + m.m34 * v.w,
      m.m41 * v.x + m.m42 * v.y + m.m43 * v.z + m.m44 * v.w
    );
  }

  static printMatrix(str: string, m: Mat4x4) {
    if (!DEBUG) return;
    console.log(`${str}:
  ${m.m11.toFixed(3)} ${m.m12.toFixed(3)} ${m.m13.toFixed(3)} ${m.m14.toFixed(3)}
  ${m.m21.toFixed(3)} ${m.m22.toFixed(3)} ${m.m23.toFixed(3)} ${m.m24.toFixed(3)}
  ${m.m31.toFixed(3)} ${m.m32.toFixed(3)} ${m.m33.toFixed(3)} ${m.m34.toFixed(3)}
  ${m.m41.toFixed(3)} ${m.m42.toFixed(3)} ${m.m43.toFixed(3)} ${m.m44.toFixed(3)}`);
  }
}