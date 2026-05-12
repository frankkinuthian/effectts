import { Effect, Context, Config, Schema } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseResult } from "effect";
import { Pokemon } from "../schemas/index";
import { FetchError, JsonError } from "../errors/index";

// --- Service interface ---
// Defines WHAT the service can do, not HOW it does it.
// This separation lets us swap implementations (e.g., a mock for testing).

export interface PokeApi {
  // Use the instance type directly — Pokemon (the class) is both
  // the schema and the TypeScript type for decoded values.
  readonly getPokemon: Effect.Effect<
    Pokemon,
    FetchError | JsonError | ParseResult.ParseError | ConfigError
  >;
}

// Context.GenericTag creates a unique tag for dependency injection.
// Effect uses this tag to look up the correct implementation at runtime.
export const PokeApi = Context.GenericTag<PokeApi>("PokeApi");

// --- Production implementation ---
// PokeApi.of creates a concrete instance of the service.
// By convention, the production implementation has a -Live suffix.
// You can create as many implementations as needed (e.g., PokeApiTest, PokeApiMock).

export const PokeApiLive = PokeApi.of({
  // getPokemon is a lazy Effect — nothing runs until it's executed.
  getPokemon: Effect.gen(function* () {
    // Read BASE_URL from environment/config at runtime.
    // If missing, this yields a ConfigError automatically.
    const baseUrl = yield* Config.string("BASE_URL");

    // Fetch the API. tryPromise wraps a Promise in an Effect and
    // maps any thrown error to our typed FetchError.
    const response = yield* Effect.tryPromise({
      try: () => fetch(`${baseUrl}/api/v2/pokemon/garchomp/`),
      catch: () => new FetchError(),
    });

    // Check for non-2xx responses and short-circuit with FetchError.
    if (!response.ok) {
      return yield* new FetchError();
    }

    // Parse JSON from the response. Failures become JsonError.
    const json = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new JsonError(),
    });

    // Decode the raw JSON into our Pokemon schema.
    // If the data doesn't match the schema, a ParseError is raised.
    return yield* Schema.decodeUnknown(Pokemon)(json);
  }),
});

// --- Test implementation ---
// A mock that returns a hardcoded Pokemon without hitting the network.
// Useful for unit tests or local development without API access.

// export const PokeApiTest = PokeApi.of({
//   getPokemon: Effect.succeed(
//     new Pokemon({
//       id: 1,
//       height: 10,
//       weight: 10,
//       order: 1,
//       name: "testmon",
//     }),
//   ),
// });
