import { Search, Zap, Droplets, Sparkles, Car, Hammer, Paintbrush } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const services = [
    { id: 'electrician', title: 'Electrician', icon: Zap, desc: 'Wiring, repairs, and installations.' },
    { id: 'plumbing', title: 'Plumbing', icon: Droplets, desc: 'Leakages, fittings, and more.' },
    { id: 'cleaning', title: 'Home Cleaning', icon: Sparkles, desc: 'Deep cleaning for every room.' },
    { id: 'car-wash', title: 'Car Wash', icon: Car, desc: 'Doorstep car cleaning service.' },
    { id: 'repairs', title: 'Appliance Repair', icon: Hammer, desc: 'AC, Fridge, Washing Machine fixes.' },
    { id: 'painting', title: 'Painting', icon: Paintbrush, desc: 'Wall painting and waterproofing.' },
]

export default function ServicesPage() {
    return (
        <div className="container px-4 md:px-8 max-w-screen-2xl py-12">
            <div className="flex flex-col items-center mb-12 space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">All Services</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Browse our complete list of services available in Guwahati.
                </p>
                <div className="relative w-full max-w-md mt-4">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for a service..." className="pl-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Link key={service.id} href={`/services/${service.id}`} className="group p-6 bg-card rounded-xl border hover:shadow-lg transition-all flex gap-4 items-start">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <service.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{service.desc}</p>
                            <span className="text-sm font-medium text-primary group-hover:underline">Book Now &rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
