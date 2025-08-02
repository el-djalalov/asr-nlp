import nlp from "compromise";

export type NlpResult = {
	sentiment: number[];
	people: string[];
	places: string[];
	nouns: string[];
	organizations: string[];
	dates: string[];
	questions: boolean;
	topics: string[];
};

/**
 * Process text with compromise NLP library
 */
export function processText(text: string): NlpResult {
	if (!text) {
		return {
			sentiment: [],
			people: [],
			places: [],
			nouns: [],
			organizations: [],
			dates: [],
			questions: false,
			topics: [],
		};
	}

	const doc = nlp(text);

	// Extract data
	const people = doc.people().out("array");
	const places = doc.places().out("array");
	const organizations = doc.organizations().out("array");
	const dates = doc.dates().out("array");
	const questions = doc.questions().found;

	// Get all nouns excluding named entities
	const allNouns = doc.nouns().out("array");
	const namedEntities = [...people, ...places, ...organizations];
	const nouns = allNouns.filter(
		noun =>
			!namedEntities.some(entity =>
				entity.toLowerCase().includes(noun.toLowerCase())
			)
	);

	// Get sentiment scores for each sentence
	const sentiments = doc
		.sentences()
		.map(s => {
			return s.sentiment();
		})
		.out("array");

	// Extract topics (experimental)
	const topics = [];
	const termList = doc.terms().out("frequency");
	if (termList.length > 0) {
		topics.push(
			...termList
				.filter((t: any) => t.normal.length > 3) // Filter out short words
				.slice(0, 3) // Take top 3
				.map((t: any) => t.normal)
		);
	}

	return {
		sentiment: sentiments,
		people,
		places,
		nouns,
		organizations,
		dates,
		questions,
		topics,
	};
}

export default {
	processText,
};
