const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const app = express();

//Middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9eaxpuz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const allCategoriesCollection = client.db('reselling-cars').collection('allCategories');
        const allProductsCollection = client.db('reselling-cars').collection('allProducts');
        const ordersCollection = client.db('reselling-cars').collection('myOrders');
        const usersCollection = client.db('reselling-cars').collection('users');

        app.get('/allCategories', async (req, res) => {
            const query = {};
            const options = await allCategoriesCollection.find(query).toArray();
            res.send(options);
        });

        app.get('/brands', async (req, res) => {
            const query = {};
            const result = await allCategoriesCollection.find(query).project({ Category_id: 1 }).toArray();
            res.send(result);
        })

        app.get('/allProducts', async (req, res) => {
            const query = {};
            const options = await allProductsCollection.find(query).toArray();
            res.send(options);
        });
        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: parseInt(id) };
            console.log(query);
            const options = await allProductsCollection.find(query).toArray();
            console.log(options);
            res.send(options);
        });
        app.get('/allProducts/:email', async (req, res) => {
            const email = req.params?.email;
            console.log("pr er email", email);
            // const query = { _id: ObjectId(id) };
            const query = { email: email };
            const service = await allProductsCollection.find(query).toArray();
            res.send(service);


        });



        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });
        app.post('/myOrders', async (req, res) => {
            const orders = req.body;
            // console.log(orders);
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });
        app.post('/allProducts', async (req, res) => {
            const product = req.body;
            const result = await allProductsCollection.insertOne(product);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
                return res.send({ accessToken: token });

            }
            res.status(403).send({ accessToken: '' })
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })


        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.type === 'admin' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.type === 'Seller' });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.type === 'Buyer' });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);

        });
        app.get('/allProducts/:category_id', async (req, res) => {
            const id = req.params.category_id;
            const query = { category_id: parseInt(id) }
            const options2 = await allProductsCollection.find(query);
            res.send(options2);
        });

    }
    finally {

    }
}

run().catch(er => console.log(er))


app.get('/', async (req, res) => {
    res.send("Reselling Cars running");
})

app.listen(port, () => console.log(`Reselling Cars running on ${port}`))