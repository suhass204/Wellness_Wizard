const express = require('express');
const router = express.Router();
const { generateWorkoutPlan } = require('../controller/workoutGenerator');

router.post('/generate-workout', async (req, res) => {
    try {
        const { age, weight, height, gender, fitnessLevel, goal } = req.body;

        if (!age || !weight || !height || !gender || !fitnessLevel || !goal) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const workoutPlan = await generateWorkoutPlan({
            age,
            weight,
            height,
            gender,
            fitnessLevel,
            goal
        });

        res.json(workoutPlan);
    } catch (error) {
        console.error('Error generating workout plan:', error);
        res.status(500).json({ error: 'Error generating workout plan' });
    }
});

module.exports = router;