import express, { Express, Request, Response } from "express";
import app from "./app";

// const app: Express = express()
const PORT: number = 3000

// app.get('/', (req: Request, res: Response)=> {
//     res.send("Hi");
// })

app.listen(PORT, ()=> {
    console.log(`Listening on http://localhost:${PORT}`);
})

