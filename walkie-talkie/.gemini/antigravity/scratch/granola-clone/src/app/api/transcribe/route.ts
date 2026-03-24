import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const aai = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Convert Blob to buffer for upload
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload audio buffer to AAI
        const uploadUrl = await aai.files.upload(buffer);

        // Start transcription
        const transcript = await aai.transcripts.transcribe({
            audio_url: uploadUrl,
            speaker_labels: true,
            punctuate: true,
            format_text: true,
        });

        if (transcript.status === 'error') {
            return NextResponse.json({ error: transcript.error }, { status: 500 });
        }

        return NextResponse.json({
            transcriptId: transcript.id,
            text: transcript.text,
            utterances: transcript.utterances
        });

    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: error.message || 'Error processing audio' }, { status: 500 });
    }
}
