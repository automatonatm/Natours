
const dotenv = require('dotenv');
dotenv.config({path: './.env'});


const app = require('./index');





const port = process.env.PORT ||  8002;
app.listen(port, () => {
    console.log(`App running on port ${port}`)
});