const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//credentials
//smart-deals-user
// XODwqIlipY3g1azM

// connection string
const uri = "mongodb+srv://smart-deals-user:XODwqIlipY3g1azM@ta.qolps9k.mongodb.net/?appName=TA";

//client
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try{
        //connecting  the client to the server
        await client.connect();                           
        
        //getting the database
        const db = client.db('smart_deals_db');

        //getting the table/collection
        const productsCollection = db.collection('products');
        const bidCollection = db.collection('bids');
        const userCollection = db.collection('users');

        //users APIs
            //create api
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = newUser.email;                                //taking email from req.body for query

            const query = {email: email};                               //query to check user 
            const existingUser = await userCollection.findOne(query);   //finding wheather the user already exists in the db or not

            if(existingUser){
                res.send({message: 'User already exists, no need to insert into db'});              //not inserting if user exists
            }else{
                const result = await userCollection.insertOne(newUser);                             //inserting user into db if user already doesn't exist
                res.send(result);
            }

        })

        //Products APIs with data from database------------
            //create api
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

            //read api
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if(email){
                query.email = email;
            }
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

            //single data read api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

            //update api
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;                           //getting product id from route
            const query = { _id: new ObjectId(id) };            //making query which product will be updated
            const updatedProduct = req.body;                    //getting latest data from frontend
            const update = {                                    //making data $set object to pass in function
                // $set: updatedProduct;
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price
                }
            }
            
            const result = await productsCollection.updateOne( query, update );         //updating command
            res.send(result);                                                           //sending response
        })

            //delete api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        //bid related apis-----------
            //bid read api
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if(email){
                query.bidder_email = email;
            }
            const cursor = bidCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

            //bid create api
        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            const result = await bidCollection.insertOne(newBid);
            res.send(result);
        })

            //bid delete api
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id};
            const result = await bidCollection.deleteOne(query);
            res.send(result);
        })


        //sending ping to  confirm a successful connection
        await client.db("admin").command({ ping: 1 });      
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally{

    }
}
run().catch( console.dir );

//APIs
app.get('/', (req, res) => {
    res.send('Smart deals server is up and runnig')
})

app.listen(port, () => {
    console.log(`Smart deals server is running on port: ${port}`)
})
