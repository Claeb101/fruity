import { db } from '@/lib/db/db';
import { NextApiRequest, NextApiResponse } from 'next';

// where winner is r1
const elo = (r1, r2) => {
  const expect = (a, b) => {
    return 1/(1+Math.pow(10., (b-a)/400.))
  }
  const k = 32
  return {r1: r1+k*(1-expect(r1, r2)), r2: r2+k*(0-expect(r2, r1))}
}

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
    } else if (req.method == 'PUT') {
      let f1 = await db.fruit.findUnique({where: {name: req.body.winner}})
      let f2 = await db.fruit.findUnique({where: {name: req.body.loser}})
      const {r1, r2} = elo(f1.rating, f2.rating)
      f1 = await db.fruit.update({where: {id: f1.id}, data: {rating: r1}})
      f2 = await db.fruit.update({where: {id: f2.id}, data: {rating: r2}})
      return res.status(200).json({ f1, f2 })
    } else if(req.method == "POST") {
      const fruit = await db.fruit.create({
        data: {
          name: req.body.name,
          pic: req.body.pic
        }
      })
      return res.status(200).json({fruit})    
    }
  } catch (e) {
    return res.status(400).json({
      message: e.message
    })
  }

  return res.status(400).send(null)
}

export default handler;