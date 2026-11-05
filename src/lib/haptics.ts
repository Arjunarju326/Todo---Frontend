/** Light tactile feedback when the device supports Vibration API. */
export function hapticTick(ms = 12) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
  } catch {
    /* ignore unsupported environments */
  }
}

export function hapticSelect() {
  hapticTick(14);
}
