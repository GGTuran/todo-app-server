const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

const port = 5000
const { MongoClient, ServerApiVersion } = require('mongodb');



// middleware

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));


// 
// 

// mongoose schema
const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,
  },
  priority:{
    type:String,
    enum:['High', 'Medium', 'Low'],
    required:true,
  },
  isComplete:{
    type:Boolean,
    required:true,
  },
});

const Todo = mongoose.model('Todo', todoSchema);

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email: {
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  }
});

const User = mongoose.model("User" , userSchema);


const uri = "mongodb+srv://todo-admin:innpCDfYcHBqBjTL@cluster0.vddbb.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    await mongoose.connect(uri);

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // const todoCollection = client.db("todoDB").collection("todos")

    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    app.get('/todos',
    // async (req,res,next) =>{
    //   console.log('Call me Middle ware');
    //   console.log(req.headers);
    //   const token = req.headers.authorization;
    //   const privateKey = "Secret";

    //   const verifiedToken = jwt.verify(token, privateKey);
    //   console.log(verifiedToken);
    //   if(verifiedToken){
    //     next();
    //   }else{
    //     console.log('You are not invited');
    //   }

     
    // }, 
    async(req,res) =>{
        // const todo = await todoCollection.find({}).toArray();
        const todos = await Todo.find({});
        res.send(todos);
    });

    app.get('/todo/:id' , async (req, res) =>{
      const id = req.params.id;
      const todos = await Todo.findById(id);
      res.send(todos);
    });

    app.post('/todo', async(req,res) =>{
        const todoData = req.body;

        // const todo = new Todo(todoData);
        // todo.save();

        const todo = await Todo.create(todoData);

        console.log(todo);
        // const todo = await todoCollection.insertOne(todoData);
        res.send(todo);
    });


    app.patch('/todo/:id' , async(req,res) =>{
      const id = req.params.id;
      const updatedData = req.body;
      const todos = await Todo.findByIdAndUpdate(id, updatedData, {
        new:true,
      });
      res.send(todos); 
    });

    app.delete('/todo/:id', async(req,res) =>{
      const id = req.params.id;
      await Todo.findByIdAndDelete(id);
      res.send("Deleted");
    });

    app.post("/register" , async(req,res) =>{
      const userData = req.body;
      const todo = await User.create(userData);
      console.log(todo);
      res.send(todo);
    });

    app.post("/login", async(req,res) =>{
      const {email, password} = req.body;
      const user = await User.findOne({
        email,
        password,
      });

      if(user) {
     
        const payLoad = {
          name: user.name,
          email:user.email,
        };

        const privateKey = "Secret";

        const expirationTime = "1d";

        const accessToken = jwt.sign(payLoad, privateKey, {
          expiresIn: expirationTime,
        });

        const userResponse={
          message:"Logged in",
          data:{
            accessToken

          },
        };
        res.send(userResponse);
      }    else{
        
        res.send({ message : "Incorrect"})
        }

  
    } )







  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);














app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})