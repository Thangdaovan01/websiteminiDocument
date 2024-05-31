const express = require('express');
const path = require('path');
const webRouter = require('./routes/webRouter');
const apiRouter = require('./routes/apiRouter');
// const route = require('./routes');

const bodyParser = require('body-parser'); 
const methodOverride = require('method-override');
const app = express();
const db = require('./db');

const port = 3000;

//COnnect DB
db.connect(); 

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set("views", "./view");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/api/document', express.static('uploads/documents'));
app.use(methodOverride('_method'));

app.use('/', webRouter);
app.use('/api', apiRouter);
// route(app);


app.listen(port, async  () => {
    console.log(`Example app listening on port http://localhost:${port}`);
})