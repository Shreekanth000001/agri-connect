import Link from "next/link";
import { buttonAct, buttonAct2 } from "./action";

export default function Home() {
  return (
    <div className="grow">
      <button className="hover:bg-white" onClick={buttonAct}>Send</button>
    </div>
  );
}
