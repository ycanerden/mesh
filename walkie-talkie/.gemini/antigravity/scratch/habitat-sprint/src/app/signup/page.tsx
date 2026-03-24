'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTeamAuth } from '@/contexts/TeamAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Users, Plus, X } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const { signup, isLoading, error } = useTeamAuth()

    const [teamName, setTeamName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [memberNames, setMemberNames] = useState<string[]>([''])
    const [validationError, setValidationError] = useState('')

    const addMember = () => {
        setMemberNames([...memberNames, ''])
    }

    const removeMember = (index: number) => {
        setMemberNames(memberNames.filter((_, i) => i !== index))
    }

    const updateMember = (index: number, value: string) => {
        const updated = [...memberNames]
        updated[index] = value
        setMemberNames(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        if (!teamName.trim()) {
            setValidationError('Team name is required')
            return
        }

        if (password.length < 4) {
            setValidationError('Password must be at least 4 characters')
            return
        }

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match')
            return
        }

        const success = await signup(teamName.trim(), password, memberNames)
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
                        <CardTitle className="text-2xl font-bold">Create Your Team</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Join the sprint and build your startup in one evening
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {(error || validationError) && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error || validationError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="teamName" className="text-sm font-medium">
                                Team Name
                            </Label>
                            <Input
                                id="teamName"
                                type="text"
                                placeholder="e.g., The Founders"
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
                                placeholder="Create a simple password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Team Members (optional)
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={addMember}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                            {memberNames.map((name, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder={`Member ${index + 1} name`}
                                        value={name}
                                        onChange={(e) => updateMember(index, e.target.value)}
                                        className="h-10"
                                    />
                                    {memberNames.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMember(index)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Team...' : 'Start Sprint →'}
                        </Button>
                        <p className="text-sm text-slate-500 text-center">
                            Already have a team?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
