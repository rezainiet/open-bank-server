const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;


require('dotenv').config();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z1ymwba.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();

        const userCollection = client.db('userCollection').collection('users');
        const balanceCollection = client.db('balanceCollection').collection('addBalance');
        const transactionCollection = client.db('balanceCollection').collection('transaction');
        const sendMoneyCollection = client.db('balanceCollection').collection('sendMoney');

        app.get('/user', async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });
        app.post('/addUser', async (req, res) => {
            const data = req.body;
            const result = await userCollection.insertOne(data);
            res.send(result);
        });
        app.get('/getUser/:email', async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.findOne({ email: email });
            res.send(result);
        });

        app.put('/addMoney/:email', async (req, res) => {
            const email = req.params.email;
            const amount = req.body;
            const filter = { email: email };
            const user = await userCollection.findOne(filter);
            const newAmount = await user.balance + amount.amount;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newAmount,
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.post('/addTransaction', async (req, res) => {
            const data = req.body;
            const result = await transactionCollection.insertOne(data);
            res.send(result);
        });
        app.get('/getTransactionByEmail/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await transactionCollection.find(filter).toArray();
            res.send(result.reverse());
        });
        app.put('/cutBalance/:email', async (req, res) => {
            const email = req.params.email;
            const amount = req.body;
            const filter = { email: email };
            const user = await userCollection.findOne(filter);
            const newAmount = await user.balance - amount.amount;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newAmount,
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        app.post('/confirmRecieve', async (req, res) => {
            const data = req.body;
            const result = await sendMoneyCollection.insertOne(data);
            res.send(result);
        });
        app.put('/updatePayeeBalance/:payee', async (req, res) => {
            const payee = req.params.payee;
            const amount = req.body;
            const filter = { email: payee };
            const getPayee = await userCollection.findOne(filter);
            const userBalance = await getPayee.balance;
            const newBalance = await userBalance + amount.amount;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newBalance,
                }
            };
            const result1 = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result1);
        });
        app.put('/updateRecievedBalance/:payee', async (req, res) => {
            const payee = req.params.payee;
            const amount = req.body;
            const filter = { email: payee };
            const getPayee = await userCollection.findOne(filter);
            const userBalance = await getPayee.rBalance;
            const newBalance = await userBalance + amount.amount;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    rBalance: newBalance,
                }
            };
            const result1 = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result1);
        });

    }


    finally {
        // 
    }
}

run().catch(console.dir())




app.get('/', (req, res) => {
    res.send('app is running...');
});
app.listen(port, () => {
    console.log('Server running')
})