"use client"

import { MeetingRecorder } from "@/components/meeting-recorder"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CalendarConnect } from "@/components/calendar-connect"
import {
  Calendar,
  Clock,
  Mic,
  MoreVertical,
  Plus,
  Settings,
  Users
} from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [showRecorder, setShowRecorder] = React.useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>📝</span> Meeting Notes
          </h1>
        </div>

        <div className="px-4 mb-4">
          <Button className="w-full justify-start gap-2" size="lg">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                Upcoming
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-normal text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Product Strategy
                  <span className="ml-auto text-xs text-muted-foreground">10:00</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Team Sync
                  <span className="ml-auto text-xs text-muted-foreground">14:00</span>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                Recent Notes
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-normal truncate">
                  <span className="truncate">Q1 Roadmap Review</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal truncate">
                  <span className="truncate">Design Huddle</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal truncate">
                  <span className="truncate">Client Kickoff</span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <div className="mb-4 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent opacity-80">
              Built by Gemini ✦
            </span>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-muted/10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/calendar')}>
              <Calendar className="h-4 w-4" />
              View Calendar
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Good Morning, Can Erden</h2>
              <p className="text-muted-foreground">You have 2 meetings scheduled for today.</p>
            </div>
            <CalendarConnect />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Next Meeting Card */}
            <Card className="col-span-2 border-l-4 border-l-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="font-mono text-indigo-400">UPCOMING • 10:00 AM</CardDescription>
                    <CardTitle className="text-2xl mt-1">Product Strategy Sync</CardTitle>
                  </div>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 45m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> 4 Attendees
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={() => setShowRecorder(true)}>
                  <Mic className="h-4 w-4" />
                  Start Recording & Note Taking
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions / Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Meetings this week</div>
                </div>
                <Separator />
                <div>
                  <div className="text-2xl font-bold">4.5h</div>
                  <div className="text-xs text-muted-foreground">Time saved by AI</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Your Booking Link</h3>
            <Card className="flex items-center justify-between p-4 bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Public Booking Page</div>
                  <div className="text-sm text-muted-foreground">app.meetingnotes.ai/caner/30min</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Copy Link</Button>
                <Button variant="outline" size="sm">Edit Slots</Button>
              </div>
            </Card>
          </div>

        </div>

        {showRecorder && (
          <MeetingRecorder onClose={() => setShowRecorder(false)} />
        )}
      </main>
    </div>
  )
}
