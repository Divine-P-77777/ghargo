import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

// Mock data types
const serviceDetails: Record<string, { title: string, price: string }> = {
    electrician: { title: 'Electrician', price: '₹200 visit charge' },
    plumbing: { title: 'Plumbing', price: '₹200 visit charge' },
    cleaning: { title: 'Home Cleaning', price: 'Starts at ₹499' },
    'car-wash': { title: 'Car Wash', price: 'Starts at ₹399' },
    repairs: { title: 'Appliance Repair', price: '₹250 visit charge' },
    painting: { title: 'Painting', price: 'On Inspection' },
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const service = serviceDetails[slug] || { title: 'Service', price: 'Contact for price' }

    return (
        <div className="container px-4 md:px-8 max-w-screen-lg py-12">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold text-primary mb-4">{service.title}</h1>
                    <p className="text-xl text-muted-foreground mb-6">Professional {service.title.toLowerCase()} services at your doorstep.</p>

                    <div className="bg-muted/50 p-6 rounded-lg mb-8">
                        <h3 className="font-semibold mb-2">Pricing</h3>
                        <p className="text-lg">{service.price}</p>
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
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Date</label>
                            <div className="relative">
                                <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                <Calendar className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Time Slot</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>09:00 AM - 11:00 AM</option>
                                <option>11:00 AM - 01:00 PM</option>
                                <option>02:00 PM - 04:00 PM</option>
                                <option>04:00 PM - 06:00 PM</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Problem Description (Optional)</label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Describe the issue..."></textarea>
                        </div>

                        <Button className="w-full text-lg h-12">Confirm Booking</Button>
                        <p className="text-xs text-center text-muted-foreground">No payment required now. Pay after service.</p>
                    </form>
                </div>
            </div>
        </div>
    )
}
