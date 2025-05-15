const validateRegistration = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate name
    if (!name || name.trim().length < 2) {
        req.flash('error', 'Name must be at least 2 characters long');
        return res.redirect('/register');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        req.flash('error', 'Please provide a valid email address');
        return res.redirect('/register');
    }

    // Validate password
    if (!password || password.length < 8) {
        req.flash('error', 'Password must be at least 8 characters long');
        return res.redirect('/register');
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        req.flash('error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return res.redirect('/register');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/register');
    }

    next();
};

const validateModelInput = (req, res, next) => {
    const { household_size, income, meals_per_day, food_expenditure } = req.body;

    // Convert to numbers and validate
    const numHouseholdSize = parseInt(household_size);
    const numIncome = parseInt(income);
    const numMealsPerDay = parseInt(meals_per_day);
    const numFoodExpenditure = parseInt(food_expenditure);

    if (isNaN(numHouseholdSize) || numHouseholdSize < 1 || numHouseholdSize > 20) {
        return res.status(400).json({ error: 'Invalid household size' });
    }

    if (isNaN(numIncome) || numIncome < 0) {
        return res.status(400).json({ error: 'Invalid income value' });
    }

    if (isNaN(numMealsPerDay) || numMealsPerDay < 1 || numMealsPerDay > 10) {
        return res.status(400).json({ error: 'Invalid meals per day value' });
    }

    if (isNaN(numFoodExpenditure) || numFoodExpenditure < 0) {
        return res.status(400).json({ error: 'Invalid food expenditure value' });
    }

    // Add validated values to request
    req.validatedInput = {
        household_size: numHouseholdSize,
        income: numIncome,
        meals_per_day: numMealsPerDay,
        food_expenditure: numFoodExpenditure
    };

    next();
};

module.exports = {
    validateRegistration,
    validateModelInput
}; 