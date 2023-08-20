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



if (process.env.NODE_ENV == "production") {

  const path = require("path");

  console.log(path.join(__dirname, "client", "build/static"))

  app.use(
    "/static",
    express.static(path.join(__dirname, "client", "build/static"))
  );

  app.use(
    "/manifest.json",
    express.static(path.join(__dirname, "client", "build", "manifest.json"))
  );

  app.use(
    "/favicon.ico",
    express.static(path.join(__dirname, "client", "build", "favicon.ico"))
  );

  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}



app.listen(port, () => console.log(`Server is running at ${port}`));
