const express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config({ path: "./config/.env" });

require("./config/DBConnection");
const useRouter = require("./routes/router");

const app = express();

//app uses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", useRouter);

const port = process.env.PORT || 5005;


const path = require("path");

  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("/*", (req, res) => {
    console.log("get");
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });


app.listen(port, () => console.log(`Server is running at ${port}`));
