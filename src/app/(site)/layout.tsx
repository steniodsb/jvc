import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AdSlot from "@/components/site/AdSlot";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <AdSlot position="topo" className="mx-auto mt-5 max-w-[1200px] px-4" />
      <main className="mx-auto max-w-[1200px] px-4 pt-6">{children}</main>
      <AdSlot position="rodape" className="mx-auto mt-12 max-w-[1200px] px-4" />
      <Footer />
    </>
  );
}
