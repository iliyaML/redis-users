const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const app = express();

const PORT = 3000;

// Create Redis Client
const client = redis.createClient();
client.on('connect', () => console.log('Connected to Redis'));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Method Override Middleware
app.use(methodOverride('_method'));

// Index Page
app.get('/', (req, res) => {
    res.render('searchusers');
});

// Search Page (POST Request)
app.post('/user/search', (req, res) => {
    const id = req.body.id;

    client.hgetall(id, (err, obj) => {
        if(!obj){ // If user does not exist in Redis
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else { // If user exists
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User (GET Request)
app.get('/user/add', (req, res) => {
    res.render('adduser');
});

// Add User (POST Request)
app.post('/user/add', (req, res) => {
    const id = req.body.id;
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    const email = req.body.email;
    const phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Delete User
app.delete('/user/delete/:id', (req, res) => {
    client.del(req.params.id);
    res.redirect('/');
});

// Listening
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));