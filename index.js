const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get('/', async(req, res)=>{
    
})


app.get('/', (req, res) => {
    res.send('I am running from server site')
})
app.listen(port, () => {
    console.log('Crud server is running');
})
