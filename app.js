const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const app = express();

const connection=mysql2.createConnection({
    host:'localhost',
    user:'root',
    password:'1234',
    database:'node_crud3'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
}); 

//set views file
app.set('views',path.join(__dirname,'views'));
			
//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/check_status', (req, res) => {
    res.render('check_status');
});

// POST route for handling the login form submission
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username === 'admin' && password === 'password') {
        res.redirect('/user_index');
    } else {
        // Handle invalid credentials
        res.send('Invalid username or password');
    }
});

app.get('/user_index', (req, res) => {
    let sql = "SELECT * FROM users";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('user_index', {
            title: 'All users data',
            users: rows
        });
    });
});

app.get('/add',(req, res) => {
    res.render('user_add', {
        title : 'Creating Registration form'
    });
});

app.post('/save', (req, res) => {
    let regNo = generateRegNo(); // Generate registration number
    let data = {
        username: req.body.username,
        reg_no: regNo,
        phone_no: req.body.phone_no,
        vehicle_no: req.body.vehicle_no,
        services: req.body.services,
        date: req.body.date,
        status: req.body.status
    };
    let sql = "INSERT INTO users SET ?";
    let query = connection.query(sql, data, (err, results) => {
        if (err) throw err;
        res.render('success', { regNo: regNo }); // Render the success.ejs file with the registration number
    });
});

function generateRegNo() {
    return Math.floor(100000 + Math.random() * 900000);
}

app.get('/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from users where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.render('user_edit', {
            title : 'Editing the data',
            user : result[0]
        });
    });
});

app.post('/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update users SET username='"+req.body.username+"',  phone_no='"+req.body.phone_no+"',  vehicle_no='"+req.body.vehicle_no+"',  services='"+req.body.services+"',  date='"+req.body.date+"',  status='"+req.body.status+"' where id ="+userId;
    let query = connection.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/user_index');
    });
});

app.get('/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from users where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/user_index');
    });
});



app.get('/search', (req, res) => {
    res.render('search');
});

app.post('/search', (req, res) => {
    const regNo = req.body.reg_no;
    let sql = `SELECT username,phone_no,status FROM users WHERE reg_no = ${regNo}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.render('search', { message: 'No record found' });
        } else {
            const { username,phone_no,status } = result[0];
            res.render('search', { username,phone_no,status });
        }
    });
});

// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});



