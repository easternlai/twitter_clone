const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const path = require('path');
const socketio = require('socket.io');
const jwt = require('jwt-simple');
const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 9000;

if(process.env.NODE_ENV !== 'production') {
    // const morgan = require('morgan');
    // app.use(morgan('dev'));
    require('dotenv').config();
}

app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(cors());
app.use(bodyParser.json());
app.set('trust proxy', 1);
app.use('/api', apiRouter);

if(process.env.NODE_ENV === 'production'){
    app.use(compression());
    app.use(express.static(path.join(_dirname, 'client/build')));

    app.get('*', function(req,res) {
        res.sendFiled(path.join(__dirname, 'client/build', 'index.html'));
    });
}

(async function(){
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log("Conntected to database");
    }catch{
        throw new Error(err);
    }
})();

app.use((err,req,res,next)=> {
    if(!err.statusCode) {
        err.statusCode = 500;
    }
    if(err.name === "MulterError"){
        if(err.message === 'File too large'){
            return res.status(400).send({ error: 'Your file exceeds the limit of 10MB.'})
        }
    }
    res.status(err.statusCode).send({
        error:
            err.statusCode >= 500
            ? 'An unexpected error ocurred, please try again later.'
            : err.message,
    });
});

const expressServer = app.listen(PORT, () =>{
    console.log(`Backend listening on port ${PORT}`);
})

/* SOCKET.IO CODE */