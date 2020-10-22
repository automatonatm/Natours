const app = require('./index');


const port = 8001;
app.listen(port, () => {
    console.log(`App running on port ${port}`)
});