import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";
import { BadgeDollarSign, CirclePercent, Package } from "lucide-react";

export default function FooterSection() {
    return (
        <footer className="bg-[#F6F7FA]">
            <div className="mx-auto max-w-7xl px-4 pb-4 pt-8 lg:px-0 lg:pt-16">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr] lg:gap-10">
                    <div className="rounded-2xl bg-white/70 p-5 text-center md:text-left lg:max-w-md lg:bg-transparent lg:p-0 lg:shadow-none">
                        <Link href="/" className="inline-flex justify-center md:justify-start">
                            <Image
                                alt="Lucky Petshop"
                                src={logo}
                                className="w-40 lg:w-52"
                                priority
                            />
                        </Link>

                        <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#19398A]/80 md:mx-0 lg:mt-6 lg:w-2/3 lg:max-w-none">
                            Jl. Gagak Hitam No.13 Blok A, Kota Medan, Sumatera Utara 20122,
                            Indonesia
                        </p>

                        <p className="mt-4 rounded-xl bg-[#19398A]/5 px-4 py-3 text-sm font-semibold text-[#19398A] lg:mt-5 lg:bg-transparent lg:px-0 lg:py-0 lg:text-base">
                            Tel: +62 859 2895 3264
                        </p>

                        <div className="mt-4 rounded-xl bg-[#19398A]/5 px-4 py-3 text-sm leading-6 text-[#19398A]/80 lg:mt-5 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="font-semibold text-[#19398A] lg:font-normal lg:text-[#19398A]/80">Jam Operasional</p>
                            <p>Senin-Kamis: 10.00-19.00</p>
                            <p>Jumat: 10.00-18.00</p>
                            <p>Sabtu-Minggu: 13.00-18.00</p>
                        </div>
                    </div>

                    <FooterColumn title="Lucky Pet Market">
                        <FooterLink href="/">Beranda</FooterLink>
                        <FooterLink href="/products?category=dog">Woof Meal</FooterLink>
                        <FooterLink href="/products?category=cat">Meow Meal</FooterLink>
                        <FooterLink href="/products">Playtime Fun</FooterLink>
                        <FooterLink href="/products">Paw Showcase</FooterLink>
                        <FooterLink href="/blog">Lucky Care</FooterLink>
                        <FooterLink href="/blog">Lucky Education</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Hubungi Kami">
                        <FooterLink href="#">WhatsApp</FooterLink>
                        <FooterLink href="#">Instagram</FooterLink>
                        <FooterLink href="#">TikTok</FooterLink>
                    </FooterColumn>

                    <div className="rounded-2xl bg-white/70 p-5 lg:rounded-xl md:col-span-2 lg:col-span-1 lg:bg-transparent lg:p-0 lg:shadow-none">
                        <h3 className="mb-4 text-base font-semibold text-[#19398A] lg:mb-5 lg:text-lg">
                            Nikmatin Keuntungan Spesial
                        </h3>

                        <div className="space-y-3 lg:space-y-4">
                            <BenefitItem icon={<BadgeDollarSign size={24} />}>
                                Diskon hingga 70% hanya di website
                            </BenefitItem>

                            <BenefitItem icon={<CirclePercent size={24} />}>
                                Promo khusus website
                            </BenefitItem>

                            <BenefitItem icon={<Package size={24} />}>
                                Gratis Ongkir tiap hari
                            </BenefitItem>
                        </div>
                    </div>
                </div>

                <div className="mt-7 border-t border-[#19398A]/10 lg:mt-12">
                    <div className="flex flex-col items-center justify-between gap-4 py-5 text-center text-xs leading-5 text-[#19398A]/70 md:flex-row md:text-left lg:py-6 lg:text-sm lg:leading-normal">
                        <p className="max-w-sm lg:max-w-none lg:text-sm">
                            ©{new Date().getFullYear()} Lucky Pet Market. All rights
                            reserved. Designed & Developed by Kodea.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:gap-x-5">
                            <FooterBottomLink href="#">Privacy Policy</FooterBottomLink>
                            <FooterBottomLink href="#">Terms and Conditions</FooterBottomLink>
                            <FooterBottomLink href="#">Support</FooterBottomLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-white/70 p-5 lg:rounded-xl lg:bg-transparent lg:p-0 lg:shadow-none">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#19398A] lg:mb-5 lg:text-lg lg:normal-case lg:tracking-normal">{title}</h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:flex lg:flex-col">{children}</div>
        </div>
    );
}

function FooterLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="min-w-0 text-sm leading-6 text-[#19398A]/80 transition hover:text-[#19398A]"
        >
            {children}
        </Link>
    );
}

function FooterBottomLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="transition hover:text-[#19398A]"
        >
            {children}
        </Link>
    );
}

function BenefitItem({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 text-sm leading-6 text-[#19398A]/80 lg:bg-transparent lg:px-0 lg:py-0">
            <span className="mt-0.5 shrink-0 text-[#19398A] [&_svg]:h-5 [&_svg]:w-5 lg:[&_svg]:h-6 lg:[&_svg]:w-6">{icon}</span>
            <p>{children}</p>
        </div>
    );
}
