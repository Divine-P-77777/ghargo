'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const bookingSchema = z.object({
    serviceId: z.string().uuid(),
    date: z.string().date(),
    timeSlot: z.string().min(1, "Time slot is required"),
    address: z.string().min(5, "Address is required"),
    notes: z.string().optional(),
})

export async function createBooking(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/auth/login')
    }

    // 2. Validate Data
    const rawData = {
        serviceId: formData.get('serviceId'),
        date: formData.get('date'),
        timeSlot: formData.get('timeSlot'),
        address: formData.get('address'),
        notes: formData.get('notes'),
    }

    const validatedFields = bookingSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
            issues: validatedFields.error.flatten().fieldErrors
        }
    }

    const { serviceId, date, timeSlot, address, notes } = validatedFields.data

    // 3. Insert into Database
    const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: serviceId,
        booking_date: date,
        time_slot: timeSlot,
        address,
        notes,
        status: 'pending'
    })

    if (error) {
        console.error('Booking Error:', error)
        return { error: 'Failed to create booking. Please try again.' }
    }

    // 4. Revalidate & Redirect
    revalidatePath('/dashboard')
    redirect('/dashboard?booking=success')
}
