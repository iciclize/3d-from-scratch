type Vertex = [number, number, number];
type TexVertex = [number, number];
type VertexExt = {
  vertex: Vertex,
  normal: Vertex,
  texture: TexVertex,
}
export type Polygon = [VertexExt, VertexExt, VertexExt];
type BindingElem = {v: number, t: number, n: number};
export type Binding = [BindingElem, BindingElem, BindingElem];

export class Model {
  _name = "";
  _vertices: Vertex[] = [];
  _normals: Vertex[] = [];
  _texVertices: TexVertex[] = [];
  _polygons: Polygon[] = [];
  _bindings: Binding[] = [];

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
          const bindings = [1, 2, 3].map((i) => {
            const vtn = tokens[i].split('/');
            return {
              v: parseInt(vtn[0]) - 1,
              t: parseInt(vtn[1]) - 1,
              n: parseInt(vtn[2]) - 1,
            };
          }) as Binding;
          this._bindings.push(bindings);
          const polygon = bindings.map((b) => {
            const vExt: VertexExt = {
              vertex: this._vertices[b.v],
              normal: this._normals[b.n],
              texture: this._texVertices[b.t],
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