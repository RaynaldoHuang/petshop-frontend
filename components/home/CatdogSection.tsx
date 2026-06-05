import Image from "next/image"
import Link from "next/link"

import img10 from "@/public/image/img10.webp"
import img11 from "@/public/image/img11.webp"

export default function Catdog() {
    return (
        <>
            <div className="mx-auto max-w-7xl px-4 pb-10 lg:px-0 lg:pb-12">
                <div className="flex justify-center items-center">
                    <h2 className="mb-7 mt-2 text-center text-2xl font-bold text-[#19398A] lg:mb-12 lg:text-4xl">
                        New puppy or kitten?
                    </h2>
                </div>

                <div>
                    <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
                        <div className="relative overflow-hidden rounded-lg mb-12 lg:mb-0">
                            <div className="absolute left-0 right-0 top-6 z-10 flex flex-col items-center justify-center px-5 text-center lg:top-14">
                                <h1 className="mb-3 max-w-65 text-lg font-semibold leading-6 text-[#19398A] lg:mb-4 lg:max-w-none lg:text-2xl lg:leading-normal">
                                    Apa yang dibutuhkan anjingmu?
                                </h1>

                                <Link href={""} className="rounded-lg bg-[#19398A] px-4 py-2.5 text-sm font-semibold text-white lg:py-3 lg:text-base">
                                    Belanja Sekarang
                                </Link>
                            </div>
                            <Image
                                src={img10}
                                alt="puppy image"
                                className="min-h-65 w-full object-cover lg:min-h-0"
                            />
                        </div>

                        <div className="relative overflow-hidden rounded-lg">
                            <div className="absolute left-0 right-0 top-6 z-10 flex flex-col items-center justify-center px-5 text-center lg:top-14">
                                <h1 className="mb-3 max-w-65 text-lg font-semibold leading-6 text-white lg:mb-4 lg:max-w-none lg:text-2xl lg:leading-normal">
                                    Apa yang dibutuhkan kucingmu?
                                </h1>

                                <Link href={""} className="rounded-lg bg-[#ffd701] px-4 py-2.5 text-sm font-semibold text-[#19398A] lg:py-3 lg:text-base">
                                    Belanja Sekarang
                                </Link>
                            </div>
                            <Image
                                src={img11}
                                alt="kiten image"
                                className="min-h-65 w-full object-cover lg:min-h-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
