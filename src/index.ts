import { Effect } from "effect";

const promiseRequest = () =>
  fetch("https://pokeapi.co/api/v2/pokemon/garchomp/");

const fetchRequest = Effect.tryPromise(promiseRequest);

const jsonResponse = (response: Response) =>
  Effect.promise(() => response.json());


const main = Effect.flatMap(fetchRequest, jsonResponse);

Effect.runPromise(main).then(console.log);
