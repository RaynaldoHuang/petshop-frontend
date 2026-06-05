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
        <section className="px-4 py-10 lg:px-12 lg:py-12">
            <div className="mx-auto max-w-360 rounded-xl bg-[#DFF1FF] px-5 py-8 lg:px-0 lg:py-14">

                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-[#19398A] lg:text-3xl">
                    Paws, love & numbers
                </h2>

                {/* Stats */}
                <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-16 lg:gap-10">
                    {stats.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center rounded-lg bg-white/45 px-4 py-5 text-center md:bg-transparent md:px-0 md:py-0"
                            >
                                {/* Icon + Number */}
                                <div className="flex items-center gap-3 text-[#19398A] lg:gap-4">
                                    <Icon className="h-8 w-8 lg:h-10 lg:w-10" strokeWidth={1.8} />
                                    <span className="text-4xl font-bold lg:text-5xl">
                                        {item.value}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="mt-3 text-lg font-semibold text-[#19398A] lg:mt-4 lg:text-xl">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-1.5 max-w-[220px] text-sm leading-5 text-[#19398A]/80 lg:mt-2 lg:max-w-none lg:leading-normal">
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
