const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model =genAI.getGenerativeModel({model:'gemini-1.5-flash'});

const cleanResponse = (response) => {
    return response
        .replace(/[\n*]/g, '') 
        .replace(/\s+/g, ' ')   
        .trim();                
};

const careerChat = async (req, res) => {
    try {
        const { prompt, category } = req.body;
        let fullPrompt;

        switch (category) {
            case 'Fitness Queries':
                fullPrompt = `You are an AI fitness assistant. Provide detailed guidance on ${prompt} including actionable steps and precautions. Keep the response informative, direct, and easy to understand.`;
                break;
            case 'Supplement Guidance':
                fullPrompt = `You are an AI nutrition expert. Offer comprehensive supplement advice for ${prompt}, including benefits, risks, and proper usage. Ensure the information is accurate and concise.`;
                break;
            case 'Equipment Support':
                fullPrompt = `You are an AI equipment advisor. Give practical tips on selecting, using, or maintaining fitness equipment for ${prompt}. Make the response clear and user-friendly.`;
                break;
            case 'Wellness Coaching':
                fullPrompt = `You are an AI wellness coach. Provide holistic advice on achieving wellness goals related to ${prompt}, focusing on balanced approaches and sustainable habits.`;
                break;
            default:
                fullPrompt = `You are an AI assistant. Share key insights about ${prompt}, focusing on clarity and actionable advice. Avoid extra characters or unnecessary formatting.`;
        }

        const result = await model.generateContent({
            contents: [{ 
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100,
            },
        });
        const response=await result.response;
        const  text=await response.text();
        const cleanedText = cleanResponse(text);

        res.json(cleanedText); 

    } catch (error) {
        console.error("Error in career chat:", error);
        res.status(500).json({ error: error.message || "Failed to generate response" });
    }
};

module.exports = { careerChat };
