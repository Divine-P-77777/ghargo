import { createClient } from '@/lib/supabase/server'
import { ProviderDashboard } from './ProviderDashboard'
import { redirect } from 'next/navigation'

export default async function ProviderDashboardPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/auth/login')
    }

    // 2. Fetch Available Bookings (Pending)
    // Note: We need 'bookings' table to have RLS policy allowing provider to see pending
    const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .is('provider_id', null)
        .order('created_at', { ascending: false })

    // 3. Fetch My Bookings (Confirmed/Completed)
    const { data: myBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', user.id)
        .order('booking_date', { ascending: true })

    return (
        <div className="container py-8 max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
                    <p className="text-muted-foreground">Manage your jobs and schedule</p>
                </div>
            </div>

            <ProviderDashboard
                pendingBookings={pendingBookings || []}
                myBookings={myBookings || []}
            />
        </div>
    )
}
