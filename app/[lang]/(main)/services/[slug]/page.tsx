import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createBooking } from "@/app/[lang]/services/actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { notFound } from "next/navigation"

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch Service
    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!service) {
        // Fallback for demo if DB is empty but we want to show UI
        // In real app, render notFound()
        if (['cleaning', 'plumbing', 'electrician', 'car-wash'].includes(slug)) {
            // Let UI render with mock data embedded if needed or just redirect
            // For now, let's just 404 if not found in DB to encourage running SQL
        }
        // notFound()
    }

    const displayService = service || {
        id: 'mock-id',
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        price_text: 'Contact for price',
        description: 'Service description...'
    }

    return (
        <div className="container px-4 md:px-8 max-w-screen-lg py-12">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold text-primary mb-4">{displayService.title}</h1>
                    <p className="text-xl text-muted-foreground mb-6">{displayService.description || `Professional ${displayService.title} services at your doorstep.`}</p>

                    <div className="bg-muted/50 p-6 rounded-lg mb-8">
                        <h3 className="font-semibold mb-2">Pricing</h3>
                        <p className="text-lg">{displayService.price_text}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            * Final price depends on the scope of work.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">What's Included?</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Verified Professional</li>
                            <li>Post-service cleanup</li>
                            <li>7-day warranty on service</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-card border rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Book Service</h2>
                    <form action={createBooking} className="space-y-4">
                        <input type="hidden" name="serviceId" value={displayService.id} />

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
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Textarea
                                name="address"
                                placeholder="Your full address"
                                required
                                className="min-h-[60px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Problem Description (Optional)</label>
                            <Textarea
                                name="notes"
                                placeholder="Describe the issue..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <Button type="submit" className="w-full text-lg h-12">Confirm Booking</Button>
                        <p className="text-xs text-center text-muted-foreground">No payment required now. Pay after service.</p>
                    </form>
                </div>
            </div>
        </div>
    )
}
