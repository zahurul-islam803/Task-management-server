const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "https://taskunity-4fc42.web.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const usersCollection = client.db("TaskUnity").collection("users");
    const tasksCollection = client.db("TaskUnity").collection("tasks");

    // Save or modify user email, status in Database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        query,
        {
          $set: user,
        },
        options
      );
      res.send(result);
    });

    app.post("/task", async (req, res) => {
      const item = req.body;
      const result = await tasksCollection.insertOne(item);
      res.send(result);
    });

    // get task data by email
    app.get("/task/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tasksCollection.find({ email }).toArray();
      res.send(result);
    });

    // delete method
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from TaskUnity Server..");
});

app.listen(port, () => {
  console.log(`TaskUnity is running on port ${port}`);
});

