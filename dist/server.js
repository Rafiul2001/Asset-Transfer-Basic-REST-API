"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
// const app: Express = express()
const PORT = 3000;
// app.get('/', (req: Request, res: Response)=> {
//     res.send("Hi");
// })
app_1.default.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
