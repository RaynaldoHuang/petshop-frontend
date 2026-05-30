"use client";

import Marquee from "react-fast-marquee";
import { Truck } from "lucide-react";

export default function ShippingMarquee() {
    return (
        <section className="mt-20 bg-[#DFF1FF] py-6">
            <Marquee
                speed={60}          // kecepatan
                gradient={false}    // hilangkan blur pinggir
                pauseOnHover={true} // hover = stop
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="mx-12 flex items-center gap-6 text-[#19398A]"
                    >
                        <Truck size={28} strokeWidth={2.5} />

                        <p className="text-lg font-medium whitespace-nowrap">
                            <span className="font-extrabold">FREE SHIPPING</span> — no code
                            needed, just head for checkout!
                        </p>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}