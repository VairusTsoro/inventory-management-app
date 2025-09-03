const express = require('express')
const db = require('./models')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const translate = require('@vitalets/google-translate-api').translate;
require('./auth-google')
require('./auth-github')
require('dotenv').config()
const path = require('path');


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('https://inventory-management-app-ctpn.onrender.com/login');
}

const app = express()

const port = process.env.PORT || 3000

app.use(cors({
  origin: 'https://inventory-management-app-ctpn.onrender.com',
  credentials: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true if HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());

app.get('/api/auth-status', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'https://inventory-management-app-ctpn.onrender.com/login' }),
  function (req, res) {
    res.redirect('https://inventory-management-app-ctpn.onrender.com/dashboard');
  });

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'https://inventory-management-app-ctpn.onrender.com/login' }),
  function (req, res) {
    res.redirect('https://inventory-management-app-ctpn.onrender.com/dashboard');
  });

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.redirect('https://inventory-management-app-ctpn.onrender.com/dashboard');
});

app.get('/api/inventories', (req, res) => {
  db.Inventories.findAll()
    .then((inventories) => {
      res.status(200).json(inventories)
    })
    .catch((err) => {
      console.error('Error fetching inventory:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.post('/api/inventories', (req, res) => {
  db.Inventories.create(req.body)
    .then((inventories) => {
      res.status(201).json(inventories)
    })
    .catch((err) => {
      console.error('Error creating inventory:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.post('/api/items', (req, res) => {
  db.Items.create(req.body)
    .then((item) => {
      res.status(201).json(item)
    })
    .catch((err) => {
      console.error('Error creating item:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/api/items', (req, res) => {
  db.Items.findAll()
    .then((items) => {
      res.status(200).json(items)
    })
    .catch((err) => {
      console.error('Error fetching items:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
});

app.delete('/api/items', (req, res) => {
  db.Items.destroy({ where: { id: req.body.id } })
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      console.error('Error deleting item:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    });
});

app.get('/api/users', (req, res) => {
  db.Users.findAll()
    .then((users) => {
      res.status(200).json(users)
    })
    .catch((err) => {
      console.error('Error fetching users:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/api/translate', (req, res) => {
  const { text, lang } = req.query;
  if (!text || !lang) {
    return res.status(400).json({ error: 'Missing text or lang' });
  }
  console.log(translate);
  try {
    translate(text, { to: lang })
      .then((result) => {
        res.status(200).json({ translatedText: result.text });
      })
      .catch((err) => {
        console.error('Error translating text:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (err) {
    console.error('Error translating text:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`)
    })
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })
