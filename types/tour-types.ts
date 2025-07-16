export interface InfoPoint {
  id: string;
  yaw: number;
  pitch: number;
  distance: number;
  title: string;
  description: string;
  details?: string;
  icon: string;
  linkTo?: string;
}

export interface TourLocation {
  id: string;
  name: string;
  description: string;
  image: string;
  infoPoints: InfoPoint[];
}

export interface TourData {
  locations: TourLocation[];
}
