'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address: ''
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                // Check if profile is incomplete
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    // If critical info is missing, show modal
                    if (!profile.full_name || !profile.phone_number) {
                        setFormData({
                            full_name: profile.full_name || '',
                            phone_number: profile.phone_number || '',
                            address: profile.address || ''
                        })
                        setIsOpen(true)
                    }
                }
            }
        }
        checkUser()
    }, [supabase])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async () => {
        if (!user) return
        setLoading(true)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                address: formData.address,
                updated_at: new Date().toISOString() // Ensure updated_at is set
            })
            .eq('id', user.id)

        setLoading(false)

        if (error) {
            toast.error("Failed to update profile")
        } else {
            toast.success("Profile updated successfully!")
            setIsOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to GharGo!</DialogTitle>
                    <DialogDescription>
                        Please take a moment to complete your profile for a better experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="phone_number" className="text-sm font-medium">Phone Number</label>
                        <Input
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="address" className="text-sm font-medium">Address (Optional)</label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Your Area, City"
                        />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:justify-between gap-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading}>
                        Fill Later
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? "Saving..." : "Save & Continue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
