import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { text } = await request.json();

		if (!text) {
			return NextResponse.json({ error: "Text is required" }, { status: 400 });
		}

		// Simple mock NLP processing
		interface NlpData {
			sentiment: number[];
			nouns: string[];
			places: string[];
			people: string[];
			organizations: string[];
			dates: string[];
			questions: boolean;
			topics: string[];
		}

		const nlpData: NlpData = {
			sentiment: [Math.random() * 2 - 1], // Random sentiment between -1 and 1
			nouns: text.split(" ").filter((word: string) => word.length > 3),
			places: [],
			people: [],
			organizations: [],
			dates: [],
			questions: text.includes("?"),
			topics: [],
		};

		return NextResponse.json(nlpData);
	} catch (error) {
		console.error("NLP processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
