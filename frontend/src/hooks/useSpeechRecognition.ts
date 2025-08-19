import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechOptions = {
	lang?: string;
	continuous?: boolean;
	interimResults?: boolean;
	maxAlternatives?: number;
};

export type UseSpeechReturn = {
	listening: boolean;
	transcript: string;
	finalTranscript: string;
	isInterimResult: boolean;
	confidence: number;
	error: string | null;
	supported: boolean;
	start: () => void;
	stop: () => void;
	reset: () => void;
};

export default function useSpeechRecognition({
	lang = "en-US",
	continuous = false,
	interimResults = true,
	maxAlternatives = 1,
}: SpeechOptions = {}): UseSpeechReturn {
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const [listening, setListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [finalTranscript, setFinalTranscript] = useState("");
	const [isInterimResult, setIsInterimResult] = useState(false);
	const [confidence, setConfidence] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [supported, setSupported] = useState(true);

	// Initialize speech recognition on client-side only
	useEffect(() => {
		// Skip during SSR
		if (typeof window === "undefined") return;

		// Get the appropriate SpeechRecognition constructor
		const SpeechRecognitionConstructor =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognitionConstructor) {
			setSupported(false);
			setError("Speech Recognition API not supported in this browser");
			return;
		}

		const recognition = new SpeechRecognitionConstructor();

		// Configure the recognition
		recognition.lang = lang;
		recognition.continuous = continuous;
		recognition.interimResults = interimResults;
		recognition.maxAlternatives = maxAlternatives;

		// Handle events
		recognition.onstart = () => {
			console.log("Speech recognition started");
			setListening(true);
			setError(null);
		};

		recognition.onend = () => {
			console.log("Speech recognition ended");
			setListening(false);
		};

		recognition.onerror = event => {
			console.error("Speech recognition error:", event.error);
			setError(event.error);
			setListening(false);
		};

		recognition.onresult = event => {
			console.log("Speech recognition result:", event);
			let interimTranscript = "";
			let finalTranscriptText = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				const transcript = result[0].transcript;

				if (result.isFinal) {
					finalTranscriptText += transcript;
				} else {
					interimTranscript += transcript;
				}
			}

			// Update current transcript (interim or final)
			const currentTranscript = finalTranscriptText || interimTranscript;
			setTranscript(currentTranscript);
			setConfidence(
				event.results[event.results.length - 1]?.[0]?.confidence || 0
			);
			setIsInterimResult(!finalTranscriptText);

			// If we have a final result, set it
			if (finalTranscriptText) {
				setFinalTranscript(finalTranscriptText);
				// Auto-stop if not continuous
				if (!continuous) {
					recognition.stop();
				}
			}
		};

		recognitionRef.current = recognition;

		// Cleanup on unmount
		return () => {
			if (recognition) {
				recognition.onresult = null;
				recognition.onend = null;
				recognition.onerror = null;
				recognition.onstart = null;

				try {
					recognition.stop();
				} catch (e) {
					// Ignore errors during cleanup
				}
			}
		};
	}, [lang, continuous, interimResults, maxAlternatives]); // Removed 'listening' from dependencies

	const start = useCallback(() => {
		if (!recognitionRef.current || !supported) {
			console.log("Recognition not available");
			return;
		}

		try {
			// Reset previous state
			setError(null);
			setTranscript("");
			setFinalTranscript("");
			setConfidence(0);
			setIsInterimResult(false);

			console.log("Starting recognition...");
			recognitionRef.current.start();
		} catch (err) {
			console.error("Recognition failed to start:", err);
			setError("Failed to start recognition");
			setListening(false);
		}
	}, [supported]);

	const stop = useCallback(() => {
		if (!recognitionRef.current) return;

		try {
			console.log("Stopping recognition...");
			recognitionRef.current.stop();
		} catch (err) {
			console.error("Recognition failed to stop:", err);
		}
	}, []);

	const reset = useCallback(() => {
		setTranscript("");
		setFinalTranscript("");
		setConfidence(0);
		setError(null);
		setIsInterimResult(false);
	}, []);

	return {
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
	};
}
