
const dotenv = require('dotenv');
dotenv.config({path: './.env'});
const app = require('./index');



//DB CONNECTION
const connectDB = require('./config/db');
connectDB();




const port = process.env.PORT ||  8002;
app.listen(port, () => {
    console.log(`App running on port ${port}`)
});