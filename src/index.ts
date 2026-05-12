import { Effect } from "effect";
import { PokeApi, PokeApiLive } from "./services/PokeApi";

// --- Program ---
// Full Effect implementation with errors and dependencies included in the type.
// Type: Effect<Pokemon, FetchError | JsonError | ParseError | ConfigError, PokeApi>
//
// Effect.gen gives us async/await-like syntax for composing Effects.
// yield* "unwraps" each Effect, short-circuiting on the first error.

const program = Effect.gen(function* () {
  // Pull the PokeApi service from context (dependency injection).
  // At this point we don't know the implementation — just the interface.
  const pokeApi = yield* PokeApi;

  // Call the service method and unwrap the result.
  return yield* pokeApi.getPokemon;
});

// --- Runnable ---
// Provide all the dependencies to program to make the third type parameter `never`.
// Type: Effect<Pokemon, FetchError | JsonError | ParseError | ConfigError, never>
//
// Effect.provideService takes:
//   1. The service Context tag (PokeApi)
//   2. The concrete implementation (PokeApiLive)

const runnable = program.pipe(Effect.provideService(PokeApi, PokeApiLive));

// --- Main ---
// Handle all the errors from runnable to make the second type parameter `never`.
// Type: Effect<Pokemon | string, never, never>
//
// catchTags gives us exhaustive, type-safe error recovery.
// Each tag corresponds to a specific failure mode.

const main = runnable.pipe(
  Effect.catchTags({
    // Network or connection failure
    FetchError: () => Effect.succeed("Fetch error"),
    // Response body wasn't valid JSON
    JsonError: () => Effect.succeed("Json error"),
    // JSON didn't match the Pokemon schema
    ParseError: () => Effect.succeed("Parse error"),
    // BASE_URL env variable is missing or invalid
    ConfigError: () => Effect.succeed("Config error"),
  }),
);

// --- Execution ---
// Both error (E) and dependency (R) channels are `never`,
// so Effect.runPromise can safely execute this without further requirements.

Effect.runPromise(main).then(console.log);
