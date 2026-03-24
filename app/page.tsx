"use client"
import { useState, useEffect } from "react";
import { useFormatter } from 'next-intl';
import Link from "next/link";
// import { buttonAct, buttonAct2 } from "./action";

export default function Home() {
  const format = useFormatter();
  const [data, setData] = useState([])
  function bringData() {
    fetch('http://localhost:3000/productsroute').then(res => res.json().then(data => setData(data)))
  }
  function dateFormat(date:string) {
    const dateTime = new Date(date);
    const newdate = format.dateTime(dateTime, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    return newdate;
  }
  useEffect(() => {
    bringData()
  }, [])
  return (
    <div className="grow min-h-[80vh]">
      {/* <button className="hover:bg-white" onClick={buttonAct}>Send</button> */}
      <div className="p-6 ml-3.5">
        <p className="text-3xl font-semibold">Categories</p>
        <p className="text-2xl font-semibold">Fruits</p>
        <div className="md:grid md:grid-cols-4">
          {
            data.map(
              (item: any) =>
                <div key={item.ProdAucId} className="border-[#009C25] border rounded-t-lg w-56.25 overflow-hidden">
                  <img className="w-56 h-38.5" src="https://cdn.britannica.com/22/187222-050-07B17FB6/apples-on-a-tree-branch.jpg" />
                  <div className="p-1" >
                    <p className="font-light text-xl">{item.title}</p>

                    <p className="font-medium text-xl">₹{item.startingBid}/kg</p>
                    <p className="">From: {dateFormat(item.startTime)} - </p>
                    <p className="">{dateFormat(item.endTime)}</p> 
                    <div className="w-full">
                      <Link href={`/product?id=${item.ProdAucId}`}><button className="bg-[#009C25] text-white font-semibold w-24 h-7 rounded-xl flex items-center justify-center ml-auto" >
                        <svg name="View Eye" className="w-7 h-7 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" strokeWidth="1.464"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="3.5" stroke="#ffffff"></circle> <path d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z" stroke="#ffffff"></path> </g></svg> <p className="mr-2">View</p></button></Link>
                    </div>
                  </div>
                </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
