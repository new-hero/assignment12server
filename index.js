require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.e8si7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('Tools-service').collection('tools');
        const ordersCollection = client.db('Tools-service').collection('orders');
        const usersCollection = client.db('Tools-service').collection('users');

        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools)
        })

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.findOne(query);
            res.send(result)
        })
        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.findOne(query);
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        })
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const currentUser = { email: email }
            const wish = { upsert: true }

            const setUser = {
                $set: user,
                
            }
            const result = await usersCollection.updateOne(currentUser, setUser, wish)
            const token = jwt.sign({email:email}, process.env.DB_USER_TOKEN, {expiresIn:'30d'});
            
            res.send({result, token })
        })

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const currentUser = { email: email }
            const requester=req.headers.authorization;
            const query= {email:requester}
            const requestUser= await usersCollection.findOne(query);
            if(requestUser.role ==='admin'){
  
                const setRole = {
                    $set: {role: 'admin'},
                    
                }
                const result = await usersCollection.updateOne(currentUser, setRole)
               
                res.send(result)
            }
                    
            
        })
        
        app.get('/orders', async (req, res) => {
            const tools = ordersCollection.find().toArray();
            res.send(tools)
        })

        app.put('/purchse/:id', async (req, res) => {
            const id = req.params.id;
      
            const order = req.body;
            const query = { _id: ObjectId(id) }
            const wish = { upsert: true }

            const setOrder = {
                $set: {
                    order
                }
            }

            const result = await ordersCollection.updateOne(query, setOrder, wish)
            res.send(result)
        })
   

    }
    finally {

    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('server is ok')
})
app.listen(port, () => {
    console.log('Crud server is running');
})
