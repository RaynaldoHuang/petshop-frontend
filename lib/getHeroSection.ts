export async function getHeroSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/hero-sections/active`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed fetch hero section");
  }

  return res.json();
}