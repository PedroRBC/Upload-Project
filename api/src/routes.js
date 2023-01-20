const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

const { getFiles, addFile, deleteFile } = require("./database/Post");

routes.get("/", async (req, res) => {
//  if(req.headers.key != process.env.KEY) return res.status(400).json({msg: "Invalid Key"}) 
  const posts = await getFiles();
  return res.status(200).json(posts);
});

routes.post("/app", async(req,res)=>{
  console.log(req.body)
  console.log(req.file)
  res.status(200).send()
})

routes.post("/", multer(multerConfig).single("file"), async (req, res) => {
//  if(req.headers.key != process.env.KEY) return res.status(400).json({msg: "Invalid Key"}) 
  const { originalname: name, size, key} = req.file;
  const data = await addFile({
    name,
    size,
    key
  }, res);
  req.io.emit('newfile',data);
  return res.status(200).json(data);
});

routes.delete("/:id", async (req, res) => {
  await deleteFile(req.params.id)
  res.status(200).send();
  await req.io.emit('deletefile',await getFiles());
});



module.exports = routes;
