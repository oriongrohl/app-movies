export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string; // 🔥 STRING, no Date
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// // To parse this data:
// //
// //   import { Convert, MoviesResponse, Movie } from "./file";
// //
// //   const moviesResponse = Convert.toMoviesResponse(json);
// //
// // These functions will throw an error if the JSON doesn't
// // match the expected interface, even if the JSON is valid.

// export interface MoviesResponse {
//     page:          number;
//     results:       Movie[];
//     total_pages:   number;
//     total_results: number;
// }

// export interface Movie {
//     adult:             boolean;
//     backdrop_path:     string;
//     genre_ids:         number[];
//     id:                number;
//     original_language: string;
//     original_title:    string;
//     overview:          string;
//     popularity:        number;
//     poster_path:       string;
//     release_date:      Date;
//     title:             string;
//     video:             boolean;
//     vote_average:      number;
//     vote_count:        number;
// }

// // Converts JSON strings to/from your types
// // and asserts the results of JSON.parse at runtime
// export class Convert {
//     public static toMoviesResponse(json: string): MoviesResponse {
//         return cast(JSON.parse(json), r("MoviesResponse"));
//     }

//     public static moviesResponseToJson(value: MoviesResponse): string {
//         return JSON.stringify(uncast(value, r("MoviesResponse")), null, 2);
//     }
// }

// function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
//     const prettyTyp = prettyTypeName(typ);
//     const parentText = parent ? ` on ${parent}` : '';
//     const keyText = key ? ` for key "${key}"` : '';
//     throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
// }

// function prettyTypeName(typ: any): string {
//     if (Array.isArray(typ)) {
//         if (typ.length === 2 && typ[0] === undefined) {
//             return `an optional ${prettyTypeName(typ[1])}`;
//         } else {
//             return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
//         }
//     } else if (typeof typ === "object" && typ.literal !== undefined) {
//         return typ.literal;
//     } else {
//         return typeof typ;
//     }
// }

// function jsonToJSProps(typ: any): any {
//     if (typ.jsonToJS === undefined) {
//         const map: any = {};
//         typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
//         typ.jsonToJS = map;
//     }
//     return typ.jsonToJS;
// }

// function jsToJSONProps(typ: any): any {
//     if (typ.jsToJSON === undefined) {
//         const map: any = {};
//         typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
//         typ.jsToJSON = map;
//     }
//     return typ.jsToJSON;
// }

// function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
//     function transformPrimitive(typ: string, val: any): any {
//         if (typeof typ === typeof val) return val;
//         return invalidValue(typ, val, key, parent);
//     }

//     function transformUnion(typs: any[], val: any): any {
//         // val must validate against one typ in typs
//         const l = typs.length;
//         for (let i = 0; i < l; i++) {
//             const typ = typs[i];
//             try {
//                 return transform(val, typ, getProps);
//             } catch (_) {}
//         }
//         return invalidValue(typs, val, key, parent);
//     }

//     function transformEnum(cases: string[], val: any): any {
//         if (cases.indexOf(val) !== -1) return val;
//         return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
//     }

//     function transformArray(typ: any, val: any): any {
//         // val must be an array with no invalid elements
//         if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
//         return val.map(el => transform(el, typ, getProps));
//     }

//     function transformDate(val: any): any {
//         if (val === null) {
//             return null;
//         }
//         const d = new Date(val);
//         if (isNaN(d.valueOf())) {
//             return invalidValue(l("Date"), val, key, parent);
//         }
//         return d;
//     }

//     function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
//         if (val === null || typeof val !== "object" || Array.isArray(val)) {
//             return invalidValue(l(ref || "object"), val, key, parent);
//         }
//         const result: any = {};
//         Object.getOwnPropertyNames(props).forEach(key => {
//             const prop = props[key];
//             const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
//             result[prop.key] = transform(v, prop.typ, getProps, key, ref);
//         });
//         Object.getOwnPropertyNames(val).forEach(key => {
//             if (!Object.prototype.hasOwnProperty.call(props, key)) {
//                 result[key] = transform(val[key], additional, getProps, key, ref);
//             }
//         });
//         return result;
//     }

//     if (typ === "any") return val;
//     if (typ === null) {
//         if (val === null) return val;
//         return invalidValue(typ, val, key, parent);
//     }
//     if (typ === false) return invalidValue(typ, val, key, parent);
//     let ref: any = undefined;
//     while (typeof typ === "object" && typ.ref !== undefined) {
//         ref = typ.ref;
//         typ = typeMap[typ.ref];
//     }
//     if (Array.isArray(typ)) return transformEnum(typ, val);
//     if (typeof typ === "object") {
//         return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
//             : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
//             : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
//             : invalidValue(typ, val, key, parent);
//     }
//     // Numbers can be parsed by Date but shouldn't be.
//     if (typ === Date && typeof val !== "number") return transformDate(val);
//     return transformPrimitive(typ, val);
// }

// function cast<T>(val: any, typ: any): T {
//     return transform(val, typ, jsonToJSProps);
// }

// function uncast<T>(val: T, typ: any): any {
//     return transform(val, typ, jsToJSONProps);
// }

// function l(typ: any) {
//     return { literal: typ };
// }

// function a(typ: any) {
//     return { arrayItems: typ };
// }

// function u(...typs: any[]) {
//     return { unionMembers: typs };
// }

// function o(props: any[], additional: any) {
//     return { props, additional };
// }

// function m(additional: any) {
//     return { props: [], additional };
// }

// function r(name: string) {
//     return { ref: name };
// }

// const typeMap: any = {
//     "MoviesResponse": o([
//         { json: "page", js: "page", typ: 0 },
//         { json: "results", js: "results", typ: a(r("Movie")) },
//         { json: "total_pages", js: "total_pages", typ: 0 },
//         { json: "total_results", js: "total_results", typ: 0 },
//     ], false),
//     "Movie": o([
//         { json: "adult", js: "adult", typ: true },
//         { json: "backdrop_path", js: "backdrop_path", typ: "" },
//         { json: "genre_ids", js: "genre_ids", typ: a(0) },
//         { json: "id", js: "id", typ: 0 },
//         { json: "original_language", js: "original_language", typ: "" },
//         { json: "original_title", js: "original_title", typ: "" },
//         { json: "overview", js: "overview", typ: "" },
//         { json: "popularity", js: "popularity", typ: 3.14 },
//         { json: "poster_path", js: "poster_path", typ: "" },
//         { json: "release_date", js: "release_date", typ: Date },
//         { json: "title", js: "title", typ: "" },
//         { json: "video", js: "video", typ: true },
//         { json: "vote_average", js: "vote_average", typ: 3.14 },
//         { json: "vote_count", js: "vote_count", typ: 0 },
//     ], false),
// };
