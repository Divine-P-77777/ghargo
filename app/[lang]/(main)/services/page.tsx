import { Search, Zap, Droplets, Sparkles, Car, Hammer, Paintbrush } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/database"
import { getDictionary } from "@/get-dictionary"
import { i18n } from "@/i18n-config"

// Mock data as fallback
const mockServices = [
    { id: '1', title: 'Home Cleaning', slug: 'cleaning', description: 'Deep cleaning for every corner.', price_text: 'Starts @ ₹499' },
    { id: '2', title: 'Plumbing', slug: 'plumbing', description: 'Leak fix, installation & more.', price_text: 'Visit @ ₹199' },
    { id: '3', title: 'Electrician', slug: 'electrician', description: 'Wiring, repairs & safety check.', price_text: 'Visit @ ₹199' },
    { id: '4', title: 'Car Wash', slug: 'car-wash', description: 'Doorstep foam wash & polish.', price_text: 'Starts @ ₹399' },
]

export default async function ServicesPage({ params }: { params: Promise<{ lang: any }> }) {
    const { lang } = await params
    const dict = await getDictionary(lang)
    const supabase = await createClient()

    // Fetch Services
    const { data: services, error } = await supabase
        .from('services')
        .select('*')

    const displayServices = (services && services.length > 0) ? services : mockServices

    return (
        <div className="container py-12 px-4 md:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-primary">Our Services</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Choose from our wide range of professional services.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>{service.title}</CardTitle>
                            <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-primary">{service.price_text}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/${lang}/services/${service.slug}`}>
                                    Book Now
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
