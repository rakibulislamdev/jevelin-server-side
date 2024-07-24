const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const port = 5000;

app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://jevelin:4S1nXICLGhPOm9f3@jevelin.qxbcioy.mongodb.net/?retryWrites=true&w=majority&appName=jevelin";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productsCollections = client
      .db("jevelin")
      .collection("allcollections");
    const cartCollections = client.db("jevelin").collection("cartCollections");

    app.get("/api/v1/products", async (req, res) => {
      const result = await productsCollections.find().toArray();
      res.send(result);
    });

    app.put("/api/v1/cart/:id", async (req, res) => {
      const id = req.params.id;
      const filter = new ObjectId(id);
      const cartData = req.body;
      const { quantity } = cartData;
      const existingProducts = await cartCollections.findOne({ _id: filter });
      if (existingProducts) {
        const result = await cartCollections.updateOne(
          { _id: filter },
          { $inc: { quantity: parseInt(quantity) } }
        );
        res.status(200).send({message: "Updated Quantity"});
      } else {
        cartData._id = filter;
        const result = await cartCollections.insertOne(cartData);
        res.status(200).send({message: "New Product Added"});
      }
    });

    app.get('/api/v1/cart', async (req, res) => {
      const result = await cartCollections.find().toArray()
      res.send(result);
    })

    app.delete('/api/v1/cart/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id)}
      const result = await cartCollections.deleteOne(query)
      res.status(200).send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`jevelin server is listening on port ${port}`);
});
