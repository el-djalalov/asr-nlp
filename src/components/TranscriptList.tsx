"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, User, MapPin, Building, Calendar } from "lucide-react";

type NlpData = {
	sentiment?: number[];
	nouns?: string[];
	places?: string[];
	people?: string[];
	organizations?: string[];
	dates?: string[];
	questions?: boolean;
	topics?: string[];
};

type TranscriptItem = {
	id: string;
	text: string;
	timestamp: number;
	nlpData?: NlpData;
};

type TranscriptListProps = {
	items: TranscriptItem[];
	onDelete?: (id: string) => void;
};

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

	function getSentimentInfo(sentiments: number[]) {
		if (!sentiments || sentiments.length === 0) return null;

		const avgSentiment =
			sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

		if (avgSentiment > 0.1)
			return {
				label: "Positive",
				variant: "default",
				color: "bg-green-100 text-green-800",
			};
		if (avgSentiment < -0.1)
			return {
				label: "Negative",
				variant: "destructive",
				color: "bg-red-100 text-red-800",
			};
		return {
			label: "Neutral",
			variant: "secondary",
			color: "bg-gray-100 text-gray-800",
		};
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
										<div className="space-y-3">
											<h4 className="text-sm font-medium text-gray-700">
												Analysis
											</h4>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{item.nlpData.people &&
													item.nlpData.people.length > 0 && (
														<div className="flex items-start space-x-2">
															<User className="h-4 w-4 mt-0.5 text-blue-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	People
																</p>
																<div className="flex flex-wrap gap-1 mt-1">
																	{item.nlpData.people.map((person, idx) => (
																		<Badge
																			key={idx}
																			variant="secondary"
																			className="text-xs"
																		>
																			{person}
																		</Badge>
																	))}
																</div>
															</div>
														</div>
													)}

												{item.nlpData.places &&
													item.nlpData.places.length > 0 && (
														<div className="flex items-start space-x-2">
															<MapPin className="h-4 w-4 mt-0.5 text-green-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	Places
																</p>
																<div className="flex flex-wrap gap-1 mt-1">
																	{item.nlpData.places.map((place, idx) => (
																		<Badge
																			key={idx}
																			variant="secondary"
																			className="text-xs"
																		>
																			{place}
																		</Badge>
																	))}
																</div>
															</div>
														</div>
													)}

												{item.nlpData.organizations &&
													item.nlpData.organizations.length > 0 && (
														<div className="flex items-start space-x-2">
															<Building className="h-4 w-4 mt-0.5 text-purple-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	Organizations
																</p>
																<div className="flex flex-wrap gap-1 mt-1">
																	{item.nlpData.organizations.map(
																		(org, idx) => (
																			<Badge
																				key={idx}
																				variant="secondary"
																				className="text-xs"
																			>
																				{org}
																			</Badge>
																		)
																	)}
																</div>
															</div>
														</div>
													)}

												{item.nlpData.dates &&
													item.nlpData.dates.length > 0 && (
														<div className="flex items-start space-x-2">
															<Calendar className="h-4 w-4 mt-0.5 text-orange-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	Dates
																</p>
																<div className="flex flex-wrap gap-1 mt-1">
																	{item.nlpData.dates.map((date, idx) => (
																		<Badge
																			key={idx}
																			variant="secondary"
																			className="text-xs"
																		>
																			{date}
																		</Badge>
																	))}
																</div>
															</div>
														</div>
													)}
											</div>

											{item.nlpData.nouns && item.nlpData.nouns.length > 0 && (
												<div>
													<p className="text-sm font-medium text-gray-700 mb-2">
														Key Topics
													</p>
													<div className="flex flex-wrap gap-1">
														{item.nlpData.nouns.slice(0, 8).map((noun, idx) => (
															<Badge
																key={idx}
																variant="outline"
																className="text-xs"
															>
																{noun}
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
