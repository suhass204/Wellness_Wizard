const { GoogleGenerativeAI } = require("@google/generative-ai");

const getNutritionPlan = async (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const inputData = req.body;

  const prompt = {
    inputData: {
      age: inputData.age,
      gender: inputData.gender,
      weight: inputData.weight,
      height: inputData.height,
      dietaryPreferences: inputData.dietaryPreferences,
      activityLevel: inputData.activityLevel,
      fitnessGoal: inputData.fitnessGoal,
      region: inputData.region,
      allergies: inputData.allergies,
      foodtype: inputData.foodtype
    },
    outputFormat: {
      TotalDailyCaloricIntake: "number",
      Breakfast: {
        Calories: "number",
        Protein: "number",
        Carbs: "number",
        Fat: "number",
        Ingredients: "object with food items and quantities"
      },
      Lunch: {
        Calories: "number",
        Protein: "number",
        Carbs: "number",
        Fat: "number",
        Ingredients: "object with food items and quantities"
      },
      Dinner: {
        Calories: "number",
        Protein: "number",
        Carbs: "number",
        Fat: "number",
        Ingredients: "object with food items and quantities"
      },
      Snacks: {
        Calories: "number",
        Protein: "number",
        Carbs: "number",
        Fat: "number",
        Ingredients: "object with food items and quantities"
      }
    }
  };

  const promptText = `As a chef and fitness coach, create a nutrition plan based on the following information:
    Age: ${inputData.age}
    Gender: ${inputData.gender}
    Weight: ${inputData.weight}
    Height: ${inputData.height}
    Dietary Preferences: ${inputData.dietaryPreferences}
    Activity Level: ${inputData.activityLevel}
    Fitness Goal: ${inputData.fitnessGoal}
    Region: ${inputData.region}
    Allergies: ${inputData.allergies}
    Food Type: ${inputData.foodtype}

    Provide a detailed nutrition plan in the following JSON format without any additional text or markdown:
    ${JSON.stringify(prompt.outputFormat, null, 2)}`;

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = await response.text();

    const cleanedText = text.replace(/```json|```/g, '').trim();

    try {
      const jsonResponse = JSON.parse(cleanedText);
      return res.json(jsonResponse);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Received text:", cleanedText);
      return res.status(500).json({
        error: "Failed to parse nutrition plan",
        details: "The AI response was not in valid JSON format"
      });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({
      error: "Failed to generate nutrition plan",
      details: error.message
    });
  }
};

module.exports = { getNutritionPlan };
