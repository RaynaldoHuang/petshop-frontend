import Image from "next/image"
import Link from "next/link"

import img10 from "@/public/image/img10.webp"
import img11 from "@/public/image/img11.webp"

export default function Catdog() {
    return (
        <>
            <div className="max-w-7xl mx-auto pb-12">
                <div className="flex justify-center items-center">
                    <h2 className="mt-2 mb-12 text-4xl font-bold text-[#19398A]">
                        New puppy or kitten?
                    </h2>
                </div>

                <div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="relative">
                            <div className="absolute w-full flex flex-col justify-center items-center top-14">
                                <h1 className="text-[#19398A] font-semibold text-2xl mb-4">
                                    Apa yang dibutuhkan anjingmu?
                                </h1>

                                <Link href={""} className="text-white font-semibold bg-[#19398A] px-4 py-3 rounded-lg">
                                    Belanja Sekarang
                                </Link>
                            </div>
                            <Image
                                src={img10}
                                alt="puppy image"
                                className="w-full rounded-lg"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute w-full flex flex-col justify-center items-center top-14">
                                <h1 className="text-white font-semibold text-2xl mb-4">
                                    Apa yang dibutuhkan kucingmu?
                                </h1>

                                <Link href={""} className="text-[#19398A] font-semibold bg-[#ffd701] px-4 py-3 rounded-lg">
                                    Belanja Sekarang
                                </Link>
                            </div>
                            <Image
                                src={img11}
                                alt="kiten image"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}