'use client'

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Save, Loader2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Profile } from "@/hooks/useProfile"

interface ProfileDetailsProps {
    profile: Profile
    isEditing: boolean
    onSave: (data: Partial<Profile>) => Promise<void>
}

export function ProfileDetails({ profile, isEditing, onSave }: ProfileDetailsProps) {
    const [formData, setFormData] = useState({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setFormData({
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            address: profile.address || '',
        })
    }, [profile])

    async function handleSubmit() {
        setSaving(true)
        await onSave(formData)
        setSaving(false)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                Profile Details
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
                    {isEditing ? (
                        <div className="relative group">
                            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500"
                            />
                        </div>
                    ) : (
                        <p className="text-slate-700 font-medium text-lg">{profile.full_name || '—'}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-700 font-medium">{profile.email}</p>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone</label>
                    {isEditing ? (
                        <div className="relative group">
                            <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {profile.phone ? <Phone className="h-4 w-4 text-slate-400" /> : null}
                            <p className="text-slate-700 font-medium">{profile.phone || 'Not added'}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Address</label>
                    {isEditing ? (
                        <div className="relative group">
                            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Your full address"
                                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {profile.address ? <MapPin className="h-4 w-4 text-slate-400" /> : null}
                            <p className="text-slate-700 font-medium">{profile.address || 'Not added'}</p>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-indigo-500/20"
                        >
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
