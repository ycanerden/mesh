"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Globe, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

export default function BookingPage() {
    const params = useParams()
    const username = params.username as string
    const slug = params.slug as string

    const { data: session } = useSession()

    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [step, setStep] = React.useState<'date' | 'details' | 'confirm'>('date')
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null)

    // Mock data
    const duration = slug.replace(/[^0-9]/g, '') || '30'
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00",
        "13:00", "13:30", "14:00", "15:30", "16:00"
    ]

    const handleSchedule = async () => {
        if (!session) {
            signIn("google")
            return
        }

        if (!date || !selectedTime) return

        // Parse time
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const startDate = new Date(date)
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate)
        endDate.setMinutes(endDate.getMinutes() + parseInt(duration))

        try {
            const res = await fetch('/api/calendar/create-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: `${slug.replace('-', ' ')} with ${username}`,
                    description: `Meeting with ${username}`,
                    startTime: startDate.toISOString(),
                    endTime: endDate.toISOString(),
                    attendees: ["canerden@example.com"] // Hardcoded host email for MVP
                })
            })

            if (res.ok) {
                setStep('confirm')
            } else {
                alert("Failed to schedule. Please check console.")
            }
        } catch (e) {
            console.error(e)
            alert("Error scheduling meeting")
        }
    }

    const formatSelectedDate = (d: Date) => {
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        })
    }

    if (step === 'confirm') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Meeting Scheduled!</h2>
                    <p className="text-muted-foreground mb-6">
                        You are scheduled with {username} for {duration} mins.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg mb-6 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{date ? formatSelectedDate(date) : ''}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium">{selectedTime}</span>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => window.location.href = '/'}>
                        Done
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl shadow-2xl overflow-hidden border-border/50">
                <div className="flex flex-col md:flex-row h-full min-h-[600px]">

                    {/* Sidebar - Host Info */}
                    <div className="w-full md:w-1/3 bg-muted/10 p-8 border-r">
                        {step === 'details' && (
                            <Button variant="ghost" size="icon" className="mb-4 -ml-2" onClick={() => setStep('date')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}

                        <Avatar className="h-16 w-16 mb-4">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 mb-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {username}
                            </p>
                            <h1 className="text-2xl font-bold capitalize">
                                {slug.replace('-', ' ')} Meeting
                            </h1>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center text-muted-foreground">
                                <Clock className="mr-3 h-4 w-4" />
                                <span>{duration} min</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                                <Globe className="mr-3 h-4 w-4" />
                                <span>Google Meet</span>
                            </div>
                        </div>

                        <div className="mt-8 text-sm text-muted-foreground">
                            <p>Let's discuss our roadmap and strategy. Please prepare any agenda items beforehand.</p>
                        </div>
                    </div>

                    {/* Main Booking Area */}
                    <div className="flex-1 p-8 bg-background">

                        {step === 'date' && (
                            <div className="h-full flex flex-col">
                                <h2 className="text-lg font-semibold mb-6">Select a Date & Time</h2>

                                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                                    {/* Calendar Widget */}
                                    <div className="flex-1 flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md border p-4 w-full max-w-[300px]"
                                            disabled={(date) => date < new Date()}
                                        />
                                    </div>

                                    {/* Time Slots */}
                                    <div className="w-full lg:w-48 space-y-3">
                                        <div className="text-sm font-medium mb-4 text-center">
                                            {date ? formatSelectedDate(date) : 'Select date'}
                                        </div>
                                        <div className="h-[360px] overflow-y-auto pr-2 space-y-2">
                                            {timeSlots.map((time) => (
                                                <Button
                                                    key={time}
                                                    variant="outline"
                                                    className="w-full justify-center border-primary/20 hover:border-primary hover:bg-primary/5"
                                                    onClick={() => {
                                                        setSelectedTime(time)
                                                        setStep('details')
                                                    }}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'details' && (
                            <div className="max-w-md mx-auto h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-xl font-semibold mb-6">Enter Details</h2>

                                {!session ? (
                                    <div className="text-center space-y-4">
                                        <p className="text-muted-foreground">Please sign in to schedule this meeting.</p>
                                        <Button className="w-full" size="lg" onClick={() => signIn("google")}>
                                            Sign in with Google
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Name</label>
                                            <input
                                                className="w-full p-2 rounded-md border bg-background"
                                                defaultValue={session.user?.name || ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <input
                                                className="w-full p-2 rounded-md border bg-background"
                                                defaultValue={session.user?.email || ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Notes</label>
                                            <textarea className="w-full p-2 rounded-md border bg-background h-24" placeholder="Anything specific?" />
                                        </div>

                                        <Button className="w-full mt-4" size="lg" onClick={handleSchedule}>
                                            Schedule Event
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </Card>
        </div>
    )
}
