import express from "express";
import dotenv from "dotenv";
import courseRoute from "./routes/CourseRoutes.js";
import userRoute from "./routes/userRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import otherRoutes from "./routes/otherRoutes.js";
import ErrorMiddleWare from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({
  path: "./config/config.env",
});
const app = express();

// using middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://techza.vercel.app',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});



app.use("/api/v1", courseRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", otherRoutes);

app.use(ErrorMiddleWare);

export default app;

app.get("/", (req, res) => {
  res.send(
    `<h1>Server is running . Click <a href=${process.env.FRONTEND_URL}>techza</a> to visit frontend</h1>`
  );
});
