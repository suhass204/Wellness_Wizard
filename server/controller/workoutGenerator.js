const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateWorkoutPlan(userData) {
    const prompt = `Generate a detailed weekly workout plan for a person with the following characteristics:
- Age: ${userData.age}
- Weight: ${userData.weight} kg
- Height: ${userData.height} cm
- Gender: ${userData.gender}
- Fitness Level: ${userData.fitnessLevel}
- Goal: ${userData.goal}


Please provide a structured workout plan that includes:
1. Weekly schedule
2. Specific exercises for each day
3. Sets and repetitions
4. Rest periods
5. Recommended intensity
6. Safety precautions
7. Warm-up and cool-down routines`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent({
            contents: [{ 
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
            },
        });

        const response = await result.response;
        const text = response.text();
        const workoutPlan = {
            weeklySchedule: text,
            generatedAt: new Date().toISOString(),
            userProfile: userData
        };

        return workoutPlan;
    } catch (error) {
        console.error('Error calling Google Gemini:', error);
        throw new Error('Failed to generate workout plan');
    }
}

module.exports = {
    generateWorkoutPlan
};

