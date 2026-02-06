'use client'

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createBooking } from "@/app/[lang]/services/actions"
import { Calendar, Loader2 } from "lucide-react"

const initialState = {
    error: '',
    issues: {} as Record<string, string[]>
}

export function BookingForm({ serviceId }: { serviceId: string }) {
    const [state, formAction, isPending] = useActionState(createBooking, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="serviceId" value={serviceId} />

            <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <div className="relative">
                    <Input
                        type="date"
                        name="date"
                        required
                        className="w-full"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
                {state?.issues?.date && (
                    <p className="text-red-500 text-sm">{state.issues.date[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Select Time Slot</label>
                <select
                    name="timeSlot"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Select a slot</option>
                    <option value="09-11">09:00 AM - 11:00 AM</option>
                    <option value="11-01">11:00 AM - 01:00 PM</option>
                    <option value="14-16">02:00 PM - 04:00 PM</option>
                    <option value="16-18">04:00 PM - 06:00 PM</option>
                </select>
                {state?.issues?.timeSlot && (
                    <p className="text-red-500 text-sm">{state.issues.timeSlot[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Textarea
                    name="address"
                    placeholder="Your full address"
                    required
                    className="min-h-[60px]"
                />
                {state?.issues?.address && (
                    <p className="text-red-500 text-sm">{state.issues.address[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Problem Description (Optional)</label>
                <Textarea
                    name="notes"
                    placeholder="Describe the issue..."
                    className="min-h-[80px]"
                />
            </div>

            {state?.error && (
                <p className="text-red-500 text-sm text-center">{state.error}</p>
            )}

            <Button type="submit" className="w-full text-lg h-12" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                    </>
                ) : (
                    'Confirm Booking'
                )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">No payment required now. Pay after service.</p>
        </form>
    )
}
