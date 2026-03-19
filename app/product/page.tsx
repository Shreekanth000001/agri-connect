import { prisma } from '@/lib//prisma';
import Link from "next/link";

export default async function Home({ searchParams }: { searchParams: Promise<{ id: string | undefined }> }) {
  const param = await searchParams;
  const id = param.id;

  const proddata = await prisma.productAuction.findUnique({ where: { ProdAucId: Number(id) } });
  if (!proddata) {
    return (<p>ntg yo</p>)
  }

  const fdata = await prisma.user.findUnique({ where: { uid: Number(proddata?.fid) } });
  if (!fdata) {
    return (<p>ntg yo</p>)
  }

  function DateEm(date: Date | undefined | null) {
    if (!date) {
      return "yo u are doomed"
    }
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date)
  }
  return (
    <div className="grow min-h-[65vh]">
      {/* <button className="hover:bg-white" onClick={buttonAct}>Send</button> */}
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers also purchased</h2>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            <div className="group relative">
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={proddata.title}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {proddata.description}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{proddata.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{proddata.startingBid}</p>
                <p className="text-sm font-medium text-gray-900">{DateEm(proddata?.startTime)}</p>
                <p className="text-sm font-medium text-gray-900">{DateEm(proddata?.endTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
