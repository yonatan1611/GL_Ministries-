import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";

const CONTENT: Record<Locale, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "Information We Collect",
        body:
          "When you give online, order from our Book Store, RSVP to an event, submit a prayer or pastoral request, or subscribe to our newsletter, we collect the information you provide directly — such as your name, email address, phone number, and mailing address — solely to fulfill that request.",
      },
      {
        heading: "How We Use Your Information",
        body:
          "We use your information to process donations and book orders, respond to prayer and pastoral requests, confirm event attendance, and send newsletter updates you have opted into. We do not sell or rent your personal information to third parties.",
      },
      {
        heading: "Payment Processing",
        body:
          "Online gifts and book orders are processed securely through Stripe. We never store your full card or bank account details on our own servers.",
      },
      {
        heading: "Your Choices",
        body:
          "You may unsubscribe from the newsletter at any time, and may contact either our Addis Ababa headquarters or Washington, D.C. office to request access to, correction of, or deletion of your personal information.",
      },
      {
        heading: "Contact",
        body:
          "Questions about this policy may be directed to addis@glministries.org (Ethiopia) or dc@glministries.org (USA).",
      },
    ],
  },
  am: {
    title: "የግላዊነት መመሪያ",
    updated: "መጨረሻ የተዘመነበት፦ ጥር 2026",
    sections: [
      {
        heading: "የምንሰበስበው መረጃ",
        body:
          "በመስመር ላይ ሲለግሱ፣ ከመጻሕፍት መደብራችን ሲገዙ፣ ለዝግጅት ሲመልሱ፣ የጸሎት ወይም የአስተዳደግ ጥያቄ ሲያስገቡ ወይም ለደብዳቤያችን ሲመዘገቡ፣ ለዚያ ጥያቄ ብቻ የሚያገለግል—እንደ ስምዎ፣ ኢሜል አድራሻዎ፣ ስልክ ቁጥርዎና የመላኪያ አድራሻዎ የመሰሉ በቀጥታ የሚያቀርቡትን መረጃ እንሰበስባለን።",
      },
      {
        heading: "መረጃዎን እንዴት እንጠቀማለን",
        body:
          "መረጃዎን ለልገሳና ለመጻሕፍት ትዕዛዝ ሂደት፣ ለጸሎትና ለአስተዳደግ ጥያቄዎች ምላሽ ለመስጠት፣ ለዝግጅት ተሳትፎ ማረጋገጫ እና ለተመዘገቡለት የደብዳቤ ዝማኔ ለመላክ እንጠቀማለን። የግል መረጃዎን ለሶስተኛ ወገን አንሸጥም ወይም አናከራይም።",
      },
      {
        heading: "የክፍያ አያያዝ",
        body:
          "የመስመር ላይ ስጦታዎችና የመጻሕፍት ትዕዛዞች በStripe በጥንቃቄ ይከናወናሉ። ሙሉ የካርድ ወይም የባንክ አካውንት ዝርዝርዎን በራሳችን አገልጋዮች ላይ በፍጹም አናስቀምጥም።",
      },
      {
        heading: "የእርስዎ ምርጫዎች",
        body:
          "በማንኛውም ጊዜ ከደብዳቤ ምዝገባ መውጣት ይችላሉ፤ እንዲሁም የግል መረጃዎን ለማግኘት፣ ለማስተካከል ወይም ለማጥፋት የአዲስ አበባ ዋና ቢሮችንም ወይም የዋሽንግተን ዲሲ ቢሮችንም ማግኘት ይችላሉ።",
      },
      {
        heading: "አግኙን",
        body: "ስለዚህ መመሪያ ጥያቄዎች ወደ addis@glministries.org (ኢትዮጵያ) ወይም dc@glministries.org (አሜሪካ) ይላኩ።",
      },
    ],
  },
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  return { title: CONTENT[loc].title };
}

export default async function PrivacyPolicyPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const content = CONTENT[locale];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">{content.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{content.updated}</p>
        <div className="mt-8 flex flex-col gap-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg font-bold text-navy-800">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
