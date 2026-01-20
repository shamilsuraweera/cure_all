const DURATION_REGEX = /^(\d+)([smhd])$/i;

const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const durationToMs = (value: string) => {
  const match = DURATION_REGEX.exec(value);
  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return amount * UNIT_TO_MS[unit];
};
