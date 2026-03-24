"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Plus, Clock, MapPin, Video, Users, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
    const router = useRouter()
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    // Mock events for the calendar view
    const events = [
        {
            id: 1,
            title: "Product Strategy Sync",
            time: "10:00 AM - 11:00 AM",
            type: "video",
            attendees: 4,
            date: new Date()
        },
        {
            id: 2,
            title: "Design Huddle",
            time: "02:00 PM - 03:00 PM",
            type: "in-person",
            location: "Room 404",
            attendees: 3,
            date: new Date()
        },
        {
            id: 3,
            title: "Client Kickoff",
            time: "04:30 PM - 05:00 PM",
            type: "video",
            attendees: 8,
            date: new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow
        }
    ]

    const selectedDateEvents = events.filter(e =>
        date && e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    )

    return (
        <div className="flex h-screen bg-background">
            <aside className="w-80 border-r bg-muted/10 flex flex-col p-6">
                <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push('/')}>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Back to Dashboard</span>
                </div>

                <div className="mb-6">
                    <Button className="w-full gap-2" size="lg">
                        <Plus className="h-4 w-4" />
                        New Event
                    </Button>
                </div>

                <div className="flex-1">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border bg-card shadow-sm"
                    />
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center justify-between px-8">
                    <h1 className="text-2xl font-bold">
                        {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">Day</Button>
                        <Button variant="outline">Week</Button>
                        <Button variant="outline">Month</Button>
                    </div>
                </header>

                <ScrollArea className="flex-1 p-8">
                    <div className="space-y-6 max-w-4xl">
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map(event => (
                                <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="flex flex-col items-center justify-center h-16 w-16 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold border border-indigo-200">
                                            <span className="text-lg">{event.time.split(' ')[0]}</span>
                                            <span className="text-xs uppercase">{event.time.split(' ')[1]}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold">{event.title}</h3>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{event.time}</span>
                                                </div>
                                                {event.type === 'video' ? (
                                                    <div className="flex items-center gap-1">
                                                        <Video className="h-4 w-4" />
                                                        <span>Google Meet</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{event.attendees} attendees</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button size="sm" variant="outline" className="h-8">Join Meeting</Button>
                                                <Button size="sm" variant="outline" className="h-8">Reschedule</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
                                <Clock className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No events scheduled</p>
                                <p className="text-sm">Enjoy your free time!</p>
                                <Button variant="link" className="mt-2 text-indigo-500">Schedule something</Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}
