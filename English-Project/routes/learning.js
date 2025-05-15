const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Sample module data (in a real app, this would come from a database)
const modules = {
    'food-waste-basics': {
        id: 'food-waste-basics',
        title: 'Food Waste Basics',
        progress: 0,
        lessons: [
            {
                id: 'introduction',
                title: 'Introduction to Food Waste',
                duration: 10,
                type: 'video',
                completed: false,
                current: true,
                content: 'Learn about the global impact of food waste and why it matters.',
                videoUrl: 'https://www.youtube.com/embed/example',
                tips: [
                    'Food waste contributes to climate change',
                    'One-third of all food produced is wasted',
                    'Reducing food waste saves money and resources'
                ],
                resources: [
                    {
                        title: 'UN Food Waste Report',
                        description: 'Comprehensive report on global food waste',
                        url: 'https://example.com/report',
                        icon: 'fas fa-file-pdf'
                    }
                ]
            },
            {
                id: 'waste-types',
                title: 'Types of Food Waste',
                duration: 15,
                type: 'interactive',
                completed: false,
                items: [
                    { name: 'Expired Dairy', category: 'preventable' },
                    { name: 'Vegetable Peels', category: 'unavoidable' },
                    { name: 'Leftover Meals', category: 'preventable' },
                    { name: 'Fruit Cores', category: 'unavoidable' }
                ],
                categories: [
                    { id: 'preventable', name: 'Preventable Waste' },
                    { id: 'unavoidable', name: 'Unavoidable Waste' }
                ]
            },
            {
                id: 'prevention',
                title: 'Waste Prevention Strategies',
                duration: 20,
                type: 'quiz',
                completed: false,
                questions: [
                    {
                        text: 'Which of these is the best way to store leafy greens?',
                        options: [
                            'In an airtight container with a paper towel',
                            'Loose in the refrigerator',
                            'In a plastic bag with air removed',
                            'On the counter at room temperature'
                        ],
                        correctAnswer: 0
                    }
                ]
            }
        ]
    }
};

// Get all modules
router.get('/', isAuthenticated, (req, res) => {
    res.render('learning/modules', {
        modules: Object.values(modules),
        user: req.user
    });
});

// Get specific module
router.get('/module/:moduleId', isAuthenticated, (req, res) => {
    const module = modules[req.moduleId];
    if (!module) {
        return res.status(404).render('error', {
            message: 'Module not found',
            user: req.user
        });
    }

    res.render('learning/module', {
        module,
        currentLesson: module.lessons.find(lesson => lesson.current),
        user: req.user
    });
});

// Get specific lesson in a module
router.get('/module/:moduleId/lesson/:lessonId', isAuthenticated, (req, res) => {
    const module = modules[req.params.moduleId];
    if (!module) {
        return res.status(404).render('error', {
            message: 'Module not found',
            user: req.user
        });
    }

    const lesson = module.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) {
        return res.status(404).render('error', {
            message: 'Lesson not found',
            user: req.user
        });
    }

    // Update current lesson
    module.lessons.forEach(l => l.current = (l.id === lesson.id));

    res.render('learning/module', {
        module,
        currentLesson: lesson,
        user: req.user
    });
});

// Mark lesson as complete
router.post('/api/learning/complete-lesson', isAuthenticated, (req, res) => {
    const { moduleId, lessonId } = req.body;
    const module = modules[moduleId];
    
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Mark current lesson as complete
    module.lessons[lessonIndex].completed = true;
    module.lessons[lessonIndex].current = false;

    // Set next lesson as current if available
    if (lessonIndex < module.lessons.length - 1) {
        module.lessons[lessonIndex + 1].current = true;
    }

    // Update module progress
    const completedLessons = module.lessons.filter(l => l.completed).length;
    module.progress = Math.round((completedLessons / module.lessons.length) * 100);

    res.json({ success: true, progress: module.progress });
});

// Submit quiz answers
router.post('/api/learning/submit-quiz', isAuthenticated, (req, res) => {
    const { moduleId, lessonId, answers } = req.body;
    const module = modules[moduleId];
    
    if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const lesson = module.lessons.find(l => l.id === lessonId);
    if (!lesson || lesson.type !== 'quiz') {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score
    const score = answers.reduce((acc, answer, index) => {
        return acc + (answer === lesson.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / lesson.questions.length) * 100);

    res.json({
        success: true,
        score,
        total: lesson.questions.length,
        percentage,
        passed: percentage >= 70
    });
});

module.exports = router; 