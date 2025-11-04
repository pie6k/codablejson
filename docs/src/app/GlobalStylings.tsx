"use client";

import * as codablejson from "../../../codablejson";

import { useEffect } from "react";

export function GlobalStylings() {
  useEffect(() => {
    Reflect.set(window, "codablejson", Object.fromEntries(Object.entries(codablejson)));

    import("superjson")
      .then(({ default: superjson }) => {
        Reflect.set(window, "superjson", Object.fromEntries(Object.entries(superjson)));
      })
      .catch(() => {});
  });
  return null;
}
