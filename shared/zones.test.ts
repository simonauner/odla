import { describe, expect, it } from "vitest";
import { guessLastFrost } from "./zones";

describe("guessLastFrost", () => {
  it("uses the zone's date in the open and three weeks earlier in a greenhouse", () => {
    expect(guessLastFrost(4, 2027, "open")).toBe("2027-05-30");
    expect(guessLastFrost(4, 2027, "greenhouse")).toBe("2027-05-09");
  });
});
