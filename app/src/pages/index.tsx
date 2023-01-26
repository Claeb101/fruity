import type { NextPage } from "next";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import React from "react";
import { Spinner } from "@/components/Spinner";
import { Layout } from "@/components/layout";
import { read } from "fs";
import Background from "@/components/Background"
import Canvas from "@/components/Canvas";
import { Footer } from "@/components/footer";
import {
  Chart as ChartJS,
  CategoryScale,
  ScatterController,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type {ChartData, ChartOptions, Point} from 'chart.js'
import { Scatter, Chart } from 'react-chartjs-2';

const Choice = ({ fruit, onClick = () => null, reactive = true }) => {
  return (
    <div className={`relative bg-slate-lightest bg-opacity-20 w-64 h-64 m-4 sm:m-4 rounded-sm flex flex-col ${reactive ? "hover:bg-opacity-30 hover:-translate-y-4" : ""} transition-all p-4`} onClick={onClick}>
      {fruit ?
        <>
          <p className="text-white text-lg text-center">{fruit.name} ({Math.round(fruit.rating)})</p>
          <div className="flex-1 bg-contain bg-no-repeat bg-center" style={{backgroundImage: `url("${fruit.pic}")`}}/>
        </>
        :
        <></>
      }

    </div>
  );
}

const Voter = () => {
  const [fruits, setFruits] = useState({ fruit1: null, fruit2: null })
  const [ready, setReady] = useState<{ status: boolean, time: Date }>({ status: false, time: null })

  const choose = async (ind) => {
    if(!ready.status) return;

    setReady({ status: false, time: new Date() })
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
      setReady({ status: true, time: d })
    }, Math.max(mt - diff, 0))
  }

  const match = async () => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET'
    }
    const data = await (await fetch('/api/fruit/match', options)).json()
    setFruits({ fruit1: data.fruit1, fruit2: data.fruit2 })
  }

  useEffect(() => {
    match()
    setReady({ status: true, time: new Date() })
  }, [])

  return (
    <>
      <Spinner className="absolute w-16 h-16" show={!ready.status} cycle={2} />
      <div className={`mt-4 flex flex-col sm:flex-row ${ready.status ? 'opacity-100' : 'opacity-5'} transition-all`}>
        <Choice fruit={fruits.fruit1} onClick={() => choose(0)} reactive={ready.status} />
        <Choice fruit={fruits.fruit2} onClick={() => choose(1)} reactive={ready.status} />
      </div>
    </>

  );
}

const InteractiveCanvas = ({pos=[null, null]}) => {
  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(400, 400, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
    ctx.fill()
  }

  const confetti = (pos) => {
    
  }

  useEffect(() => {
    if(pos[0] && pos[1]) confetti(pos)
  }, [pos])
  
  return (
    <Canvas draw={draw} className="w-full h-full absolute top-0 left-0 pointer-events-none"/>
  );
}

ChartJS.register(LinearScale, CategoryScale, ScatterController, PointElement, LineElement, Tooltip, Legend);
ChartJS.defaults.font.family = 'Inter'

const rndrng = (l, r) => {
  return Math.random()*(r-l)+l
}

const Graph = () => {
  const [fruits, setFruits] = useState(null)
  useEffect(() => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET'
    }
    fetch('/api/fruit', options).then(res => res.json()).then(d => setFruits(d.fruits))
  }, [])

  const data = fruits ? {
    datasets: [
      {
        label: fruits.map(f => f.name),
        data: fruits.map(f => {return {x: f.price, y: f.rating}}),
        backgroundColor: (() => {
          const hslToRgb = (h, s, l, a) => {
            var r, g, b;
        
            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                var hue2rgb = function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }
        
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
        
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
        }
        const rgbToStr = (rgb) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`
        const gen = () => rgbToStr(hslToRgb(rndrng(200, 300)/360, 0.99, rndrng(0.4, 0.5), 1.0))
        return fruits.map(f => gen())
        })(),
      }
    ]
  } : null;

  const gridColor = 'rgba(255, 255, 255, 0.2)'
  const labelColor = 'white'
  const options:ChartOptions = {
    scales: {
      y: {
        ticks: {
          callback: (val, indx, vals) => val,
          color: labelColor
        },
        grid: {
          color: gridColor
        },
        title: {
          display: true,
          text: "Rating",
          color: labelColor,
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {bottom: 12}
        }
      },
      x: {
        ticks: {
          callback: (val, indx, vals) => `$${val}`,
          color: labelColor
        },
        grid: {
          color: gridColor
        },
        title: {
          display: true,
          text: "Average U.S. Retail Price Per Pound",
          color: labelColor,
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {top: 12}
        },
      }
    },
    elements: {
      point: {
        radius: 6,
        borderWidth: 2,
        borderColor: "white"
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "TEST",
        color: labelColor,
        font: {
          size: 40,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pt = ctx.dataset.data[ctx.dataIndex] as Point;
            return [ctx.dataset.label[ctx.dataIndex],  "Price: " + pt.x, "Rating: " + pt.y]
            // return ctx.dataset.labels[ctx.dataIndex] + " (" + ctx.parsed.x + ", " + ctx.parsed.y + ")"
          }
        },
      },
      
    }
  }

  return (
    <div className="bg-slate-lightest bg-opacity-5 p-4">
      <h2 className="text-white text-xl text-center mt-4 font-bold">Rating v Cost of Fruits!</h2>
      {
        fruits ? 
          <div className="relative w-[calc(100vw-4rem)] md:w-[calc(90vw-4rem)] xl:w-[calc(75vw-4rem)] aspect-[1/1] md:aspect-[16/9] flex justify-center ">
            <Chart type="scatter" options={options} data={data}/>
          </div>
        : null
      }
      <p className="text-white text-xs text-center">*Data primarily collected from USDA. Retail price estimates for foreign fruits may be innacurate.</p>
    </div>
  );
}

const Home: NextPage<any> = ({ officers }) => {
  return (
    <Layout>
      <div className='relative w-full m-0 h-screen'>
        <Background className='opacity-30' />
        <main className='relative w-full min-h-screen bg-transparent'>
          <div className="h-screen flex flex-col justify-center items-center">
            <h1 className="text-white text-3xl font-bold animate-bounce">Fruity!</h1>
            <Voter />
          </div>
          <div className="h-screen flex flex-col justify-center items-center">
            <Graph/>
          </div>
          <Footer/>
        </main>
        {/* <InteractiveCanvas /> */}
      </div>

    </Layout>
  );
};


export default Home;
