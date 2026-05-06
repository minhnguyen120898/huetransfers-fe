// Travel Agency
export interface TravelAgency {
  id: string;
  name: string;
  tel: string;
  address: string;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelAgencyDto {
  name: string;
  tel: string;
  address: string;
  note?: string;
}

export interface UpdateTravelAgencyDto {
  name?: string;
  tel?: string;
  address?: string;
  note?: string;
  isActive?: boolean;
}

// Guide
export interface Guide {
  id: string;
  name: string;
  phone: string;
  email: string;
  languages: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuideDto {
  name: string;
  phone: string;
  email: string;
  languages: string[];
}

export interface UpdateGuideDto {
  name?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  isActive?: boolean;
}

// Restaurant
export interface Restaurant {
  id: string;
  name: string;
  tel: string;
  address: string;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantDto {
  name: string;
  tel: string;
  address: string;
  note?: string;
}

export interface UpdateRestaurantDto {
  name?: string;
  tel?: string;
  address?: string;
  note?: string;
  isActive?: boolean;
}

// Transport Provider
export interface TransportProvider {
  id: string;
  name: string;
  vehicleType: string;
  tel: string;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransportProviderDto {
  name: string;
  vehicleType: string;
  tel: string;
  note?: string;
}

export interface UpdateTransportProviderDto {
  name?: string;
  vehicleType?: string;
  tel?: string;
  note?: string;
  isActive?: boolean;
}
