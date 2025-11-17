import "temporal-polyfill/global";

import { codablejson } from "../Coder";

describe("Temporal", () => {
  describe("Instant", () => {
    it("should encode and decode Instant", () => {
      const instant = Temporal.Instant.from("1970-01-01T00:00:00.000000000Z");
      const encoded = codablejson.encode(instant);
      expect(encoded).toEqual({
        $$Instant: "1970-01-01T00:00:00Z",
      });

      const decoded = codablejson.decode<typeof instant>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.Instant);
      expect(decoded).toEqual(instant);
    });
  });

  describe("Duration", () => {
    it("should encode and decode Duration", () => {
      const duration = Temporal.Duration.from({
        days: 1,
        hours: 2,
        minutes: 3,
        seconds: 4,
        milliseconds: 5,
        microseconds: 6,
        nanoseconds: 7,
      });
      const encoded = codablejson.encode(duration);
      expect(encoded).toEqual({
        $$Duration: "P1DT2H3M4.005006007S",
      });

      const decoded = codablejson.decode<typeof duration>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.Duration);
      expect(decoded).toEqual(duration);
    });
  });

  describe("PlainDate", () => {
    it("should encode and decode PlainDate", () => {
      const plainDate = Temporal.PlainDate.from("1970-01-01");
      const encoded = codablejson.encode(plainDate);
      expect(encoded).toEqual({
        $$PlainDate: "1970-01-01",
      });

      const decoded = codablejson.decode<typeof plainDate>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.PlainDate);
      expect(decoded).toEqual(plainDate);
    });
  });

  describe("PlainDateTime", () => {
    it("should encode and decode PlainDateTime", () => {
      const plainDateTime = Temporal.PlainDateTime.from("1970-01-01T00:00:00");
      const encoded = codablejson.encode(plainDateTime);
      expect(encoded).toEqual({
        $$PlainDateTime: "1970-01-01T00:00:00",
      });

      const decoded = codablejson.decode<typeof plainDateTime>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.PlainDateTime);
      expect(decoded).toEqual(plainDateTime);
    });
  });

  describe("PlainMonthDay", () => {
    it("should encode and decode PlainMonthDay", () => {
      const plainMonthDay = Temporal.PlainMonthDay.from("01-01");
      const encoded = codablejson.encode(plainMonthDay);
      expect(encoded).toEqual({
        $$PlainMonthDay: "01-01",
      });

      const decoded = codablejson.decode<typeof plainMonthDay>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.PlainMonthDay);
      expect(decoded).toEqual(plainMonthDay);
    });
  });

  describe("PlainTime", () => {
    it("should encode and decode PlainTime", () => {
      const plainTime = Temporal.PlainTime.from("00:00:00");
      const encoded = codablejson.encode(plainTime);
      expect(encoded).toEqual({
        $$PlainTime: "00:00:00",
      });

      const decoded = codablejson.decode<typeof plainTime>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.PlainTime);
      expect(decoded).toEqual(plainTime);
    });
  });

  describe("PlainYearMonth", () => {
    it("should encode and decode PlainYearMonth", () => {
      const plainYearMonth = Temporal.PlainYearMonth.from("1970-01");
      const encoded = codablejson.encode(plainYearMonth);
      expect(encoded).toEqual({
        $$PlainYearMonth: "1970-01",
      });

      const decoded = codablejson.decode<typeof plainYearMonth>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.PlainYearMonth);
      expect(decoded).toEqual(plainYearMonth);
    });
  });

  describe("ZonedDateTime", () => {
    it("should encode and decode ZonedDateTime", () => {
      const zonedDateTime = Temporal.ZonedDateTime.from("2025-11-17T22:23:15.704+01:00[Europe/Warsaw]");
      const encoded = codablejson.encode(zonedDateTime);
      expect(encoded).toEqual({
        $$ZonedDateTime: "2025-11-17T22:23:15.704+01:00[Europe/Warsaw]",
      });

      const decoded = codablejson.decode<typeof zonedDateTime>(encoded);
      expect(decoded).toBeInstanceOf(Temporal.ZonedDateTime);
      expect(decoded).toEqual(zonedDateTime);
    });
  });
});
