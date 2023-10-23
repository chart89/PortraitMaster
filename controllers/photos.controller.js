const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const ip = require('ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    
    if(title && author && email && file) { // if fields are not empty...

      // create pattern
      const pattern = new RegExp(/(([A-z]|\s|\.)*)/, 'g'); //for author and title
      const emailPattern = new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}'); //for email address

      const emailMatched = email.match(emailPattern);
      const titleMatched = title.match(pattern).join('');
      const authorMatched = author.match(pattern).join('');

      if(titleMatched.length < title.length || authorMatched.length < author.length || emailMatched === null) throw new Error('Invalid characters...');

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      if(fileExt === 'gif' || fileExt === 'jpg' || fileExt === 'png'){
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file format!');
      }
    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const ipUse = ip.address();
      const ipFind = await Voter.findOne({ip: ipUse, vote: req.params.id });

      if(!ipFind) {
        const newIp = new Voter({ ip: ipUse, vote: req.params.id });
        newIp.save();
      
        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK' });
      }
    }
  } catch(err) {
    res.status(500).json(err);
  }

};

exports.ipaddress = async (req, res) => {
  try {
    const ipUse = ip.address();
    const findIp = await Voter.findOne( ipUse );
    if(!findIp) {
     const newIp = new Voter({ ip: ipUse });
     newIp.save();
     res.send({ message: 'OK' });
  } else {
    console.log('ip exist');
  }
  } catch(err) {
    res.status(500).json(err);
  }
}
