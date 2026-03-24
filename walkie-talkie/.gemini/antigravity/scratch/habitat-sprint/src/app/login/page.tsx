'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTeamAuth } from '@/contexts/TeamAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading, error } = useTeamAuth()

    const [teamName, setTeamName] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!teamName.trim() || !password) {
            return
        }

        const success = await login(teamName.trim(), password)
        if (success) {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Log in to continue your sprint
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="teamName" className="text-sm font-medium">
                                Team Name
                            </Label>
                            <Input
                                id="teamName"
                                type="text"
                                placeholder="Enter your team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Team Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your team password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Continue Sprint →'}
                        </Button>
                        <p className="text-sm text-slate-500 text-center">
                            Don&apos;t have a team?{' '}
                            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
