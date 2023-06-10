 const express = require('express');
 const app = express();
 const mongoose = require('mongoose')
 const cookieParser = require('cookie-parser');
 const jwt = require('jsonwebtoken');
 const bcrypt = require('bcrypt')

 mongoose.connect('mongodb://127.0.0.1:27017',{
  dbname:"loginDB"
 })
  .then(()=>{console.log('Database is now connected');})
  .catch(e=>{console.log(e);});

  const userSchema = new mongoose.Schema({
    name: String, 
    email: String,
    password: String,
  });  

 const User = mongoose.model("User",userSchema);
  
// middleware function
  const isAuthenticate = async (req,res,next)=>{
      const {token} = req.cookies;
      if(token)
      {        
          const decoded = jwt.verify(token,"abcd");
          req.user = await User.findById(decoded._id);
          next()
        }
      else 
        res.redirect('/login')
      
  }

 app.set("view engine" , "ejs");

 app.use(express.static('./public')); 
 app.use(express.urlencoded({extended:true})); 
 app.use(cookieParser());

  app.get('/',isAuthenticate,(req,res)=>{    
    res.render('logout',{name:req.user.name});
  });

  app.get('/login',(req,res)=>{
    res.render('login');
  })

  app.get('/register',(req,res)=>{
    res.render('register');
  })

  app.post('/register',async(req,res)=>{
    
    const {name,email,password} = req.body;

    let user = await User.findOne({email});

    if(user)
    {
      // console.log('User already has an account, please login!!');
      return res.redirect('/login');
    }

    const passwordHash = await bcrypt.hash(password,10);
    console.log(passwordHash);
    user = await User.create({
      name:name,
      email:email,
      password:passwordHash,
    });

    // console.log('User profile has been created!');
    res.redirect('/login');
  })

 app.post('/login',async (req,res)=>
 {

   const {name, email} = req.body;
   
   let user = await User.findOne({email});

   if(!user){
      // console.log('No account found, please create one first!');
      return res.redirect('/register');
   }
   
  const token = jwt.sign({_id:user._id} , "abcd");

    res.cookie("token",token ,{
      httpOnly:true,
      expires:new Date(Date.now()+50*1000)
    })
    res.redirect('/');
 })

 app.get('/logout',(req,res)=>{
  res.cookie('token',null,{
    expires:new Date(Date.now())
  })
  res.redirect('/')
 })

 app.listen(5000,()=>{
    console.log('Server is listening on port 5000');
 });


 