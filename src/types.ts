export interface Startup {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  crackedCount: number;
  cookedCount: number;
}

export interface User {
  _id: string;
  email: string;
  ratings: Record<string, 'CRACKED' | 'COOKED'>;
}
