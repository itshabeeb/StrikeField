export type Exposure = "sheltered" | "similar" | "open" | "hilltop";

export type RiskResult = {
  strikingDistance: number;
  collectionRadius: number;
  collectionAreaKm2: number;
  expectedStrikesPerYear: number;
  returnPeriodYears: number;
  riskLevel: "Low" | "Moderate" | "High";
  statusColor: "green" | "orange" | "red";
};

export function calculateLightningRisk(
  height: number,
  ng: number,
  exposureFactor: number,
  currentKa: number,
): RiskResult {
  const strikingDistance = 10 * currentKa ** 0.65;
  const collectionRadius = 3 * height;
  const collectionAreaKm2 = Math.PI * collectionRadius ** 2 * 1e-6;
  const expectedStrikesPerYear = ng * collectionAreaKm2 * exposureFactor;
  const returnPeriodYears = expectedStrikesPerYear > 0 ? 1 / expectedStrikesPerYear : Infinity;

  if (expectedStrikesPerYear < 1e-3) {
    return {
      strikingDistance,
      collectionRadius,
      collectionAreaKm2,
      expectedStrikesPerYear,
      returnPeriodYears,
      riskLevel: "Low",
      statusColor: "green",
    };
  }
  if (expectedStrikesPerYear < 1e-2) {
    return {
      strikingDistance,
      collectionRadius,
      collectionAreaKm2,
      expectedStrikesPerYear,
      returnPeriodYears,
      riskLevel: "Moderate",
      statusColor: "orange",
    };
  }
  return {
    strikingDistance,
    collectionRadius,
    collectionAreaKm2,
    expectedStrikesPerYear,
    returnPeriodYears,
    riskLevel: "High",
    statusColor: "red",
  };
}

export function estimateLocation(latitude: number) {
  const absoluteLatitude = Math.abs(latitude);
  if (absoluteLatitude < 15) return { ng: 12, region: "Tropical" };
  if (absoluteLatitude < 30) return { ng: 8, region: "Subtropical" };
  if (absoluteLatitude < 50) return { ng: 4, region: "Temperate" };
  if (absoluteLatitude < 70) return { ng: 1.5, region: "Cool temperate" };
  return { ng: 0.5, region: "Polar" };
}

export function estimateStormPotential(latitude: number) {
  const absoluteLatitude = Math.abs(latitude);
  if (absoluteLatitude < 5) {
    return { label: "Low", score: 24, explanation: "Very near the equator, weak Coriolis force limits organized rotation." };
  }
  if (absoluteLatitude < 20) {
    return { label: "High", score: 84, explanation: "Warm tropical latitudes can support rising moist air and organized rotation." };
  }
  if (absoluteLatitude < 60) {
    return { label: "Moderate", score: 58, explanation: "Conditions vary seasonally and geographically across active storm tracks." };
  }
  return { label: "Low", score: 20, explanation: "Cold, dry conditions generally provide less support for tropical development." };
}
