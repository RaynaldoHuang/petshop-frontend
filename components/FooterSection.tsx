import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";
import { BadgeDollarSign, CirclePercent, Package } from "lucide-react";

export default function FooterSection() {
    return (
        <footer className="bg-[#F6F7FA]">
            <div className="mx-auto max-w-7xl pt-16 pb-4">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr]">
                    <div className="max-w-md">
                        <Link href="/">
                            <Image
                                alt="Lucky Petshop"
                                src={logo}
                                className="w-52"
                                priority
                            />
                        </Link>

                        <p className="mt-6 text-sm leading-6 text-[#19398A]/80 w-2/3">
                            Jl. Gagak Hitam No.13 Blok A, Kota Medan, Sumatera Utara 20122,
                            Indonesia
                        </p>

                        <p className="mt-5 text-base font-semibold text-[#19398A]">
                            Tel: +62 859 2895 3264
                        </p>

                        <div className="mt-5 text-sm leading-6 text-[#19398A]/80">
                            <p>Our hours of operation are</p>
                            <p>Monday-Thursday: 10 AM-7 PM EST,</p>
                            <p>Friday: 10 AM-6 PM EST,</p>
                            <p>Saturday-Sunday: 1 PM-6 PM EST.</p>
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

                    <div>
                        <h3 className="mb-5 text-lg font-semibold text-[#19398A]">
                            Nikmatin Keuntungan Spesial
                        </h3>

                        <div className="space-y-4">
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

                <div className="mt-12 border-t border-[#19398A]/10">
                    <div className="flex flex-col items-center justify-between gap-4 py-6 text-center text-sm text-[#19398A]/70 md:flex-row md:text-left">
                        <p className="text-sm">
                            ©{new Date().getFullYear()} Lucky Pet Market. All rights
                            reserved. Designed & Developed by Kodea.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
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
        <div>
            <h3 className="mb-5 text-lg font-semibold text-[#19398A]">{title}</h3>

            <div className="flex flex-col gap-y-2.5">{children}</div>
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
            className="text-sm text-[#19398A]/80 transition hover:text-[#19398A]"
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
        <div className="flex items-start gap-3 text-sm leading-6 text-[#19398A]/80">
            <span className="mt-0.5 shrink-0 text-[#19398A]">{icon}</span>
            <p>{children}</p>
        </div>
    );
}