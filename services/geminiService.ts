
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Place } from '../types';

const parseGeminiResponse = (responseText: string, groundingChunks: any[]): Place[] => {
    const places: Place[] = [];
    if (!responseText || groundingChunks.length === 0) {
        return places;
    }

    const placeSections = responseText.split('###').filter(s => s.trim() !== '');

    placeSections.forEach((section, index) => {
        const nameMatch = section.match(/(.*?)\n/);
        const categoryMatch = section.match(/\*\*Category:\*\* (.*?)\n/);
        const ratingMatch = section.match(/\*\*Rating:\*\* ([\d.]+)/);
        
        // Find description: it's the remaining text after the metadata lines.
        const descriptionLines = section.split('\n').slice(3).join('\n').trim();

        const groundingChunk = groundingChunks[index];

        if (nameMatch && categoryMatch && ratingMatch && descriptionLines && groundingChunk?.maps?.uri) {
            const name = nameMatch[1].trim();
            places.push({
                id: groundingChunk.maps.uri,
                name: name,
                category: categoryMatch[1].trim(),
                rating: parseFloat(ratingMatch[1]),
                description: descriptionLines,
                imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/800/600`,
                mapsUri: groundingChunk.maps.uri,
                mapsTitle: groundingChunk.maps.title,
            });
        }
    });

    return places;
};


export const fetchKuakataPlaces = async (location: { latitude: number; longitude: number; }): Promise<Place[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const prompt = `
    Create a travel guide for Kuakata, Bangladesh. List the top 15-20 most-rated and popular places to visit.
    For each place, provide the following information in this exact format, with no deviations:

    ### [Place Name]
    **Category:** [One of: Beach, Viewpoint, Park, Temple, Hotspot]
    **Rating:** [A number out of 5, e.g., 4.7]
    [A concise, engaging 2-3 sentence description for a tourist.]

    Do not include any introductory text, concluding text, or any other formatting. Only provide the list of places as specified.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    }
                }
            },
        });
        
        const responseText = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        if (!responseText || groundingChunks.length === 0) {
            throw new Error("API returned no content or grounding data.");
        }

        return parseGeminiResponse(responseText, groundingChunks);
    } catch (error) {
        console.error("Error fetching Kuakata places:", error);
        throw new Error("Failed to generate the travel guide. Check your API key and connection.");
    }
};