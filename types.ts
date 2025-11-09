
export interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  imageUrl: string;
  mapsUri: string;
  mapsTitle: string;
}

export const CATEGORIES = ['All', 'Beach', 'Viewpoint', 'Park', 'Temple', 'Hotspot'] as const;
export type Category = typeof CATEGORIES[number];
