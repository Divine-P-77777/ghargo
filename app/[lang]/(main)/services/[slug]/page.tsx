import { createClient } from "@/lib/supabase/server"
import { BookingForm } from "./BookingForm"

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
                    <BookingForm serviceId={displayService.id} />
                </div>
            </div>
        </div>
    )
}
