"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, User, MapPin, Building, Calendar } from "lucide-react";
import { NlpData, TranscriptListProps } from "@/types/nlp";

export default function TranscriptList({
	items,
	onDelete,
}: TranscriptListProps) {
	if (!items || items.length === 0) {
		return (
			<Card className="w-full max-w-4xl mx-auto">
				<CardContent className="pt-6">
					<div className="text-center text-gray-500 py-8">
						<p className="text-lg">No transcripts yet</p>
						<p className="text-sm mt-1">Start speaking to create some!</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}

	function getSentimentInfo(sentiment: NlpData["sentiment"]) {
		if (!sentiment) return null;

		// Handle new format
		if (typeof sentiment === "object" && "label" in sentiment) {
			const { label, confidence, score } = sentiment;
			return {
				label: label.charAt(0).toUpperCase() + label.slice(1),
				variant:
					label === "positive"
						? "default"
						: label === "negative"
						? "destructive"
						: "secondary",
				color:
					label === "positive"
						? "bg-green-100 text-green-800"
						: label === "negative"
						? "bg-red-100 text-red-800"
						: "bg-gray-100 text-gray-800",
				score: Math.round(score * 100) / 100,
				confidence: Math.round(confidence * 100),
			};
		}

		if (Array.isArray(sentiment) && sentiment.length > 0) {
			const avgSentiment =
				sentiment.reduce((sum, s) => sum + s, 0) / sentiment.length;

			let label: "positive" | "negative" | "neutral";
			if (avgSentiment > 0.1) label = "positive";
			else if (avgSentiment < -0.1) label = "negative";
			else label = "neutral";

			return {
				label: label.charAt(0).toUpperCase() + label.slice(1),
				variant:
					label === "positive"
						? "default"
						: label === "negative"
						? "destructive"
						: "secondary",
				color:
					label === "positive"
						? "bg-green-100 text-green-800"
						: label === "negative"
						? "bg-red-100 text-red-800"
						: "bg-gray-100 text-gray-800",
				score: Math.round(avgSentiment * 100) / 100,
				confidence: Math.round(Math.abs(avgSentiment) * 100),
			};
		}

		return null;
	}
	return (
		<div className="w-full max-w-4xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-semibold text-gray-900">
					Your Transcripts
				</h3>
				<Badge variant="outline">
					{items.length} transcript{items.length !== 1 ? "s" : ""}
				</Badge>
			</div>

			<div className="space-y-4">
				{items.map(item => {
					const sentimentInfo = item.nlpData?.sentiment
						? getSentimentInfo(item.nlpData.sentiment)
						: null;

					return (
						<Card key={item.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<span className="text-sm text-gray-500">
											{formatTime(item.timestamp)}
										</span>
										{sentimentInfo && (
											<Badge className={sentimentInfo.color}>
												{sentimentInfo.label}
											</Badge>
										)}
										{item.nlpData?.questions && (
											<Badge variant="outline">Question</Badge>
										)}
									</div>
									{onDelete && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDelete(item.id)}
											className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</CardHeader>

							<CardContent className="pt-0">
								<p className="text-lg leading-relaxed mb-4">{item.text}</p>

								{item.nlpData && (
									<>
										<Separator className="my-4" />
										<div className="space-y-4">
											<h4 className="text-sm font-medium text-gray-700">
												Enhanced Analysis
											</h4>

											{/* Sentiment with confidence */}
											{item.nlpData.sentiment && (
												<div className="flex items-center space-x-2">
													{(() => {
														const sentimentInfo = getSentimentInfo(
															item.nlpData.sentiment
														);
														return sentimentInfo ? (
															<>
																<Badge className={sentimentInfo.color}>
																	{sentimentInfo.label} (
																	{sentimentInfo.confidence}% confident)
																</Badge>
																<span className="text-xs text-gray-500">
																	Score: {sentimentInfo.score}
																</span>
															</>
														) : null;
													})()}
												</div>
											)}

											{/* Emotions */}
											{item.nlpData.emotions && (
												<div>
													<p className="text-sm font-medium text-gray-700 mb-2">
														Emotions
													</p>
													<div className="grid grid-cols-2 gap-2">
														{Object.entries(item.nlpData.emotions).map(
															([emotion, score]) =>
																score > 0.1 && (
																	<div
																		key={emotion}
																		className="flex items-center space-x-2"
																	>
																		<Badge
																			variant="outline"
																			className={`text-xs ${
																				emotion === "joy"
																					? "border-yellow-300 text-yellow-700"
																					: emotion === "anger"
																					? "border-red-300 text-red-700"
																					: emotion === "fear"
																					? "border-purple-300 text-purple-700"
																					: "border-blue-300 text-blue-700"
																			}`}
																		>
																			{emotion}: {Math.round(score * 100)}%
																		</Badge>
																	</div>
																)
														)}
													</div>
												</div>
											)}

											{/* Statistics */}
											{item.nlpData.statistics && (
												<div className="text-xs text-gray-500">
													<p>
														{item.nlpData.statistics.wordCount} words,{" "}
														{item.nlpData.statistics.sentenceCount} sentences
														{item.nlpData.language &&
															` • Language: ${item.nlpData.language}`}
														{item.nlpData.isQuestion && ` • Question detected`}
													</p>
												</div>
											)}

											{/* Entities */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{item.nlpData.entities?.people &&
													item.nlpData.entities.people.length > 0 && (
														<div className="flex items-start space-x-2">
															<User className="h-4 w-4 mt-0.5 text-blue-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	People
																</p>
																<div className="flex flex-wrap gap-1 mt-1">
																	{item.nlpData.entities.people.map(
																		(person, idx) => (
																			<Badge
																				key={idx}
																				variant="secondary"
																				className="text-xs"
																			>
																				{person}
																			</Badge>
																		)
																	)}
																</div>
															</div>
														</div>
													)}

												{/* Similar updates for places, organizations, dates */}
											</div>

											{/* Keywords */}
											{item.nlpData.keywords &&
												item.nlpData.keywords.length > 0 && (
													<div>
														<p className="text-sm font-medium text-gray-700 mb-2">
															Key Topics
														</p>
														<div className="flex flex-wrap gap-1">
															{item.nlpData.keywords
																.slice(0, 8)
																.map((keyword, idx) => (
																	<Badge
																		key={idx}
																		variant="outline"
																		className="text-xs"
																	>
																		{keyword}
																	</Badge>
																))}
														</div>
													</div>
												)}
										</div>
									</>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
