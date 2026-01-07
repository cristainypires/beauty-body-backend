import express from "express";
import cors from "cors";
import dotenv from "dotenv";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Back End de Maddie Beauty Boutique está ON 🚀" });
});



const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});