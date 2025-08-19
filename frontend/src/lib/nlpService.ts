import { NlpData } from "@/types/nlp";
import natural from "natural";

// Initialize the sentiment analyzer
const analyzer = new natural.SentimentAnalyzer(
	"English",
	natural.PorterStemmer,
	"negation"
);

// Tokenizer for breaking text into words
const tokenizer = new natural.WordTokenizer();

// Named Entity Recognition patterns
const personPattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
const placePattern =
	/\b(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
const organizationPattern =
	/\b([A-Z][A-Za-z]*\s+(?:Inc|Corp|LLC|Ltd|Company|Corporation|Organization))\b/g;
const datePattern =
	/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\btoday|tomorrow|yesterday|next week|last week\b/gi;

// Simple language detection based on common words
function detectLanguage(text: string): string {
	const commonWords = {
		en: [
			"the",
			"and",
			"is",
			"in",
			"to",
			"of",
			"a",
			"that",
			"it",
			"with",
			"for",
			"as",
			"was",
			"on",
			"are",
		],
		es: [
			"el",
			"la",
			"de",
			"que",
			"y",
			"a",
			"en",
			"un",
			"es",
			"se",
			"no",
			"te",
			"lo",
			"le",
			"da",
		],
		fr: [
			"le",
			"de",
			"et",
			"à",
			"un",
			"il",
			"être",
			"et",
			"en",
			"avoir",
			"que",
			"pour",
			"dans",
			"ce",
			"son",
		],
		de: [
			"der",
			"die",
			"und",
			"in",
			"den",
			"von",
			"zu",
			"das",
			"mit",
			"sich",
			"des",
			"auf",
			"für",
			"ist",
			"im",
		],
	};

	const words = text.toLowerCase().split(/\s+/);
	const scores: { [key: string]: number } = {};

	Object.entries(commonWords).forEach(([lang, commonWordsList]) => {
		scores[lang] = words.filter(word => commonWordsList.includes(word)).length;
	});

	const detectedLang = Object.entries(scores).reduce((a, b) =>
		scores[a[0]] > scores[b[0]] ? a : b
	)[0];
	return scores[detectedLang] > 0 ? detectedLang : "en";
}

export async function processText(text: string): Promise<NlpData> {
	try {
		// Basic text statistics
		const words = tokenizer.tokenize(text.toLowerCase()) || [];
		const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

		// Sentiment Analysis using Natural
		const tokens = words.filter(word => word.length > 2);
		const stemmedTokens = tokens.map(token =>
			natural.PorterStemmer.stem(token)
		);

		// Get sentiment score
		const sentimentScore = analyzer.getSentiment(stemmedTokens);

		// Enhanced sentiment analysis
		const positiveWords = [
			"good",
			"great",
			"excellent",
			"amazing",
			"wonderful",
			"fantastic",
			"love",
			"like",
			"happy",
			"pleased",
		];
		const negativeWords = [
			"bad",
			"terrible",
			"awful",
			"hate",
			"dislike",
			"angry",
			"sad",
			"disappointed",
			"frustrated",
		];

		let positiveCount = 0;
		let negativeCount = 0;

		words.forEach(word => {
			if (positiveWords.includes(word)) positiveCount++;
			if (negativeWords.includes(word)) negativeCount++;
		});

		// Calculate enhanced sentiment
		const enhancedScore =
			(positiveCount - negativeCount) / Math.max(words.length, 1);
		const finalSentimentScore = (sentimentScore + enhancedScore) / 2;

		// Determine sentiment label and confidence
		let sentimentLabel: "positive" | "negative" | "neutral";
		let confidence: number;

		if (finalSentimentScore > 0.1) {
			sentimentLabel = "positive";
			confidence = Math.min(finalSentimentScore * 2, 1);
		} else if (finalSentimentScore < -0.1) {
			sentimentLabel = "negative";
			confidence = Math.min(Math.abs(finalSentimentScore) * 2, 1);
		} else {
			sentimentLabel = "neutral";
			confidence = 1 - Math.abs(finalSentimentScore);
		}

		// Extract entities
		const people = [
			...new Set((text.match(personPattern) || []).map(match => match.trim())),
		];
		const places = [
			...new Set(
				Array.from(text.matchAll(placePattern), m => m[1]).filter(Boolean)
			),
		];
		const organizations = [
			...new Set(
				(text.match(organizationPattern) || []).map(match => match.trim())
			),
		];
		const dates = [
			...new Set((text.match(datePattern) || []).map(match => match.trim())),
		];

		// Extract keywords (nouns and important words)
		const stopWords = natural.stopwords;
		const keywords = tokens
			.filter(word => word.length > 3 && !stopWords.includes(word))
			.reduce((acc: { [key: string]: number }, word) => {
				acc[word] = (acc[word] || 0) + 1;
				return acc;
			}, {});

		const sortedKeywords = Object.entries(keywords)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([word]) => word);

		// Simple emotion detection based on keywords
		const emotionKeywords = {
			joy: [
				"happy",
				"joy",
				"excited",
				"thrilled",
				"delighted",
				"cheerful",
				"glad",
			],
			anger: ["angry", "mad", "furious", "annoyed", "irritated", "rage"],
			fear: ["afraid", "scared", "worried", "anxious", "nervous", "terrified"],
			sadness: [
				"sad",
				"depressed",
				"upset",
				"disappointed",
				"miserable",
				"heartbroken",
			],
		};

		const emotions = {
			joy: calculateEmotionScore(words, emotionKeywords.joy),
			anger: calculateEmotionScore(words, emotionKeywords.anger),
			fear: calculateEmotionScore(words, emotionKeywords.fear),
			sadness: calculateEmotionScore(words, emotionKeywords.sadness),
		};

		// Language detection (simple)
		const language = detectLanguage(text);

		return {
			sentiment: {
				score: finalSentimentScore,
				comparative: finalSentimentScore / Math.max(words.length, 1),
				label: sentimentLabel,
				confidence: confidence,
			},
			entities: {
				people,
				places,
				organizations,
				dates,
			},
			keywords: sortedKeywords,
			emotions,
			statistics: {
				wordCount: words.length,
				sentenceCount: sentences.length,
				averageWordsPerSentence: words.length / Math.max(sentences.length, 1),
			},
			isQuestion:
				text.includes("?") ||
				/^(what|when|where|who|why|how|do|does|did|can|could|would|will|is|are)/i.test(
					text.trim()
				),
			language,
		};
	} catch (error) {
		console.error("NLP processing error:", error);
		throw new Error("Failed to process text");
	}
}

function calculateEmotionScore(
	words: string[],
	emotionWords: string[]
): number {
	const matches = words.filter(word => emotionWords.includes(word)).length;
	return Math.min((matches / Math.max(words.length, 1)) * 10, 1);
}
