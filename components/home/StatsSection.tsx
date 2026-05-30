import { PawPrint, Package, BadgeCheck } from "lucide-react";

const stats = [
    {
        icon: PawPrint,
        value: "10K",
        title: "Happy pets",
        desc: "Loved and cared for every day",
    },
    {
        icon: Package,
        value: "289",
        title: "Premium products",
        desc: "Only trusted brands for your furry friends",
    },
    {
        icon: BadgeCheck,
        value: "7Y",
        title: "Years of love",
        desc: "Making pets happier since day one",
    },
];

export default function StatsSection() {
    return (
        <section className="py-12 px-12">
            <div className="mx-auto max-w-360 rounded-xl bg-[#DFF1FF] py-14">

                {/* Title */}
                <h2 className="text-center text-3xl font-bold text-[#19398A]">
                    Paws, love & numbers
                </h2>

                {/* Stats */}
                <div className="mt-16 grid gap-10 md:grid-cols-3">
                    {stats.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Icon + Number */}
                                <div className="flex items-center gap-4 text-[#19398A]">
                                    <Icon size={40} strokeWidth={1.8} />
                                    <span className="text-5xl font-bold">
                                        {item.value}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="mt-4 text-xl font-semibold text-[#19398A]">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-2 text-sm text-[#19398A]/80">
                                    {item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}