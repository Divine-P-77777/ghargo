'use client'

import { useState } from 'react'
import { Booking } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { acceptBooking, completeBooking } from '@/app/[lang]/provider/actions'
import { Loader2, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react'

type DashboardProps = {
    pendingBookings: Booking[]
    myBookings: Booking[]
}

export function ProviderDashboard({ pendingBookings, myBookings }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'available' | 'schedule'>('available')
    const [loading, setLoading] = useState<string | null>(null)

    const handleAccept = async (id: string) => {
        setLoading(id)
        await acceptBooking(id)
        setLoading(null)
    }

    const handleComplete = async (id: string) => {
        setLoading(id)
        await completeBooking(id)
        setLoading(null)
    }

    const BookingList = ({ bookings, type }: { bookings: Booking[], type: 'available' | 'schedule' }) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    No bookings found.
                </div>
            )}
            {bookings.map((booking) => (
                <Card key={booking.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-start">
                            <span>Service Request</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {booking.status}
                            </span>
                        </CardTitle>
                        <CardDescription>ID: {booking.id.slice(0, 8)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.time_slot}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span>{booking.address}</span>
                        </div>
                        {booking.notes && (
                            <div className="mt-2 p-2 bg-muted rounded-md text-xs italic">
                                "{booking.notes}"
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {type === 'available' ? (
                            <Button
                                onClick={() => handleAccept(booking.id)}
                                disabled={loading === booking.id}
                                className="w-full"
                            >
                                {loading === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Accept Job
                            </Button>
                        ) : (
                            booking.status !== 'completed' && (
                                <Button
                                    onClick={() => handleComplete(booking.id)}
                                    disabled={loading === booking.id}
                                    variant="outline"
                                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                                >
                                    {loading === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Mark as Completed
                                </Button>
                            )
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex space-x-1 rounded-xl bg-muted p-1">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none focus:ring-2
                        ${activeTab === 'available' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-white/[0.12] hover:text-white'}`}
                >
                    Available Jobs ({pendingBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none focus:ring-2
                        ${activeTab === 'schedule' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-white/[0.12] hover:text-white'}`}
                >
                    My Schedule ({myBookings.length})
                </button>
            </div>

            {activeTab === 'available' ? (
                <BookingList bookings={pendingBookings} type="available" />
            ) : (
                <BookingList bookings={myBookings} type="schedule" />
            )}
        </div>
    )
}
