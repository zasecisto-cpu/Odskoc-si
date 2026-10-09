export interface OpeningHourRange {
  open: string;
  close: string;
}

export interface OpeningHours {
  mon: OpeningHourRange;
  tue: OpeningHourRange;
  wed: OpeningHourRange;
  thu: OpeningHourRange;
  fri: OpeningHourRange;
  sat: OpeningHourRange;
  sun: OpeningHourRange;
  summary: string;
}

export interface PlaceRatings {
  admittedYes: number;
  admittedNo: number;
  cleanlinessSum: number;
  cleanlinessCount: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  barrierFree: boolean;
  changingTable: boolean;
  openingHours: OpeningHours;
  ratings: PlaceRatings;
  note?: string;
  distanceMeters?: number;
}

export interface RatingSubmission {
  placeId: string;
  admitted: boolean;
  cleanliness: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
