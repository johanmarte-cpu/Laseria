import { Hero } from "@/components/marketing/home/hero";
import { Benefits } from "@/components/marketing/home/benefits";
import { FeaturedTreatments } from "@/components/marketing/home/featured-treatments";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { Cta } from "@/components/marketing/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedTreatments />
      <HowItWorks />
      <Cta />
    </>
  );
}
