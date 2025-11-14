import { setSuperjsonTransformer } from "./compat";
import superjson from "superjson";

export function enableSuperjsonCompatibility() {
  // console.info("[CodableJSON] Enabling SuperJSON compatibility mode");
  setSuperjsonTransformer(superjson);
}

export function disableSuperjsonCompatibility() {
  setSuperjsonTransformer(null);
}

enableSuperjsonCompatibility();
