export type City =
  | "Bangalore"
  | "Mysore"
  | "Tumkur"
  | "Chennai"
  | "Trichy"
  | "Hyderabad"
  | "Kolkata"
  | "TamilNaduCities";

export type VehicleVariant =
  | "AUTO_RICKSHAW"
  | "HATCHBACK"
  | "SEDAN"
  | "SUV"
  | "SUV_PLUS";

export type Area =
  | "default"
  | "airport"
  | "railway station"
  | "metro stations"
  | "hospitals"
  | "parks";

export interface ThresholdFare {
  threshold: number;
  charge: number;
}

export interface FarePolicy {
  city: City;
  variant: VehicleVariant;
  area: Area;
  description: string;
  baseKilometers: number;
  baseFare: number;
  perExtraKmCharge: number;
  pickupCharges: number;
  thresholdFares: ThresholdFare[];
  congestionPercentage: number;
}

export interface FareData {
  distance: number;
  fare: number;
  farePerKm: number;
  peakTimeFare: number;
  peakTimeFarePerKm: number;
}
