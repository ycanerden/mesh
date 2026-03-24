"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, LogOut, CheckCircle } from "lucide-react"

export function CalendarConnect() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <Button disabled variant="outline">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        )
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-500/10 px-3 py-2 rounded-md border border-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Calendar Connected as {session.user?.email}</span>
                </div>
                {/* TEMP: Show Refresh Token for Setup */}
                {/* @ts-ignore */}
                {(session as any).refreshToken && (
                    <div className="text-[10px] font-mono bg-black text-white p-2 max-w-[200px] overflow-auto select-all">
                        {(session as any).refreshToken}
                    </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => signIn("google")}
        >
            <Sparkles className="mr-2 h-4 w-4" />
            Connect Google Calendar
        </Button>
    )
}
