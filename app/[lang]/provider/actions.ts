'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptBooking(bookingId: string) {
    const supabase = await createClient()

    // Get current user (provider)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Update booking
    const { error } = await supabase
        .from('bookings')
        .update({
            provider_id: user.id,
            status: 'confirmed'
        })
        .eq('id', bookingId)
        .is('provider_id', null) // Ensure not already taken

    if (error) {
        console.error('Error accepting booking:', error)
        return { error: 'Failed to accept booking' }
    }

    revalidatePath('/provider/dashboard')
    return { success: true }
}

export async function completeBooking(bookingId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
        // Ensure provider owns this booking
        .eq('provider_id', (await supabase.auth.getUser()).data.user?.id)

    if (error) {
        console.error('Error completing booking:', error)
        return { error: 'Failed to complete booking' }
    }

    revalidatePath('/provider/dashboard')
    return { success: true }
}
