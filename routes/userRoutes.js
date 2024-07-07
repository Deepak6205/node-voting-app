const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');


router.post('/signup', async(req,res) =>{
  try{
    const data = req.body // Assuming the request body contains the user signup data


    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
        return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
        return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingUser) {
        return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
    }
    

  // Create a new user singnup document using the mongoose model
  const newUser = new  User(data);

  // save a new person signup to the data base
  const response = await newUser.save();
  console.log('data saved');
  
  const payload = {
    id: response.id
  }
  console.log(JSON.stringify(payload));
  const token = generateToken(payload); 
  res.status(200).json({response:response, token:token})
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server error'});
  }
})

// Login Route
router.post('/login',async(req,res) =>{
  try{
    //Extract username and password from request body
    const {aadharCardNumber,password} = req.body;

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
    }

    // find the user by userName
    const user = await person.findOne({aadharCardNumber: username});

    // If user does not exist or password does not match. return error
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error: 'Invalid aadharcard number or password'});
    }

    // generate token
    const payload = {
      id: user.id,
      
    }
    const token = generateToken(payload);

    // return token as response
    res.json({token});

  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Internal Server Error !!!'});
  }
});

//profile rourte
router.get('/profile',jwtAuthMiddleware,async (req,res) => {
  try{
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Internal Server Error !!!'});
  }
})



  router.put('/profile/password', async(req,res) => {
    try{
      const userId = req.user; // Extract the id from the URL parameter
      const {currentPassword, newPassword} = req.body; // Extract the current and new password from request body.
     
      // Check if currentPassword and newPassword are present in the request body
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
      }

      // Find the user by user id.
      const user = await User.findById(userId);

      //if password does not match, return error
      if(!user || !(await user.comparePassword(currentPassword))){
        return res.status(401).json({error: 'Invalid username or password'})
      }

      // update the user's password

      user.password = newPassword;
      await user.save();

      console.log('password updated');
      res.status(200).json({message: 'password updated'});
    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal server fatt gaya'});
    }
  })


  module.exports = router;
  