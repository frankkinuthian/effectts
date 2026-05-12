import { Schema } from "effect";

// Schema.Class creates both a runtime decoder and a TypeScript type.
// When we decode unknown data through this schema, Effect will return
// a ParseError if the shape doesn't match — no manual validation needed.

export class Pokemon extends Schema.Class<Pokemon>("Pokemon")({
  id: Schema.Number,
  order: Schema.Number,
  name: Schema.String,
  height: Schema.Number,
  weight: Schema.Number,
}) {}
