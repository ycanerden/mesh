import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const aai = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { transcriptId } = body;

        if (!transcriptId) {
            return NextResponse.json({ error: 'No transcriptId provided' }, { status: 400 });
        }

        const lemurResponse = await aai.lemur.task({
            transcript_ids: [transcriptId],
            prompt: `You are an executive assistant formatting meeting notes.
Analyze the transcript and provide a highly structured, well-formatted markdown response with these sections:
1. **Summary**: A concise paragraph summarizing the meeting's core outcomes.
2. **Action Items**: A bulleted list of specific tasks, assigning a person if mentioned.
3. **Key Decisions**: Any direct decisions or conclusions reached.

Use professional, precise language.
      `,
            final_model: 'anthropic/claude-3-5-sonnet'
        });

        return NextResponse.json({
            response: lemurResponse.response
        });

    } catch (error: any) {
        console.error('LeMUR error:', error);
        return NextResponse.json({ error: error.message || 'Error generating notes' }, { status: 500 });
    }
}
