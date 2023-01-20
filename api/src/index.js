require("dotenv").config();

const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {origin: true}
});
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const { getFiles, addFile, deleteFile } = require("./database/Post");

require("./database/Post");

app.use(cors({origin: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..","..","..", ".tmp", "uploads"))
);

app.use((req,res,next)=>{
  req.io = io;
  next();
});

app.use(require("./routes"));

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('disconnect', () => {
    socket.disconnect()
    console.log('🔥: A user disconnected');
  });
});


io.on('newfile', (file)=>{
  console.log(file)
})

http.listen(process.env.PORT);
