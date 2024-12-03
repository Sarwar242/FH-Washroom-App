export interface User {
    id: number;
    name: string;
    employee_id: string;
  }
  
export interface WashroomSectionProps {
    washroom: Washroom;
    user: { name: string } | null;
    onOccupy: (toiletId: number) => void;
    onRelease: (toiletId: number) => void;
    onJoinWaitlist: (toiletId: number) => void;
    waitingForToilets: number[];
}

export interface Washroom {
    id: number;
    name: string;
    floor: string;
    type: 'male' | 'female' | 'unisex';
    is_operational: boolean;
    available_toilets: number;
    total_toilets: number;
    toilets: Toilet[];
  }

export interface Toilet {
    id: number;
    number: string;
    is_occupied: boolean;
    occupied_by: string | null;
    time_remaining: number | null;
}