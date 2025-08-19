import { ChangeEvent, FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Copy, LoaderCircle } from "lucide-react";

export default function ASR_NLP() {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [text, setText] = useState<string>("");
	const [recognizedText, setRecognizedText] = useState<string>("");
	const [tokens, setTokens] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(false); // State for loading

	const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAudioFile(e.target.files[0]);
		}
	};

	const handleAudioSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		if (audioFile) {
			formData.append("audio", audioFile);
		}

		setLoading(true); // Start loading

		const response = await fetch("http://localhost:5000/api/recognize", {
			method: "POST",
			body: formData,
		});

		const data = await response.json();
		setLoading(false); // Stop loading

		if (response.ok) {
			setRecognizedText(data.text);
		} else {
			alert(data.error);
		}
	};

	const handleTextSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true); // Start loading

		const response = await fetch("http://localhost:5000/api/tokenize", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text }),
		});

		const data = await response.json();
		setLoading(false); // Stop loading

		if (response.ok) {
			setTokens(data.tokens);
		} else {
			alert("Error tokenize text");
		}
	};

	const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
	};

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text);
	};

	return (
		<div className="flex flex-col space-y-6 my-4 p-6 bg-gray-800 text-white rounded-lg shadow-lg w-4xl">
			<h2 className="text-2xl font-semibold text-blue-500">
				Speech Recognition
			</h2>
			<form onSubmit={handleAudioSubmit} className="flex flex-col space-y-4">
				<Input
					type="file"
					accept="audio/*"
					onChange={handleAudioChange}
					required
					className="bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 hover:border-blue-400"
				/>
				<div className="flex gap-4">
					<Button
						type="submit"
						className="bg-blue-500 hover:bg-blue-600 rounded-lg p-2 transition-colors duration-300 w-36"
					>
						Recognize Speech
					</Button>
				</div>
			</form>
			<div className="flex items-center flex-col">
				{loading && <LoaderCircle color="#ffffff" className="animate-spin" />}
				{recognizedText && (
					<div className="flex items-center justify-center">
						<p className="mt-4 text-green-300 font-medium">
							<span className="bg-accent-foreground w-34 px-2 py-1 mr-1 rounded-2xl">
								Recognized Text:
							</span>
							{recognizedText}
						</p>

						<Button
							onClick={() => copyToClipboard(recognizedText)}
							className="bg-blue-500 mx-2"
							variant="secondary"
							size={"icon"}
						>
							<Copy className="text-accent hover:text-blue-500" />
						</Button>
					</div>
				)}
			</div>
			<h2 className="text-2xl font-semibold text-blue-500">
				Text Tokenization
			</h2>
			<form onSubmit={handleTextSubmit} className="flex flex-col space-y-4">
				<Textarea
					value={text}
					onChange={handleTextChange}
					required
					className="custom-textarea placeholder:text-gray-400 border-gray-500 rounded-md p-2 transition-colors duration-300"
				/>
				<Button
					type="submit"
					className="bg-blue-500 hover:bg-blue-600 rounded-lg p-2 transition-colors duration-300"
				>
					Tokenize Text
				</Button>
			</form>
			{loading && <p className="text-blue-300">Loading...</p>}{" "}
			{/* Loading indicator */}
			{tokens.length > 0 && (
				<p className="mt-4 text-blue-300 font-medium">
					<span className="bg-accent-foreground w-34 px-2 py-1 mr-1 rounded-2xl">
						Tokens:
					</span>
					{tokens.join(", ")}
				</p>
			)}
		</div>
	);
}
