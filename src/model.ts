type Vertex = [number, number, number];
type TexVertex = [number, number];
type VertexExt = {
  vertex: Vertex,
  normal: Vertex,
  texture: TexVertex,
}
export type Polygon = [VertexExt, VertexExt, VertexExt];

export class Model {
  _name = "";
  _vertices: Vertex[] = [];
  _normals: Vertex[] = [];
  _texVertices: TexVertex[] = [];
  _polygons: Polygon[] = [];

  constructor(rawText: string | null | undefined) {
    if (rawText === null || rawText === undefined) {
      return this;
    }
    this.loadModel(rawText);
  }

  loadModel(rawText: string): void {
    const lines = rawText.split('\n');
    lines.forEach((line) => {
      const tokens = line.split(' ');
      switch (tokens[0]) {
        case '#': {
          break;
        }
        case 'o': {
          this._name = tokens[1];
          break;
        }
        case 'v': {
          const v = [1, 2, 3].map((i) => {
            return parseFloat(tokens[i]);
          }) as Vertex;
          this._vertices.push(v);
          break;
        }
        case 'vt': {
          const vt = [1, 2].map((i) => {
            return parseFloat(tokens[i]);
          }) as TexVertex;
          this._texVertices.push(vt);
          break;
        }
        case 'vn': {
          const vn = [1, 2, 3].map((i) => {
            return parseFloat(tokens[i]);
          }) as Vertex;
          this._normals.push(vn);
          break;
        }
        case 'f': {
          const binds = [1, 2, 3].map((i) => {
            const vtn = tokens[i].split('/');
            return {
              v: parseInt(vtn[0]),
              t: parseInt(vtn[1]),
              n: parseInt(vtn[2])
            };
          });
          const v1i = binds[0].v - 1;
          const v2i = binds[1].v - 1;
          const v3i = binds[2].v - 1;
          const polygon = [v1i, v2i, v3i].map((i) => {
            const vExt: VertexExt = {
              vertex: this._vertices[i],
              normal: this._normals[i],
              texture: this._texVertices[i],
            };
            return vExt;
          }) as Polygon;
          this._polygons.push(polygon);
          break;
        }
        case 'usemtl': {
          break;
        }
        case 'mtllib': {
          break;
        }
        case 's': {
          break;
        }
        default: {
          break;
        }
      }
    });
  }
}