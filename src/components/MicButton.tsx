"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2 } from "lucide-react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

type TranscriptItem = {
	id: string;
	text: string;
	timestamp: number;
	nlpData?: any;
};

type MicButtonProps = {
	onTranscript?: (transcript: string) => void;
	onNewTranscriptItem?: (item: TranscriptItem) => void;
};

export default function MicButton({
	onTranscript,
	onNewTranscriptItem,
}: MicButtonProps) {
	const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
	const [processingNlp, setProcessingNlp] = useState(false);

	const {
		listening,
		transcript,
		finalTranscript,
		isInterimResult,
		confidence,
		error,
		supported,
		start,
		stop,
		reset,
	} = useSpeechRecognition({
		continuous: false,
		interimResults: true,
	});

	useEffect(() => {
		// Check microphone permissions
		if (navigator.permissions) {
			navigator.permissions
				.query({ name: "microphone" as PermissionName })
				.then(result => {
					console.log("Microphone permission:", result.state);
					if (result.state === "denied") {
						console.error("Microphone access denied");
					}
				})
				.catch(err => {
					console.error("Permission check error:", err);
				});
		}
	}, []);

	// Process NLP when we get a final transcript
	useEffect(() => {
		if (!finalTranscript || finalTranscript === "") return;

		if (onTranscript) {
			onTranscript(finalTranscript);
		}

		const newItem: TranscriptItem = {
			id: Date.now().toString(),
			text: finalTranscript,
			timestamp: Date.now(),
		};

		setTranscripts(prev => [newItem, ...prev]);
		processNlp(finalTranscript, newItem.id);
		reset();
	}, [finalTranscript, onTranscript, reset]);

	const processNlp = async (text: string, id: string) => {
		if (!text) return;

		setProcessingNlp(true);

		try {
			const response = await fetch("/api/nlp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text }),
			});

			if (!response.ok) {
				throw new Error("NLP processing failed");
			}

			const nlpData = await response.json();

			setTranscripts(prev =>
				prev.map(item => (item.id === id ? { ...item, nlpData } : item))
			);

			if (onNewTranscriptItem) {
				onNewTranscriptItem({
					id,
					text,
					timestamp: Date.now(),
					nlpData,
				});
			}
		} catch (err) {
			console.error("Error processing NLP:", err);
		} finally {
			setProcessingNlp(false);
		}
	};

	const handleToggleMic = useCallback(() => {
		if (listening) {
			stop();
		} else {
			reset();
			start();
		}
	}, [listening, stop, reset, start]);

	if (!supported) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardContent className="pt-6">
					<div className="text-center text-red-600">
						<p className="text-lg font-medium">
							Speech Recognition Not Supported
						</p>
						<p className="mt-2 text-sm text-gray-600">
							Please try Chrome, Edge, or another Chromium-based browser.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="w-full max-w-2xl mx-auto space-y-6">
			{/* Microphone Button */}
			<div className="flex flex-col items-center space-y-4">
				<Button
					onClick={handleToggleMic}
					disabled={!!error}
					size="lg"
					className={cn(
						"w-16 h-16 rounded-full transition-all duration-200",
						listening
							? "bg-red-500 hover:bg-red-600 scale-110"
							: "bg-blue-500 hover:bg-blue-600 hover:scale-105"
					)}
				>
					{listening ? (
						<MicOff className="w-6 h-6" />
					) : (
						<Mic className="w-6 h-6" />
					)}
				</Button>

				<div className="text-center">
					{listening && (
						<Badge variant="destructive" className="animate-pulse">
							Listening...
						</Badge>
					)}

					{error && <Badge variant="destructive">Error: {error}</Badge>}

					{processingNlp && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<Loader2 className="w-3 h-3 animate-spin" />
							Processing...
						</Badge>
					)}
				</div>
			</div>

			{/* Live Transcript Display */}
			{transcript && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-sm text-gray-500 mb-2">
								{isInterimResult ? "Listening..." : "Final result"}
							</p>
							<p
								className={cn(
									"text-lg",
									isInterimResult
										? "text-gray-600 italic"
										: "text-gray-900 font-medium"
								)}
							>
								{transcript}
								{isInterimResult && "..."}
							</p>
							{confidence > 0 && (
								<p className="text-xs text-gray-400 mt-2">
									Confidence: {Math.round(confidence * 100)}%
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
