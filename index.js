require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Mongoose
mongoose.connect("mongodb://localhost:27017/ameritec",
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, function (err) {
        if (err) {
            console.log("connect fail : " + err);
        } else {
            console.log("DB connected!!!");
        }
    });

/*
    FOR DATA
*/

const dataRouter = require("./routes/data.route");
app.use("/data", dataRouter);

// Config Server Port
app.listen(PORT, function () {
    console.log(`Server started on ${PORT}!!!`);
});