import type { NextPage } from "next";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import React from "react";
import { Spinner } from "@/components/Spinner";
import {Layout} from "@/components/layout";
import { read } from "fs";

const Choice = ({ fruit, onClick=()=>null, reactive=true }) => {
  return (
    <div className={`bg-slate-lightest bg-opacity-20 w-48 aspect-square m-4 rounded-sm ${reactive ? "hover:bg-opacity-30 hover:-translate-y-4" : ""} transition-all p-4`} onClick={onClick}>
      {fruit ?
        <>
          <p className="text-white text-lg text-center">{fruit.name} ({Math.round(fruit.rating)})</p>
          <div className="">
            <img alt="Picture" src={fruit.pic} className="w-full h-full object-cover"/>
          </div>
        </>
        :
        <></>
      }

    </div>
  );
}

const Voter = () => {
  const [fruits, setFruits] = useState({ fruit1: null, fruit2: null })
  const [ready, setReady] = useState<{status: boolean, time: Date}>({status: false, time: null})

  const choose = async (ind) => {
    setReady({status: false, time: new Date()})
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({
        winner: ind == 0 ? fruits.fruit1.name : fruits.fruit2.name,
        loser: ind == 0 ? fruits.fruit2.name : fruits.fruit1.name
      })
    }
    await Promise.all([fetch('/api/fruit', options), match()])
    
    const d = new Date()
    const mt = 2000.
    const diff = ready.time ? (d.getTime() - ready.time.getTime()) : mt;
    const timer = setTimeout(() => {
      setReady({status: true, time: d})
    }, Math.max(mt-diff, 0))
  }

  const match = async () => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET'
    }
    const data = await (await fetch('/api/fruit', options)).json()
    setFruits({ fruit1: data.fruit1, fruit2: data.fruit2 })
  }

  useEffect(() => {
    match()
    setReady({status: true, time: new Date()})
  }, [])

  return (
    <>
      <Spinner className="absolute w-16 h-16" show={!ready.status} cycle={2} />
      <div className={`mt-4 flex flex-col sm:flex-row ${ready.status ? 'opacity-100' : 'opacity-5'} transition-all`}>
        <Choice fruit={fruits.fruit1} onClick={() => choose(0)} reactive={ready.status}/>
        <Choice fruit={fruits.fruit2} onClick={() => choose(1)} reactive={ready.status}/>
      </div>
    </>

  );
}

const Home: NextPage<any> = ({ officers }) => {
  return (
    <Layout>
      <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-white text-3xl font-bold">Fruity 🍇</h1>
        <Voter />
      </div>
    </Layout>
  );
};


export default Home;
