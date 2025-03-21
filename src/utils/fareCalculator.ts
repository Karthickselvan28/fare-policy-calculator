import { FarePolicy, FareData } from "../types/fare";

export const calculateFare = (distance: number, policy: FarePolicy): number => {
  let totalFare = policy.baseFare + policy.pickupCharges;

  // Calculate fare for extra kilometers beyond base kilometers
  if (distance > policy.baseKilometers) {
    let currentDistance = policy.baseKilometers;
    let currentCharge = policy.perExtraKmCharge;

    // Sort threshold fares by threshold in ascending order
    const sortedThresholds = [...policy.thresholdFares].sort(
      (a, b) => a.threshold - b.threshold
    );

    // Calculate fare for each segment
    for (const threshold of sortedThresholds) {
      if (distance > threshold.threshold) {
        // Add fare for the segment before this threshold
        const segmentDistance = threshold.threshold - currentDistance;
        totalFare += segmentDistance * currentCharge;
        currentDistance = threshold.threshold;
        currentCharge = threshold.charge;
      }
    }

    // Add fare for the final segment
    if (distance > currentDistance) {
      const finalSegmentDistance = distance - currentDistance;
      totalFare += finalSegmentDistance * currentCharge;
    }
  }

  return totalFare;
};

export const generateFareData = (
  policy: FarePolicy,
  maxDistance: number = 50
): FareData[] => {
  const data: FareData[] = [];
  const step = 1; // Use whole kilometers

  // Generate data points from 2 to maxDistance
  for (let distance = 2; distance <= maxDistance; distance += step) {
    const fare = calculateFare(distance, policy);
    const peakTimeFare = fare * (1 + policy.congestionPercentage / 100);
    data.push({
      distance: distance,
      fare: Number(fare.toFixed(2)),
      farePerKm: Number((fare / distance).toFixed(2)),
      peakTimeFare: Number(peakTimeFare.toFixed(2)),
      peakTimeFarePerKm: Number((peakTimeFare / distance).toFixed(2)),
    });
  }

  // Add points at policy change boundaries for better visualization
  const boundaries = [
    policy.baseKilometers,
    ...policy.thresholdFares.map((t) => t.threshold),
  ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  for (const boundary of boundaries) {
    if (boundary <= maxDistance) {
      const fare = calculateFare(boundary, policy);
      const peakTimeFare = fare * (1 + policy.congestionPercentage / 100);
      data.push({
        distance: boundary,
        fare: Number(fare.toFixed(2)),
        farePerKm: Number((fare / boundary).toFixed(2)),
        peakTimeFare: Number(peakTimeFare.toFixed(2)),
        peakTimeFarePerKm: Number((peakTimeFare / boundary).toFixed(2)),
      });
    }
  }

  // Sort by distance to ensure proper graph rendering
  return data.sort((a, b) => a.distance - b.distance);
};
