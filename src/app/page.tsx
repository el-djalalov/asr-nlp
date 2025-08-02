"use client";
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MicButton from "@/components/MicButton";
import TranscriptList from "@/components/TranscriptList";

type TranscriptItem = {
	id: string;
	text: string;
	timestamp: number;
	nlpData?: any;
};

export default function Home() {
	const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

	const handleNewTranscript = useCallback((item: TranscriptItem) => {
		setTranscripts(prev => [item, ...prev]);
	}, []);

	const handleDeleteTranscript = useCallback((id: string) => {
		setTranscripts(prev => prev.filter(item => item.id !== id));
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<header className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Speech Recognition Demo
					</h1>
					<p className="text-xl text-gray-600 mb-6">
						Speak into your microphone to see speech-to-text and NLP in action
					</p>
					<div className="flex justify-center gap-2">
						<Badge variant="secondary">Web Speech API</Badge>
						<Badge variant="secondary">Natural Language Processing</Badge>
						<Badge variant="secondary">Real-time Analysis</Badge>
					</div>
				</header>

				{/* Speech Input Section */}
				<section className="mb-12">
					<MicButton onNewTranscriptItem={handleNewTranscript} />
				</section>

				{/* Transcripts Section */}
				<section className="mb-8">
					<TranscriptList
						items={transcripts}
						onDelete={handleDeleteTranscript}
					/>
				</section>

				{/* Footer */}
				<footer className="mt-8">
					<Card>
						<CardContent className="pt-2">
							<div className="text-center text-gray-600">
								<p className="text-sm">
									Built with Next.js, shadcn/ui, Tailwind CSS, Web Speech API,
									and Compromise/Natural NLP
								</p>
								<p className="text-xs mt-2 text-gray-500">
									Note: Speech recognition works best in Chrome, Edge, and other
									Chromium-based browsers.
								</p>
							</div>
						</CardContent>
					</Card>
				</footer>
			</div>
		</div>
	);
}
