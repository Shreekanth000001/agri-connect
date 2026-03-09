"use client"
import { useState, useEffect } from "react";
import { useFormatter } from 'next-intl';
import { useSearchParams } from 'next/navigation'
import Link from "next/link";
import ImgUpload from "./imgUpload/page";

export default function Home(props: any) { 
  const format = useFormatter();
  const searchParams = useSearchParams()
  const [proddata, setprodData] = useState([])
  const [fdata, setfData] = useState([])
  async function bringData() {
    const id = searchParams.get('id')
    console.log(id)
  }
  useEffect(() => {
    bringData()
  }, [])
  return (
    <div className="grow">
      {/* <button className="hover:bg-white" onClick={buttonAct}>Send</button> */}
      <div className="p-6 ml-3.5">
        <p className="text-3xl font-semibold">{fdata}</p>
        <p className="text-2xl font-semibold">Fruits</p>
        <div className="md:grid md:grid-cols-4">
          {/* <ImgUpload></ImgUpload> */}
          
        </div>
      </div>
    </div>
  );
}
