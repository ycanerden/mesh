import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { summary, description, startTime, endTime, attendees } = body

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: "v3", auth })

    try {
        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
                summary,
                description,
                start: { dateTime: startTime },
                end: { dateTime: endTime },
                attendees: attendees.map((email: string) => ({ email })),
                conferenceData: {
                    createRequest: { requestId: Math.random().toString(36).substring(7) }
                }
            },
            conferenceDataVersion: 1
        })

        return NextResponse.json(response.data)
    } catch (error: any) {
        console.error("Calendar Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
