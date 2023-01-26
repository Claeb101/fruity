import { db } from '@/lib/db/db';
import { NextApiRequest, NextApiResponse } from 'next';

const rndrng = (l, r) => {
  l = Math.ceil(l)
  r = Math.floor(r)
  return Math.floor(Math.random()*(r-l)+l);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if(req.method == 'GET'){
      const fruits = await db.fruit.findMany({});
      const i = rndrng(0, fruits.length)
      let j = -1
      while(j < 0 || j == i) j = rndrng(0, fruits.length)

      return res.status(200).json({fruit1: fruits[i], fruit2: fruits[j]})
    } 
  } catch (e) {
    return res.status(400).json({
      message: e.message
    })
  }

  return res.status(400).send(null)
}

export default handler;