import express from 'express';
import authRoutes from './routes/auth.js';
import { connectKafka } from './producer.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

// app.get("/test",(req,res)=>{
//     res.send("server ok");
// });

// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   next();
// });

connectKafka();

app.use('/api/auth', authRoutes)

export default app;