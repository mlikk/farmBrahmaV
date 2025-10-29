
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  TrendingUp,
  BarChart,
  Target,
  ShieldCheck,
  Zap,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Logo } from "@/components/dashboard/icons";

export default async function PartnerPage() {
  const t = await getTranslations("PartnerPage");

  const solutions = [
    {
      title: t("solutions.smarterDecisions.title"),
      description: t("solutions.smarterDecisions.description"),
      icon: TrendingUp,
    },
    {
      title: t("solutions.increasedProfitability.title"),
      description: t("solutions.increasedProfitability.description"),
      icon: BarChart,
    },
    {
      title: t("solutions.reducedRisk.title"),
      description: t("solutions.reducedRisk.description"),
      icon: ShieldCheck,
    },
  ];

  const howItWorks = [
    {
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
  ];

  const testimonials = [
    {
      quote: t("testimonials.fpo.quote"),
      name: t("testimonials.fpo.name"),
      title: t("testimonials.fpo.title"),
      avatar: "https://picsum.photos/id/1012/100/100",
      dataAiHint: "man professional",
    },
    {
      quote: t("testimonials.retailer.quote"),
      name: t("testimonials.retailer.name"),
      title: t("testimonials.retailer.title"),
      avatar: "https://picsum.photos/id/1027/100/100",
      dataAiHint: "woman professional",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
           <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-headline">{t("appName")}</span>
            </Link>
          <Button asChild>
            <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer">
              {t("contactUs")}
            </a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary font-headline tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8">
            <Image
              src="https://picsum.photos/1200/600"
              alt="Farmers using technology in a field"
              width={1200}
              height={600}
              className="rounded-lg shadow-xl"
              data-ai-hint="farmers technology"
            />
          </div>
        </section>

        {/* Problem Section */}
        <section className="mt-16 md:mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t("problem.title")}</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t("problem.description")}
          </p>
        </section>

        {/* Solution Section */}
        <section className="mt-16 md:mt-24">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t("solutions.title")}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {solutions.map((item, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-16 md:mt-24">
            <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl font-bold font-headline">{t('benefits.title')}</h2>
                        <p className="mt-2 text-primary-foreground/80">{t('benefits.description')}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-primary-foreground/10 rounded-lg">
                            <CheckCircle2 className="h-8 w-8 text-accent"/>
                            <div>
                                <p className="font-bold text-lg">{t('benefits.benefit1.value')}</p>
                                <p className="text-sm text-primary-foreground/80">{t('benefits.benefit1.description')}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 bg-primary-foreground/10 rounded-lg">
                            <CheckCircle2 className="h-8 w-8 text-accent"/>
                            <div>
                                <p className="font-bold text-lg">{t('benefits.benefit2.value')}</p>
                                <p className="text-sm text-primary-foreground/80">{t('benefits.benefit2.description')}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>


        {/* How It Works Section */}
        <section className="mt-16 md:mt-24">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t("howItWorks.title")}</h2>
          </div>
          <div className="mt-12 relative flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center max-w-xs">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-card border text-primary font-bold text-2xl z-10 relative">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mt-16 md:mt-24">
             <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{t('pricing.title')}</CardTitle>
                    <p className="text-muted-foreground pt-2">{t('pricing.description')}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-5xl font-bold text-primary">
                        {t('pricing.price')}
                        <span className="text-lg font-medium text-muted-foreground">{t('pricing.unit')}</span>
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2 justify-center"><Zap className="h-4 w-4 text-green-500" /> {t('pricing.feature1')}</li>
                        <li className="flex items-center gap-2 justify-center"><Zap className="h-4 w-4 text-green-500" /> {t('pricing.feature2')}</li>
                        <li className="flex items-center gap-2 justify-center"><Zap className="h-4 w-4 text-green-500" /> {t('pricing.feature3')}</li>
                    </ul>
                    <Button size="lg" asChild>
                         <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer">{t('pricing.cta')}</a>
                    </Button>
                </CardContent>
             </Card>
        </section>

        {/* Testimonials Section */}
        <section className="mt-16 md:mt-24">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t("testimonials.title")}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <p className="text-muted-foreground">"{testimonial.quote}"</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                      data-ai-hint={testimonial.dataAiHint}
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 md:mt-24 text-center">
           <Card className="bg-primary/10">
            <CardContent className="p-8 md:p-12">
                <Target className="h-12 w-12 text-primary mx-auto"/>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold font-headline">{t("cta.title")}</h2>
                <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">{t("cta.description")}</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Button size="lg" asChild>
                        <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <MessageCircle /> {t("cta.whatsapp")}
                        </a>
                   </Button>
                   <Image 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/910000000000"
                        alt="WhatsApp QR Code"
                        width={120}
                        height={120}
                        className="rounded-md"
                        data-ai-hint="qr code"
                    />
                </div>
            </CardContent>
           </Card>
        </section>
      </main>

       {/* Footer */}
       <footer className="bg-muted text-muted-foreground py-6 mt-16 md:mt-24">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {t("appName")}. {t("footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
}
