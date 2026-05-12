import { Data } from "effect";

// Tagged errors give us a discriminated union for type-safe error handling.
// Each error carries a _tag field that Effect.catchTags can match on.

/** Represents a failure to reach the API (network issue, bad URL, etc.) */
export class FetchError extends Data.TaggedError("FetchError")<{}> {}

/** Represents a failure to parse the response body as JSON */
export class JsonError extends Data.TaggedError("JsonError")<{}> {}
