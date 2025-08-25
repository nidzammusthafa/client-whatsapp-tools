export interface Address {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  rating?: number | null;
  reviews?: number | null;
  website?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  url?: string | null;
  odp?: string | null;
  distance?: string | null;
  status?: string | null;
  isBusiness: boolean;
  businessName?: string | null;
  businessCategory?: string | null;
  hasReceivedMessage: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
