export type UserRole = 'admin' | 'provider' | 'user'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Profile {
    id: string
    full_name: string | null
    email: string
    role: UserRole
    avatar_url: string | null
    created_at: string
}

export interface Service {
    id: string
    title: string
    slug: string
    description: string | null
    price_text: string
    category: string
    image_url: string | null
    created_at: string
}

export interface Booking {
    id: string
    user_id: string
    provider_id: string | null
    service_id: string | null
    booking_date: string
    time_slot: string
    status: BookingStatus
    address: string
    notes: string | null
    created_at: string
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at'>
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>
            }
            services: {
                Row: Service
                Insert: Omit<Service, 'id' | 'created_at'>
                Update: Partial<Omit<Service, 'id' | 'created_at'>>
            }
            bookings: {
                Row: Booking
                Insert: Omit<Booking, 'id' | 'created_at' | 'status'>
                Update: Partial<Omit<Booking, 'id' | 'created_at'>>
            }
        }
    }
}
