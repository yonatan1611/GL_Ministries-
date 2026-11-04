import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";

const CONTENT: Record<Locale, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: "Terms of Use",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "Acceptance of Terms",
        body:
          "By using this website, operated by Gospel Light Ministries International, you agree to these Terms of Use. If you do not agree, please discontinue use of the site.",
      },
      {
        heading: "Online Giving & Book Orders",
        body:
          "Donations made through this site are voluntary gifts to Gospel Light Ministries International and are generally non-refundable. Book orders are fulfilled as described at checkout — digital PDF titles are delivered by email, and print titles ship from our Alexandria, VA and Addis Ababa HQ offices.",
      },
      {
        heading: "Intellectual Property",
        body:
          "Sermon audio/video, written teachings, and book content on this site are the property of Gospel Light Ministries International and its authors, and may be shared for personal, non-commercial use with attribution.",
      },
      {
        heading: "User Conduct",
        body:
          "Forms on this site (prayer requests, RSVPs, contact, newsletter) may only be used for their intended purpose. Submitting false, abusive, or unlawful content is prohibited.",
      },
      {
        heading: "Limitation of Liability",
        body:
          "This site and its content are provided \"as is.\" Gospel Light Ministries International is not liable for any indirect or consequential damages arising from your use of the site.",
      },
      {
        heading: "Contact",
        body:
          "Questions about these Terms may be directed to addis@glministries.org (Ethiopia) or dc@glministries.org (USA).",
      },
    ],
  },
  am: {
    title: "የአጠቃቀም ስርዓት",
    updated: "መጨረሻ የተዘመነበት፦ ጥር 2026",
    sections: [
      {
        heading: "የስምምነት ተቀባይነት",
        body:
          "በወንጌል ብርሃን አለማቀፍ አገልግሎት የሚተዳደረውን ይህን ድረ-ገጽ በመጠቀም፣ ይህን የአጠቃቀም ስርዓት ተቀብለዋል ማለት ነው። ካልተቀበሉ፣ እባክዎ የድረ-ገጹን አጠቃቀም ያቁሙ።",
      },
      {
        heading: "የመስመር ላይ ልገሳና የመጻሕፍት ትዕዛዝ",
        body:
          "በዚህ ድረ-ገጽ በኩል የሚከናወኑ ልገሳዎች ለወንጌል ብርሃን አለማቀፍ አገልግሎት በፈቃደኝነት የሚሰጡ ስጦታዎች ናቸው፤ በአጠቃላይ ተመላሽ አይደረጉም። የመጻሕፍት ትዕዛዞች በክፍያ ጊዜ በተገለጸው መሰረት ይፈጸማሉ—ዲጂታል ፒዲኤፍ መጻሕፍት በኢሜል ይደርሳሉ፤ የታተሙ መጻሕፍት ከአሌክሳንድሪያ ቫርጂኒያና ከአዲስ አበባ ዋና ቢሮ ይላካሉ።",
      },
      {
        heading: "የአእምሮ ንብረት",
        body:
          "በዚህ ድረ-ገጽ ላይ ያሉ የስብከት ኦዲዮ/ቪዲዮ፣ የተጻፉ ትምህርቶችና የመጻሕፍት ይዘቶች የወንጌል ብርሃን አለማቀፍ አገልግሎትና የደራሲዎቹ ንብረት ናቸው፤ ለግላዊና ለንግድ ላልሆነ አገልግሎት ከምንጭ ጥቅስ ጋር ሊጋሩ ይችላሉ።",
      },
      {
        heading: "የተጠቃሚ ሥነ ምግባር",
        body:
          "በዚህ ድረ-ገጽ ላይ ያሉ ቅጾች (የጸሎት ጥያቄ፣ የዝግጅት ምላሽ፣ አግኙን፣ ደብዳቤ) ለታቀዱላቸው አገልግሎት ብቻ መጠቀም አለባቸው። ሐሰተኛ፣ አላስፈላጊ ወይም ህገወጥ ይዘት ማስገባት የተከለከለ ነው።",
      },
      {
        heading: "የተጠያቂነት ገደብ",
        body:
          "ይህ ድረ-ገጽና ይዘቱ \"እንደ አለ\" ይቀርባል። ወንጌል ብርሃን አለማቀፍ አገልግሎት ድረ-ገጹን በመጠቀም ለሚደርስ ቀጥተኛ ላልሆነ ጉዳት ተጠያቂ አይደለም።",
      },
      {
        heading: "አግኙን",
        body: "ስለዚህ ስርዓት ጥያቄዎች ወደ addis@glministries.org (ኢትዮጵያ) ወይም dc@glministries.org (አሜሪካ) ይላኩ።",
      },
    ],
  },
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  return { title: CONTENT[loc].title };
}

export default async function TermsOfUsePage({ params }: LocalePageProps) {
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
