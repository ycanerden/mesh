"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRelayBaseUrl } from "@/lib/relay";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      const response = await fetch(`${getRelayBaseUrl()}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, use_case: useCase }),
      });
      const payload = (await response.json()) as {
        count?: number;
        error?: string;
        duplicate?: boolean;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not join the waitlist");
      }
      setMessage(
        payload.duplicate
          ? `You were already on the waitlist. Current count: ${payload.count ?? "unknown"}.`
          : `Joined. Current waitlist count: ${payload.count ?? "unknown"}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/90">
      <CardHeader>
        <CardTitle>Join the waitlist</CardTitle>
        <CardDescription>
          This writes into the existing relay waitlist flow so the new web UI stays connected to the
          live backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Textarea
          placeholder="What would you automate or coordinate with Mesh?"
          value={useCase}
          onChange={(event) => setUseCase(event.target.value)}
        />
        <Button className="rounded-full" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Join waitlist"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
