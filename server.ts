// server.ts
import express, { Request, Response } from 'express';
import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';

loadEnv();

const {
  RPC_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
  PORT = '3000'
} = process.env;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error('⚠️  Faltan variables en .env (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS)');
  process.exit(1);
}

// ABI mínimo con las dos funciones
const abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function safeMint(address to) returns (uint256)'
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const app = express();
app.use(express.json());

//   Cliente: GET /balanceOf?owner=0xabc...
app.get('/balanceOf', async (req: Request, res: Response) => {
  //const owner = req.query.owner as string;
  const { owner } = req.body;
  if (!owner || !ethers.isAddress(owner)) {
    return res.status(400).json({ error: 'Parametro "owner" inválido o faltante' });
  }
  try {
    const bal = await contract.balanceOf(owner);
    res.json({ owner, balance: bal.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error leyendo balanceOf' });
  }
});

// POST /mint { "address": "0x..." } → devuelve { txHash: string }
app.post('/mint', async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Dirección inválida' });
  }
  try {
    const tx = await contract.safeMint(address);
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error ejecutando mintTo' });
  }
});

app.listen(Number(PORT), () => {
  console.log(`🚀 API escuchando en puerto ${PORT}`);
});

