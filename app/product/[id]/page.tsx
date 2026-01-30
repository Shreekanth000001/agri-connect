"use client"
import { useState, useEffect } from "react";
import { useFormatter } from 'next-intl';
import Link from "next/link";

export default function Home({ params }: { params: { id: string } }) {
  const format = useFormatter();
  const [proddata, setprodData] = useState([])
  const [fdata, setfData] = useState([])
  function bringData() {
    fetch(`http://localhost:3000/productListings/${params.id}`).then(res => res.json().then(data => {
      setprodData(data.prodData);
      setfData(data.fData);
    }))
  }
  function dateFormat(date: string) {
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
    <div className="grow">
      {/* <button className="hover:bg-white" onClick={buttonAct}>Send</button> */}
      <div className="p-6 ml-3.5">
        <p className="text-3xl font-semibold">{ fdata.uname}</p>
        <p className="text-2xl font-semibold">Fruits</p>
        <div className="md:grid md:grid-cols-4">
        </div>
      </div>
    </div>
  );
}
