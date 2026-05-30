import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import StoreNavbar from "@/components/StoreNavbar";
import FooterSection from "@/components/FooterSection";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopAnnouncementBar />
      <StoreNavbar />
      {children}
      <FooterSection />
    </>
  );
}
