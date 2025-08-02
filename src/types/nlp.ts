export type TranscriptItem = {
	id: string;
	text: string;
	timestamp: number;
	nlpData?: NlpData;
};

export type TranscriptListProps = {
	items: TranscriptItem[];
	onDelete?: (id: string) => void;
};

export type NlpData = {
	sentiment?:
		| number[]
		| {
				score: number;
				comparative: number;
				label: "positive" | "negative" | "neutral";
				confidence: number;
		  };
	nouns?: string[];
	places?: string[];
	people?: string[];
	organizations?: string[];
	dates?: string[];
	questions?: boolean;
	topics?: string[];

	// New enhanced format
	entities?: {
		people: string[];
		places: string[];
		organizations: string[];
		dates: string[];
	};
	keywords?: string[];
	emotions?: {
		joy: number;
		anger: number;
		fear: number;
		sadness: number;
	};
	statistics?: {
		wordCount: number;
		sentenceCount: number;
		averageWordsPerSentence: number;
	};
	isQuestion?: boolean;
	language?: string;
};
