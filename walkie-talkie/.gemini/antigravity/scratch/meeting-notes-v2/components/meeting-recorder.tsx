"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Square, Loader2, Sparkles, X } from "lucide-react"

interface MeetingRecorderProps {
    onClose: () => void
}

export function MeetingRecorder({ onClose }: MeetingRecorderProps) {
    const [isRecording, setIsRecording] = React.useState(false)
    const [duration, setDuration] = React.useState(0)
    const [transcript, setTranscript] = React.useState<string[]>([])
    const [isProcessing, setIsProcessing] = React.useState(false)

    // Ref for timer
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            setIsRecording(true)

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1)
            }, 1000)

            // TODO: Initialize MediaRecorder and Real-time logic here
            // For MVP, just simulating "recording" state

        } catch (err) {
            console.error("Microphone access denied", err)
            alert("Please allow microphone access")
        }
    }

    const stopRecording = () => {
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)

        // Simulate processing
        setIsProcessing(true)
        setTimeout(() => {
            setTranscript([
                "Speaker 1: Let's discuss the Q1 roadmap.",
                "Speaker 2: Agreed, we need to focus on the core features first.",
                "Speaker 1: I think the AI integration is key here."
            ])
            setIsProcessing(false)
        }, 2000)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border-indigo-500/20">

                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                        <div>
                            <h2 className="font-semibold text-lg">Product Strategy Sync</h2>
                            <p className="text-xs text-muted-foreground font-mono">{formatTime(duration)}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Transcript Area */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                            {transcript.length === 0 && !isProcessing && (
                                <div className="text-center text-muted-foreground mt-20">
                                    <Mic className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Ready to record...</p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex items-center justify-center gap-2 text-indigo-400 mt-20">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Transcribing audio...</span>
                                </div>
                            )}

                            {transcript.map((line, i) => (
                                <div key={i} className="p-3 rounded-lg bg-muted/30 text-sm">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t bg-muted/20">
                    <div className="flex justify-center gap-4">
                        {!isRecording ? (
                            <Button
                                size="lg"
                                className="w-full max-w-sm bg-red-500 hover:bg-red-600 text-white rounded-full h-14"
                                onClick={startRecording}
                            >
                                <Mic className="h-5 w-5 mr-2" />
                                Start Recording
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full max-w-sm border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-full h-14"
                                onClick={stopRecording}
                            >
                                <Square className="h-5 w-5 mr-2 fill-current" />
                                Stop Recording
                            </Button>
                        )}

                        {transcript.length > 0 && (
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-14">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Generate Summary
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
