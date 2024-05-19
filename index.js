require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.SMART_USER}:${process.env.SMART_PASS}@cluster0.dtcwl7u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const db = client.db("toolsService");
    const toolsCollection = db.collection("tools");
    const ordersCollection = db.collection("orders");
    const usersCollection = db.collection("users");

    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.updateOne(query, {
        $set: {
          quantity: doc.quantity,
        },
      });
      res.send(result);
    });

    app.post("/tools", async (req, res) => {
      const tool = req.body;
      const result = await toolsCollection.insertOne(tool);
      res.send(result);
    });
    app.get("/tools", async (req, res) => {
      const query = {};
      const tools = await toolsCollection.find(query).toArray();
      res.send(tools);
    });

    app.put("/orders", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = req.body;
      const wish = { upsert: true };
      const setOrder = {
        $set: {
          ...order,
        },
      };
      const result = await ordersCollection.updateOne(query, setOrder, wish);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const query = {};
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const currentUser = { email: email };
      const wish = { upsert: true };

      const setUser = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        currentUser,
        setUser,
        wish
      );
      const token = jwt.sign({ email: email }, process.env.DB_USER_TOKEN, {
        expiresIn: "30d",
      });
      res.send({ result, token });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = user.email;
      const exist = await usersCollection.findOne({ email: query });
      if (exist) {
        return;
      }
      const result = await usersCollection.insertOne({
        email: user.email,
        role: "user",
      });
      res.send(user);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const user = await usersCollection.findOne({ email });
      res.send(user);
    });

    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const currentUser = { email: email };
      const requester = req.headers.authorization;
      const query = { email: requester };
      const requestUser = await usersCollection.findOne(query);
      if (requestUser.role === "admin") {
        const setRole = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(currentUser, setRole);

        res.send(result);
      }
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is ok");
});
app.listen(port, () => {
  console.log("Crud server is running");
});
