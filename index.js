const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');



const blinkLink = 'https://blynk.cloud/external/api/get?token=Yorqy8VNfD948Uoft06ZzO7YXUPbR5dd&v4'
const threshold = 435 // is for good posture;
const sensorCheck = 1000 //Blynk
const minutes = 1 //Minutes
const dataSend = 60 * 1000 * minutes; //Spreadshset

app.get('/', (req, res) => {
    res.send("Hello My Project Name");
})

const good = "good_posture (per 3 min)";
const bad = "bad_posture (per 3 min)"



const ara = [0, 0]

const getDataFromBlynk = async () => {
    try {
        const res = await axios.get(blinkLink);
        console.log(res.data);
        if (res.data > threshold) {
            ara[0]++;
        } else {
            ara[1]++;
        }
    } catch (error) {
        console.log('Error is: ' + error);
    }

}

const sendDataToSpreadSheet = async () => {
    try {
        const a = ara[0];
        const b = ara[1];
        const res = await axios.post(process.env.sheet_link, {
            data: {
                [good]: a,
                [bad]: b,
            }
        });
        const message = `Good Postures: ${a} sec\nBad Postures: ${b} sec`;
        const result = await axios.post(`https://api.telegram.org/bot${process.env.bot_token}/sendMessage?chat_id=${process.env.bot_user}&text=${encodeURI(message)}`);
        ara[0] = 0;
        ara[1] = 0;
    } catch (error) {
        console.log(error);
    }
}

setInterval(getDataFromBlynk, sensorCheck);
setInterval(sendDataToSpreadSheet, dataSend);


app.listen(process.env.port, () => {
    console.log(`Listening on port ${process.env.port}`);
})