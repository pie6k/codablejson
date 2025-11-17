import type * as _ from "temporal-polyfill/global";

import { AnyClass } from "./types";
import { codableType } from "./CodableType";

type TemporalNamespace = typeof globalThis.Temporal;

type AnyTemporalClass = { new (...args: any[]): any; from(isoString: string): any };

function createTemporalTypeFromClass<T extends AnyTemporalClass>(name: string, TemporalClass: T) {
  return codableType(
    name,
    (thing): thing is typeof TemporalClass => thing instanceof TemporalClass,
    (temporal) => temporal.toString(),
    (isoString) => TemporalClass.from(isoString),
  );
}

export function createTemporalTypes(Temporal: TemporalNamespace) {
  const classes = {
    Instant: Temporal.Instant,
    Duration: Temporal.Duration,
    PlainDate: Temporal.PlainDate,
    PlainDateTime: Temporal.PlainDateTime,
    PlainMonthDay: Temporal.PlainMonthDay,
    PlainTime: Temporal.PlainTime,
    PlainYearMonth: Temporal.PlainYearMonth,
    ZonedDateTime: Temporal.ZonedDateTime,
  } as const;

  return Object.entries(classes).map(([name, TemporalClass]) => {
    return createTemporalTypeFromClass(name, TemporalClass);
  });
}

export const temporalTypes =
  typeof globalThis.Temporal !== "undefined" ? createTemporalTypes(globalThis.Temporal) : null;
