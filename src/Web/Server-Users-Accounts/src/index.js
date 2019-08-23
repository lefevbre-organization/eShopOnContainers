const express = require('express');
const morgan = require('morgan');
const path = require('path');

const { mongoose } = require('./database');

const cors = require('cors');

const app = express();

// Settings
app.set('port', process.env.PORT || 3500)

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/accounts', require('./routes/account.routes'));

// Static files
app.use(express.static(path.join(__dirname, '/public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});