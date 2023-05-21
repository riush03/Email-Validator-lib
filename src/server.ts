import express, {Request, Response, NextFunction} from "express";
import bodyParser from "body-parser";
import { validateEmailRoutes } from "./routes/validateEmail.route";

const PORT = 3000;
const app = express();

app.use(bodyParser.json())
app.use(validateEmailRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
