import app from "./app.js";
import { PORT } from "./config/index.js";


app.listen(PORT, ()=> console.log("server is running on localhost:",PORT))