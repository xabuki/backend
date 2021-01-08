'user strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar las rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_routes = require('./routes/message');

//Middlewares -->un metodo que se ejecuta antes de que llegue a un controlasdor
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());//cuando reciva la informacion convertir en objeto json

//cors
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


//rutas
app.use('/api',user_routes);
app.use('/api',follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

//exportar
module.exports = app; //exportamos el app