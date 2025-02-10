const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const initializePassport = require('./pswConfig');
initializePassport(passport);
console.log(require('./server/routes/dietroutes'));

const { getNutritionPlan } = require('./server/routes/dietroutes');
console.log(getNutritionPlan);

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
const workoutRoutes = require('./server/routes/workoutRoutes');
app.use('/api/workouts', workoutRoutes);

const chatRoutes = require('./server/routes/chatRoutes');
app.use('/api/chatbot', chatRoutes);

app.post('/get-nutrition-plan', getNutritionPlan);


app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 3600000, 
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
  res.render('dashboard');
});

// Route for the index.ejs file
app.get('/index', (req, res) => {
  res.render('index');
});

app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/diet', (req, res) => {
  res.render('diet');
});

app.get('/workout', (req, res) => {
  res.render('workout');
});

app.get('/chatbot', (req, res) => {
  res.render('chatbot');
});

app.get('/recommendation', (req, res) => {
  res.render('recommendation');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register');
});
app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/users/home', checkNotAuthenticated, (req, res) => {
  res.render('home', { user: req.user.name });
});


app.get('/logout', (req, res) => {
  // Destroy the user's session
  req.session.destroy((err) => {
      if (err) {
          console.error('Error during session destruction:', err);
          return res.status(500).send('An error occurred while logging out.');
      }
      // Clear cookies (optional, depending on setup)
      res.clearCookie('connect.sid'); 
      res.redirect('/'); 
  });
});


app.post('/users/register', async (req, res) => {
  let { name, email, password, password_confirm } = req.body;
  let errors = [];

  console.log({
    name,
    email,
    password,
    password_confirm,
  });

  if (!name || !email || !password || !password_confirm) {
    errors.push({ message: 'Please enter all field correctly' });
  }
  if (password.length < 6) {
    errors.push({ message: 'Password must be 6 characters long' });
  }

  if (password !== password_confirm) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, email, password, password_confirm });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          return res.render('register', {
            message: 'Email already registered',
          });
        } else {
          pool.query(
            `INSERT INTO users (name,email,password)
            VALUES ($1, $2, $3)
            RETURNING id,password `,
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash('success_msg', 'You are successfuly registered');
              res.redirect('/users/login');
            }
          );
        }
      }
    );
  }
});

app.post(
  '/users/login',
  passport.authenticate('local', {
    successRedirect: '/users/home',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/home');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
      error: 'Something went wrong!',
      message: err.message 
  });
});

// Validate environment variables on startup
const requiredEnvVars = ['GOOGLE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


