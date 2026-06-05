"use client";

import Marquee from "react-fast-marquee";
import { Truck } from "lucide-react";

export default function ShippingMarquee() {
    return (
        <section className="mt-10 bg-[#DFF1FF] py-4 md:mt-20 md:py-6">
            <Marquee
                speed={60}          // kecepatan
                gradient={false}    // hilangkan blur pinggir
                pauseOnHover={true} // hover = stop
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="mx-5 flex items-center gap-3 text-[#19398A] md:mx-12 md:gap-6"
                    >
                        <Truck className="h-5 w-5 shrink-0 md:h-7 md:w-7" strokeWidth={2.5} />

                        <p className="whitespace-nowrap text-sm font-medium md:text-lg">
                            <span className="font-extrabold">FREE SHIPPING</span> — no code
                            needed, just head for checkout!
                        </p>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}
