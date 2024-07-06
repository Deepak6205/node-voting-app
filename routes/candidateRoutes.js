const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('./../models/candidate');
const {jwtAuthMiddleware,generateToken} = require('../jwt');

const checkAdminRole = async (userID) =>{
  try{
    const user = await User.findById(userID);
    if(user.role === 'admin'){
      return true;
    }
    
  }catch(err){
    return false;
  }
}


router.post('/',jwtAuthMiddleware, async(req,res) =>{
  try{
    if(!(await checkAdminRole(req.user.id)))
      return res.status(403).json({message: 'user has not admin role'});

    const data = req.body // Assuming the request body contains the user signup data

  // Create a new user singnup document using the mongoose model
  const newCandidate = new Candidate(data);

  // save a new person signup to the data base
  const response = await newCandidate.save();
  console.log('data saved');
  res.status(200).json({response: response})
  
  
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server error'});
  }
})

  router.put('/:candidateID',jwtAuthMiddleware, async(req,res) => {
    try{
      if(!(await checkAdminRole(req.user.id)))
        return res.status(403).json({message: 'user has not admin role'});
  
      const candidateID = req.params.candidateID; // Extract the id from the URL parameter
      const updatedCandidateData = req.body; // updated data for candidate

      const response = await person.findByIdAndUpdate(candidateID,updatedCandidateData,{
        new:true, // Return the updated Document
        runValidators:true, // Run Mongoose validation
      })
      if(!response){
        return res.status(403).json({error:'candidate not found'});
      }
      console.log('data updated');
      res.status(200).json(response);
    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal server fatt gaya'});
    }
  })

  router.delete('/:candidateID',jwtAuthMiddleware, async(req,res) => {
    try{
      if(!(await checkAdminRole(req.user.id)))
        return res.status(403).json({message: 'user has not admin role'});
  
      const candidateID = req.params.candidateID; // Extract the id from the URL parameter

      const response = await person.findByIdAndDelete(candidateID);
      
      if(!response){
        return res.status(403).json({error:'candidate not found'});
      }
      console.log('data deleted');
      res.status(200).json(response);
    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal server fatt gaya'});
    }
  })

  // lets start voting

  router.post('/vote/:candidateID', jwtAuthMiddleware, async (req,res)=>{
    //prerequisite
    // 1. no admin can vote
    // 2. user can only vote once.

    candidateID = req.params.candidateID;
    userID = req.user.id;

    try{

      // Find the Candidate with the specified candidateID
      const candidate = await Candidate.findById(candidateID);
      if(!candidate){
        return res.status(404).json({message: 'Candidate not found'});
      }

      const user = await User.findById(userID);
      if(!user){
        return res.status(404).json({message:'user not found'});
      }
      if(user.role === 'admin'){
        res.status(403).json({message:'admin is note allowed'});
      }
      if(user.isVoted){
        res.status(400).json({message: 'you have already voted'})
      }

      // update the candidate document to record the voe
      candidate.votes.push({user: userID});
      candidate.voteCount++;
      await candidate.save();

      // update the user document
      user.isVoted = true;
      await user.save();

      res.status(200).json({message: 'votes recorded successfully'});

    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal server fatt gaya'});
    }
  })

  // vote count

  router.get('/vote/count', async (req,res)=>{
    try{
      //find all candidate and sort them by their voteCount in desc order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // map the candidate to only return their voteCount and name
      const voteRecord = candidate.map((data)=>{
        return {
          party: data.party,
          count: data.voteCount
        }
      });
      return res.status(200).json(voteRecord);
    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal server fatt gaya'});
    }
    
  });

  module.exports = router;