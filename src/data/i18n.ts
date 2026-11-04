import type { Locale } from "@/types/ministry";
import type {
  HomeGroupCity,
  MinistryActionType,
  PrayerNeedCategory,
  VolunteerTeam,
} from "@/lib/validations";

/**
 * Comprehensive bilingual (English/Amharic) UI dictionary: navigation,
 * hero copy, synod directory labels, buttons, form labels, giving
 * copy, footer text, and accessibility strings.
 */
export interface UiDictionary {
  brand: {
    name: string;
    tagline: string;
  };
  topBar: {
    motto: string;
    live: string;
    hqPrefix: string;
    usPrefix: string;
    sisterPortalLabel: string;
    prayerRequestLabel: string;
    donateLabel: string;
    contactLabel: string;
    productsLabel: string;
  };
  nav: {
    home: string;
    about: string;
    sermons: string;
    locations: string;
    books: string;
    give: string;
    contact: string;
    languageToggle: string;
    dailyScripture: string;
    events: string;
    ministryTeaching: string;
    prayerArmy: string;
    partnership: string;
    products: string;
    vodSermons: string;
    todaysScripture: string;
    faithWalk: string;
    searchPlaceholder: string;
    searchAria: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaTertiary: string;
    watchLatestTeaching: string;
    headlineLine1: string;
    headlineLine2Gold: string;
    headlineLine3: string;
    slide2Badge: string;
    slide2Title: string;
    slide2Subtitle: string;
    watchLive: string;
    slideAriaTemplate: string;
    prevSlideAria: string;
    nextSlideAria: string;
  };
  schedule: {
    hqTitle: string;
    hqSunday: string;
    hqWednesday: string;
    dcTitle: string;
    dcAddress: string;
    dcSunday: string;
    dcWednesday: string;
    liveStreamTitle: string;
    joinLive: string;
  };
  salvation: {
    label: string;
    headline: string;
    ctaButton: string;
    modalTitle: string;
    prayerIntro: string;
    prayerText: string;
    scriptureRomansRef: string;
    scriptureRomansText: string;
    scriptureJohnRef: string;
    scriptureJohnText: string;
    requestGuideIntro: string;
    requestGuideCta: string;
  };
  sermonsSpotlight: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  recentHighlights: {
    highlightsTitle: string;
    storyHeadline: string;
    storyBody: string;
    readMore: string;
    readMoreBody: string;
    teachingsTitle: string;
    watchAllCta: string;
  };
  eventsSection: {
    sectionTitle: string;
    sectionSubtitle: string;
    liveStreamed: string;
  };
  impact: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  historicVisitation: {
    headline: string;
    exploreLocationsCta: string;
    readHistoryCta: string;
    statYears: string;
    statCongregations: string;
    statSouls: string;
    statStations: string;
  };
  stayConnected: {
    sectionTitle: string;
    subheadline: string;
    checkboxUpdates: string;
    checkboxInformational: string;
    checkboxDonation: string;
    checkboxPrivacyTemplate: string;
    tcpaDisclosure: string;
    submitLabel: string;
    successMessage: string;
  };
  discoverProducts: {
    sectionTitle: string;
    body: string;
    exploreCta: string;
  };
  scriptureDivider: {
    quoteEn: string;
    referenceEn: string;
    quoteAm: string;
    referenceAm: string;
  };
  monthlyOffer: {
    badge: string;
    title: string;
    body: string;
    claimCta: string;
    addToCartCta: string;
    pdfNote: string;
    bulletDigital: string;
    bulletPhysical: string;
    exploreBookPackCta: string;
  };
  dailyWord: {
    sectionTitle: string;
    sectionSubtitle: string;
    todayLabel: string;
    selectDayLabel: string;
    reflectionLabel: string;
    prayDeclarationCta: string;
    copyVerseCta: string;
    copiedLabel: string;
    authorLabel: string;
  };
  prayerArmySection: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  vodSpotlight: {
    sectionTitle: string;
    sectionSubtitle: string;
    channelsLabel: string;
  };
  actionCards: {
    sectionTitle: string;
    sectionSubtitle: string;
    volunteerTitle: string;
    volunteerDesc: string;
    outreachTitle: string;
    outreachDesc: string;
    outreachLinkLabel: string;
    prayerTitle: string;
    prayerDesc: string;
    pastoralCounselingCta: string;
    groupsTitle: string;
    groupsDesc: string;
  };
  actionModal: {
    teamLabel: string;
    teams: Record<VolunteerTeam, string>;
    cityLabel: string;
    groupCitiesLabel: string;
    groupCities: Record<HomeGroupCity, string>;
    noteLabel: string;
    submitLabel: string;
    confirmTitle: string;
    confirmBody: string;
    titles: Record<MinistryActionType, string>;
  };
  community: {
    sectionTitle: string;
    sectionSubtitle: string;
    followFacebook: string;
    watchYoutube: string;
    galleryLabel: string;
    captionApostleDaniel: string;
    captionPastorAberham: string;
    captionHistory: string;
    captionEastShowa: string;
    captionWorship: string;
    captionBookCover: string;
  };
  getInvolved: {
    sectionTitle: string;
    sectionSubtitle: string;
    prayerTitle: string;
    prayerDesc: string;
    discipleshipTitle: string;
    discipleshipDesc: string;
    teamTitle: string;
    teamDesc: string;
    pastoralTitle: string;
    pastoralDesc: string;
  };
  rsvpModal: {
    title: string;
    attendanceInPerson: string;
    attendanceOnline: string;
    branchAffiliationLabel: string;
    confirmTitle: string;
    confirmBody: string;
  };
  contactModal: {
    officeLabel: string;
    officeEthiopia: string;
    officeUs: string;
    confirmTitle: string;
    confirmBody: string;
  };
  prayerModal: {
    title: string;
    subtitle: string;
    categoryLabel: string;
    categories: Record<PrayerNeedCategory, string>;
    prayerRequestLabel: string;
    confidentialLabel: string;
    followUpLabel: string;
    joinArmyLabel: string;
    submitLabel: string;
    confirmTitle: string;
    confirmBody: string;
  };
  about: {
    pageTitle: string;
    pageSubtitle: string;
    navOverview: string;
    navHistory: string;
    navApostle: string;
    navPastor: string;
    navBeliefs: string;
    navWorship: string;
    navTestimonies: string;
    visionLabel: string;
    missionLabel: string;
    commitmentsTitle: string;
    historyTitle: string;
    beliefsTitle: string;
    bioHighlightsTitle: string;
    contactTitle: string;
    viewSermons: string;
    viewBooks: string;
    partnerBannerTitle: string;
    partnerBannerBody: string;
    partnerCta: string;
    naServiceScheduleTitle: string;
  };
  sermonsPage: {
    pageTitle: string;
    pageSubtitle: string;
    searchPlaceholder: string;
    allTopicsLabel: string;
    allSpeakersLabel: string;
    topicFilterLabel: string;
    speakerFilterLabel: string;
    scriptureFiltersLabel: string;
    resetFilters: string;
    showingCountTemplate: string;
    loadAndWatch: string;
    nowPlaying: string;
    hdVideoMode: string;
    audioMode: string;
    downloadAudioTemplate: string;
    shareTeaching: string;
    shareCopied: string;
    studyNotesToggle: string;
    onDemandTabLabel: string;
    liveTabLabel: string;
    liveNowBadge: string;
    offlineBadge: string;
    nextBroadcastLabel: string;
    watchYoutube: string;
    subscribeYoutube: string;
    listenAudioStream: string;
    submitPrayerComment: string;
    speedLabel: string;
    skipBack: string;
    skipForward: string;
    playAria: string;
    pauseAria: string;
    followEverywhereLabel: string;
    watchFacebookLive: string;
    topics: Record<
      "Christian Growth" | "Holy Spirit" | "Hearing God's Voice" | "Revival & Repentance" | "Prophetic Archive" | "Discipleship",
      string
    >;
  };
  locationsPage: {
    pageTitle: string;
    pageSubtitle: string;
    allSynodsLabel: string;
    allSynodsNote: string;
    searchPlaceholder: string;
    typeFilterLabel: string;
    allTypesLabel: string;
    urbanLabel: string;
    ruralLabel: string;
    showingCountTemplate: string;
    resetFilters: string;
    serviceTimesMapContact: string;
    synodOversightLabel: string;
    serviceTimesLabel: string;
    openInMaps: string;
    planVisit: string;
    addressLabel: string;
  };
  booksPage: {
    pageTitle: string;
    pageSubtitle: string;
    viewCartTemplate: string;
    printLabel: string;
    pdfLabel: string;
    pagesLabel: string;
    isbnLabel: string;
    topicsLabel: string;
    aboutBookLabel: string;
    keyThemesLabel: string;
    addPrint: string;
    addDigitalPdf: string;
    addedToCartTemplate: string;
    readExcerpt: string;
    pressCrest: string;
    bulkOrderTitle: string;
    bulkOrderBody: string;
    bulkOrderHqCta: string;
    bulkOrderUsCta: string;
  };
  synods: {
    sectionTitle: string;
    sectionSubtitle: string;
    addisAbaba: string;
    eastShowa: string;
    easternEthiopia: string;
    usaNorthAmerica: string;
    branchesLabel: string;
    viewDirectory: string;
  };
  buttons: {
    learnMore: string;
    readMore: string;
    watchNow: string;
    listenNow: string;
    downloadMp3: string;
    addToCart: string;
    viewCart: string;
    checkout: string;
    submit: string;
    subscribe: string;
    rsvp: string;
    donateNow: string;
    giveOnline: string;
    copy: string;
    copied: string;
    close: string;
    viewAll: string;
  };
  forms: {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    prayerNote: string;
    city: string;
    country: string;
    preferredLanguage: string;
    required: string;
    invalidEmail: string;
    selectOption: string;
    success: string;
    error: string;
  };
  give: {
    sectionTitle: string;
    pageSubtitle: string;
    currencyUsd: string;
    frequencyOneTime: string;
    frequencyMonthly: string;
    frequencyAnnual: string;
    fundLabel: string;
    paymentMethodLabel: string;
    amountSectionLabel: string;
    customAmountLabel: string;
    paymentCardLabel: string;
    paymentApplePayLabel: string;
    paymentTithelyLabel: string;
    paymentCheckLabel: string;
    launchTithelyCta: string;
    tithelyBoxBody: string;
    checkBoxBody: string;
    monthlyPartnerSuffix: string;
    partnershipBannerTitle: string;
    partnershipBannerBody: string;
    claimOfferCheckboxTemplate: string;
    claimOfferMonthlyOnlyNote: string;
    donorDetailsTitle: string;
    submitGift: string;
    receiptModalTitle: string;
    receiptThankYou: string;
    receiptReferenceLabel: string;
    printReceipt: string;
    downloadReceipt: string;
    impactTitle: string;
    impactCongregationsTitle: string;
    impactCongregationsBody: string;
    impactPressTitle: string;
    impactPressBody: string;
    impactBroadcastTitle: string;
    impactBroadcastBody: string;
    taxBadgeTitle: string;
    taxBadgeBody: string;
    checkWireTitle: string;
    usOfficeGiveLabel: string;
    addisOfficeGiveLabel: string;
    payableToLabel: string;
    funds: Record<
      | "Tithes & General Ministry"
      | "Global Revival Crusades & Live Broadcasts"
      | "Ethiopian Rural Church Planting (22 Stations)"
      | "Aware International HQ Sanctuary"
      | "Washington DC Sanctuary"
      | "Compassion & Humanitarian Relief",
      string
    >;
  };
  cart: {
    title: string;
    empty: string;
    remove: string;
    increase: string;
    decrease: string;
    subtotalUsd: string;
    formatPrint: string;
    formatPdf: string;
    checkoutTitle: string;
    deliveryNote: string;
    openAria: string;
    closeAria: string;
  };
  footer: {
    missionStatement: string;
    rightsReserved: string;
    updatedLabel: string;
    tithelyCta: string;
    socialYoutube: string;
    socialFacebook: string;
    socialTelegram: string;
    socialInstagram: string;
    socialTiktok: string;
    socialX: string;
    privacyPolicy: string;
    termsOfUse: string;
    colAbout: string;
    colMedia: string;
    colKeepInTouch: string;
    colGiveSocials: string;
    waysToWatchLabel: string;
    vodLabel: string;
    youtubeChannelLabel: string;
    facebookLiveLabel: string;
    telegramChannelLabel: string;
    discipleshipLabel: string;
    partnerConnectLabel: string;
    enewsletterLabel: string;
    emailUsLabel: string;
    goToTopAria: string;
  };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    languageSwitcher: string;
    playVideo: string;
    pauseVideo: string;
    primaryNav: string;
    mobileNav: string;
  };
}

export const DICTIONARY: Record<Locale, UiDictionary> = {
  en: {
    brand: {
      name: "Gospel Light Ministries",
      tagline: "የወንጌል ብርሃን አለማቀፍ አገልግሎት",
    },
    topBar: {
      motto: "Building a legacy of faith—yesterday, today, and forever!",
      live: "LIVE SUNDAYS 10:00 AM EAT & EST | WEDNESDAYS",
      hqPrefix: "HQ:",
      usPrefix: "US:",
      sisterPortalLabel: "Addis Ababa HQ Portal",
      prayerRequestLabel: "Prayer Request",
      donateLabel: "Donate Now",
      contactLabel: "Contact",
      productsLabel: "Products",
    },
    nav: {
      home: "Home",
      about: "About",
      sermons: "Sermons & Live",
      locations: "Locations (32+1)",
      books: "Books",
      give: "Give",
      contact: "Contact",
      languageToggle: "አማርኛ",
      dailyScripture: "Daily Scripture Devotional",
      events: "Events",
      ministryTeaching: "Ministry & Teaching",
      prayerArmy: "Global Prayer Army",
      partnership: "Partnership",
      products: "Products",
      vodSermons: "Video on Demand (Sermons)",
      todaysScripture: "Today's Key Scripture",
      faithWalk: "Your Faith Walk (Salvation & Discipleship)",
      searchPlaceholder: "Search for sermons, books, branches…",
      searchAria: "Search the site",
    },
    hero: {
      kicker: "UPDATED NOVEMBER 2026 • GLOBAL REVIVAL & BROADCAST MINISTRY",
      title: "Taking the Saving & Healing Power of Jesus Christ to Ethiopia and the Nations",
      subtitle:
        "For more than 43 years, Apostle Daniel Makonnen has carried an apostolic vision to proclaim the Gospel of Jesus Christ with power — now sustaining 32 congregations across Ethiopia, our Washington, D.C. sanctuary in North America, and daily media broadcasts reaching the Ethiopian diaspora worldwide.",
      ctaPrimary: "Donate Now",
      ctaSecondary: "Prayer Requests",
      ctaTertiary: "Watch VOD & Live",
      watchLatestTeaching: "Watch Latest Teaching",
      headlineLine1: "Give Glory to God as we",
      headlineLine2Gold: "lift up the Name of Jesus",
      headlineLine3: "to draw all people to Him!",
      slide2Badge: "★ Special Announcement ★",
      slide2Title: "Revival & Healing Service Live with Apostle Daniel Makonnen",
      slide2Subtitle: "Sundays 9:00 AM EAT & 10:00 AM EST • Wednesdays Live Broadcast",
      watchLive: "Watch Live",
      slideAriaTemplate: "Slide {n} of {total}",
      prevSlideAria: "Previous slide",
      nextSlideAria: "Next slide",
    },
    schedule: {
      hqTitle: "Aware International HQ (Addis Ababa)",
      hqSunday: "Sunday Worship 9:00 AM – 12:30 PM EAT (UTC+3)",
      hqWednesday: "Wednesday Revival & Prayer 5:30 PM EAT (UTC+3)",
      dcTitle: "Washington, D.C. Sanctuary",
      dcAddress: "2401 Virginia Ave NW",
      dcSunday: "Sunday Worship 10:00 AM EST (UTC-5)",
      dcWednesday: "Wednesday Bible Study & Prayer 7:00 PM EST (UTC-5)",
      liveStreamTitle: "Global Live Stream",
      joinLive: "Join Live Now",
    },
    salvation: {
      label: "Salvation",
      headline: "Are you ready for Jesus to change your life?",
      ctaButton: "Accept Jesus Today!",
      modalTitle: "Your Faith Walk & Prayer of Salvation",
      prayerIntro:
        "If you are ready to turn from sin and place your trust in Jesus Christ, pray this prayer with us from your heart:",
      prayerText:
        "Lord Jesus, I believe You are the Son of God, that You died for my sins, and that You rose again. I turn from my sin and place my trust in You alone for salvation. Come into my heart and life. Make me new, and lead me to follow You all my days. Amen.",
      scriptureRomansRef: "Romans 10:9–10",
      scriptureRomansText:
        "\"If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.\"",
      scriptureJohnRef: "John 3:16",
      scriptureJohnText:
        "\"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.\"",
      requestGuideIntro:
        "Welcome to the family of God! Request Apostle Daniel Makonnen's free New Believer study guide, Christian Spiritual Growth — Volume 1, to help you take your next steps.",
      requestGuideCta: "Send Me the Free Study Guide",
    },
    sermonsSpotlight: {
      sectionTitle: "Featured Sermons & Teachings",
      sectionSubtitle:
        "Recent and classic messages from Apostle Daniel Makonnen and our pastoral team.",
    },
    recentHighlights: {
      highlightsTitle: "Recent Updates & Highlights",
      storyHeadline:
        "Thousands Gather at Aware International Sanctuary & Across 32 Ethiopian Branches for Revival Nights",
      storyBody:
        "From Aware HQ in Addis Ababa to congregations in Adama, Harar, and Dire Dawa, a fresh hunger for the Word of God is drawing overflow crowds to midweek revival nights across every synod — a spiritual awakening our pastoral team is seeing ripple from the sanctuary into homes and rural outreach stations alike.",
      readMore: "Read More",
      readMoreBody:
        "Apostle Daniel Makonnen and the pastoral team across Addis Ababa, East Showa, and Eastern Ethiopia report growing attendance at midweek prayer and revival services, with many congregations adding extra chairs and overflow seating. Leadership credits sustained intercession through the Global Prayer Army and a renewed emphasis on discipleship for the momentum — and is calling the whole network to steward it through fasting, prayer, and the Word.",
      teachingsTitle: "Latest Teachings",
      watchAllCta: "Watch All 22+ Teachings",
    },
    eventsSection: {
      sectionTitle: "2026–2027 Conferences & Gatherings",
      sectionSubtitle:
        "Join us in person or online for our upcoming conferences, convocations, and equipping summits.",
      liveStreamed: "Live Streamed",
    },
    impact: {
      sectionTitle: "Four Decades of Revival, By the Numbers",
      sectionSubtitle:
        "From a single underground prayer meeting in 1970s Addis Ababa to a global revival and broadcast ministry — a snapshot of what God has done.",
    },
    historicVisitation: {
      headline: "The Historic Divine Visitation of the Holy Spirit in Ethiopia — Will You Say YES to the Gospel?",
      exploreLocationsCta: "Explore All 32+1 Locations",
      readHistoryCta: "Read Our Full History",
      statYears: "Years of Apostolic Revival",
      statCongregations: "Ethiopian Congregations",
      statSouls: "Souls Reached",
      statStations: "Rural Mission Stations",
    },
    stayConnected: {
      sectionTitle: "Stay Connected to God's Grace",
      subheadline: "Receive heartfelt updates on healing services, devotionals, and ministry highlights right to your inbox.",
      checkboxUpdates: "Add me to your email list to receive ministry updates and special announcements.",
      checkboxInformational: "I agree to receive informational messages.",
      checkboxDonation: "I agree to receive donation solicitation messages.",
      checkboxPrivacyTemplate: "I agree to the {privacyPolicyLink}.",
      tcpaDisclosure:
        "By submitting this form, you consent to receive email and/or text messages from Gospel Light Ministries International. Message & data rates may apply. You can unsubscribe at any time by following the instructions in our messages or contacting either office directly.",
      submitLabel: "Sign Me Up",
      successMessage: "You're signed up! Thank you for staying connected with Gospel Light Ministries International.",
    },
    discoverProducts: {
      sectionTitle: "Discover Resources & Products",
      body:
        "Discover resources and products to bless and enhance your spiritual journey through books, teachings, and media to equip you to partner with Apostle Daniel Makonnen in bringing souls into the Kingdom of God.",
      exploreCta: "Explore Now!",
    },
    scriptureDivider: {
      quoteEn:
        "\"And daily in the temple, and in every house, they ceased not to teach and preach Jesus Christ.\"",
      referenceEn: "Acts 5:42 (KJV)",
      quoteAm:
        "\"ዕለት ዕለትም በመቅደስና በቤታቸው ኢየሱስ እርሱ ክርስቶስ እንደ ሆነ ማስተማርንና መስበክን አይተዉም ነበር።\"",
      referenceAm: "የሐዋርያት ሥራ 5፡42",
    },
    monthlyOffer: {
      badge: "November 2026 Monthly Partner Resource Offer",
      title: "Hearing the Voice of God — Free This Month for New Covenant Partners",
      body:
        "Plant a Monthly Covenant Partnership seed of $35+/mo USD — or any special gift this month — and receive Apostle Daniel Makonnen's Hearing the Voice of God as our thank-you: instant digital PDF access, or a print copy mailed to you.",
      claimCta: "Get the Offer",
      addToCartCta: "Add Book to Cart ($18 Print / $13 PDF)",
      pdfNote: "Already a Monthly Partner? The digital edition is already yours — contact either office for your access link.",
      bulletDigital: "Digital download (worldwide PDF eBook)",
      bulletPhysical: "Physical book (U.S. & International shipping)",
      exploreBookPackCta: "Explore Book Pack",
    },
    dailyWord: {
      sectionTitle: "Daily Scripture Devotional",
      sectionSubtitle: "A word from Apostle Daniel Makonnen to start your day rooted in Scripture.",
      todayLabel: "Today",
      selectDayLabel: "This Week's Devotionals",
      reflectionLabel: "Reflection",
      prayDeclarationCta: "Pray This Declaration",
      copyVerseCta: "Copy Verse",
      copiedLabel: "Copied to clipboard!",
      authorLabel: "By",
    },
    prayerArmySection: {
      sectionTitle: "Join the GLM Global Prayer Army",
      sectionSubtitle:
        "Submit an urgent prayer request, or enlist to receive requests and intercede with believers worldwide.",
    },
    vodSpotlight: {
      sectionTitle: "Video-on-Demand & Media Spotlight",
      sectionSubtitle: "Recent teachings from our official YouTube channel — follow along on every platform.",
      channelsLabel: "Follow & Watch Everywhere",
    },
    actionCards: {
      sectionTitle: "Get Involved",
      sectionSubtitle: "Four real ways to serve with Gospel Light Ministries — in Ethiopia, North America, or from wherever you are.",
      volunteerTitle: "Volunteer",
      volunteerDesc: "Serve on the Choir, Media & Technical, Hospitality, Youth, or Translation team at Aware HQ or Washington, D.C.",
      outreachTitle: "Rural Outreach",
      outreachDesc: "Sponsor or join a mission trip to the 22 rural outreach stations of the Eastern Ethiopia Synod.",
      outreachLinkLabel: "View the 22 Outreach Stations",
      prayerTitle: "24/7 Prayer",
      prayerDesc: "Submit an urgent prayer request to our intercessory team, any hour of the day or night.",
      pastoralCounselingCta: "Request Pastoral Counseling Instead",
      groupsTitle: "Fellowship Groups",
      groupsDesc: "Find a home cell group near you in Addis Ababa, Adama, Harar, Dire Dawa, or Washington, D.C. / Alexandria, VA.",
    },
    actionModal: {
      teamLabel: "Which team?",
      teams: {
        Choir: "Choir",
        "Media & Technical": "Media & Technical",
        Hospitality: "Hospitality",
        "Youth Ministry": "Youth Ministry",
        Translation: "Translation",
      },
      cityLabel: "City",
      groupCitiesLabel: "Nearest Fellowship Group",
      groupCities: {
        "Addis Ababa": "Addis Ababa",
        Adama: "Adama",
        Harar: "Harar",
        "Dire Dawa": "Dire Dawa",
        "Washington, D.C. / Alexandria, VA": "Washington, D.C. / Alexandria, VA",
      },
      noteLabel: "Anything else we should know?",
      submitLabel: "Submit",
      confirmTitle: "Thank You!",
      confirmBody: "Our ministry team has received your request and will follow up soon.",
      titles: {
        Volunteer: "Volunteer Team Application",
        Outreach: "Rural Outreach Sponsorship & Mission Trips",
        Prayer: "Prayer Request",
        "Home Groups": "Find a Fellowship Group",
        "New Believer": "Request Your Free New Believer Study Guide",
      },
    },
    community: {
      sectionTitle: "Ministry in Action — Facebook & YouTube Community",
      sectionSubtitle:
        "Real moments from our congregations in Addis Ababa and Washington, D.C. — follow along on Facebook and YouTube.",
      followFacebook: "Follow & Watch Live on Facebook",
      watchYoutube: "Watch on YouTube",
      galleryLabel: "Photo & Media Gallery",
      captionApostleDaniel: "Apostle Daniel Makonnen",
      captionPastorAberham: "Pastor Aberham Bedasso",
      captionHistory: "1970s Revival Archive",
      captionEastShowa: "East Showa Synod",
      captionWorship: "Aware Sanctuary Worship",
      captionBookCover: "Hearing the Voice of God",
    },
    getInvolved: {
      sectionTitle: "Connect & Get Involved",
      sectionSubtitle:
        "Whatever season of faith you're in, there's a next step for you at Gospel Light Ministries.",
      prayerTitle: "Submit a Prayer Request",
      prayerDesc: "Share a need and our pastoral team will pray with you.",
      discipleshipTitle: "New Believer & Discipleship Class",
      discipleshipDesc: "Take your next step in Christian spiritual growth and maturity.",
      teamTitle: "Join a Worship, Youth, or Outreach Team",
      teamDesc: "Serve alongside our congregation in worship, youth ministry, or rural outreach.",
      pastoralTitle: "Pastoral Counseling & Visit",
      pastoralDesc: "Request a confidential conversation or visit with one of our pastors.",
    },
    rsvpModal: {
      title: "Event Registration",
      attendanceInPerson: "In-Person",
      attendanceOnline: "Online Broadcast",
      branchAffiliationLabel: "Branch / Congregation Affiliation",
      confirmTitle: "You're Registered!",
      confirmBody: "We've received your RSVP. Save the date — we look forward to seeing you.",
    },
    contactModal: {
      officeLabel: "Which office should receive this?",
      officeEthiopia: "Ethiopia HQ (Addis Ababa)",
      officeUs: "Washington, D.C. Office (USA)",
      confirmTitle: "Message Sent",
      confirmBody: "Thank you — our pastoral team will be in touch soon.",
    },
    prayerModal: {
      title: "Submit a Prayer Request",
      subtitle: "Share what's on your heart — our intercessory team and the Global Prayer Army will pray with you.",
      categoryLabel: "Prayer Need Category",
      categories: {
        "Healing & Health": "Healing & Health",
        "Family & Marriage": "Family & Marriage",
        "Provision & Employment": "Provision & Employment",
        "Salvation of a Loved One": "Salvation of a Loved One",
        "Guidance & Decisions": "Guidance & Decisions",
        "Thanksgiving & Testimony": "Thanksgiving & Testimony",
        Other: "Other",
      },
      prayerRequestLabel: "Your Prayer Request",
      confidentialLabel: "Keep my request confidential (pastoral team only)",
      followUpLabel: "I'd like a pastor to follow up with me",
      joinArmyLabel: "Add me to the GLM Global Prayer Army (receive requests to pray over)",
      submitLabel: "Submit Prayer Request",
      confirmTitle: "We Are Praying With You",
      confirmBody: "Your request has been received by our intercessory team. Be encouraged — you are not praying alone.",
    },
    about: {
      pageTitle: "About & Leadership",
      pageSubtitle:
        "One unified home for our mission, history, statement of faith, and pastoral leadership.",
      navOverview: "Mission & Vision",
      navHistory: "Ministry History",
      navApostle: "Apostle Daniel Makonnen",
      navPastor: "Pastor Aberham Bedasso",
      navBeliefs: "Statement of Faith",
      navWorship: "Intimate Worship",
      navTestimonies: "Miracle Moments & Testimonies",
      visionLabel: "Our Vision",
      missionLabel: "Our Mission",
      commitmentsTitle: "Our Core Commitments",
      historyTitle: "Our History",
      beliefsTitle: "Statement of Faith",
      bioHighlightsTitle: "Highlights",
      contactTitle: "Contact",
      viewSermons: "View Sermons",
      viewBooks: "View Books",
      partnerBannerTitle: "Partner With This Vision",
      partnerBannerBody:
        "Four decades of revival, 32 Ethiopian branches, and a North American hub — sustained by partners who give toward this vision.",
      partnerCta: "Partner With This Vision",
      naServiceScheduleTitle: "North American Service Schedule",
    },
    sermonsPage: {
      pageTitle: "Sermons & Live Stream",
      pageSubtitle:
        "Watch or listen to messages from Apostle Daniel Makonnen and our pastoral team, or join the live broadcast from Addis Ababa and Washington, D.C.",
      searchPlaceholder: "Search sermons, speakers, or scripture…",
      allTopicsLabel: "All Teachings",
      allSpeakersLabel: "All Speakers",
      topicFilterLabel: "Topic",
      speakerFilterLabel: "Speaker",
      scriptureFiltersLabel: "Teaching Series Quick Filters",
      resetFilters: "Reset Filters",
      showingCountTemplate: "Showing {count} of {total} teachings",
      loadAndWatch: "Load & Watch",
      nowPlaying: "Now Playing",
      hdVideoMode: "HD Video",
      audioMode: "Low-Bandwidth Audio",
      downloadAudioTemplate: "Download MP3 Audio ({size} MB)",
      shareTeaching: "Share Teaching",
      shareCopied: "Link copied to clipboard!",
      studyNotesToggle: "Study Notes & Scripture",
      onDemandTabLabel: "On-Demand Sermons",
      liveTabLabel: "Live Broadcast",
      liveNowBadge: "LIVE NOW",
      offlineBadge: "Offline",
      nextBroadcastLabel: "Next Broadcast",
      watchYoutube: "Watch on YouTube (@AwareGospelLightEthiopia)",
      subscribeYoutube: "Subscribe on YouTube",
      listenAudioStream: "Listen Audio-Only",
      submitPrayerComment: "Submit a Live Prayer Comment",
      speedLabel: "Speed",
      skipBack: "Back 15 seconds",
      skipForward: "Forward 15 seconds",
      playAria: "Play",
      pauseAria: "Pause",
      followEverywhereLabel: "Follow Everywhere",
      watchFacebookLive: "Watch on Facebook Live",
      topics: {
        "Christian Growth": "Christian Growth",
        "Holy Spirit": "Holy Spirit",
        "Hearing God's Voice": "Hearing God's Voice",
        "Revival & Repentance": "Revival & Repentance",
        "Prophetic Archive": "Prophetic Archive",
        Discipleship: "Discipleship",
      },
    },
    locationsPage: {
      pageTitle: "Synod & Branch Directory",
      pageSubtitle:
        "All 31 branch churches and rural outreach stations across Ethiopia and North America — searchable, filterable, and verified.",
      allSynodsLabel: "All Synods",
      allSynodsNote: "32 Ethiopian congregations & stations, plus 1 U.S. sanctuary",
      searchPlaceholder: "Search by name, city, or neighborhood…",
      typeFilterLabel: "Congregation Type",
      allTypesLabel: "All Types",
      urbanLabel: "Urban Branch Churches",
      ruralLabel: "Rural Outreach Stations",
      showingCountTemplate: "Showing {count} of {total} locations",
      resetFilters: "Reset Filters",
      serviceTimesMapContact: "Service Times, Map & Contact",
      synodOversightLabel: "Synod Oversight",
      serviceTimesLabel: "Service Times",
      openInMaps: "Open in Google Maps",
      planVisit: "Plan Your Visit / Contact Pastor",
      addressLabel: "Address",
    },
    booksPage: {
      pageTitle: "GLM Press Book Store",
      pageSubtitle:
        "Apostle Daniel Makonnen's foundational Amharic and English discipleship manuals, used across Bible schools and local churches.",
      viewCartTemplate: "View Book Cart ({count} items)",
      printLabel: "Print Paperback",
      pdfLabel: "Digital PDF eBook",
      pagesLabel: "pages",
      isbnLabel: "ISBN",
      topicsLabel: "Topics",
      aboutBookLabel: "About This Book",
      keyThemesLabel: "Key Themes",
      addPrint: "+ Add Print Edition",
      addDigitalPdf: "+ Add Digital PDF",
      addedToCartTemplate: "{title} added to your cart.",
      readExcerpt: "Read Excerpt & Table of Contents",
      pressCrest: "GLM Press",
      bulkOrderTitle: "Bulk Church & Bible School Orders",
      bulkOrderBody:
        "Ordering 10 or more copies for your congregation, synod Bible school, or small group? Contact our Addis Ababa HQ or Alexandria, VA office directly for bulk pricing.",
      bulkOrderHqCta: "Email Addis Ababa HQ",
      bulkOrderUsCta: "Email Alexandria, VA Office",
    },
    synods: {
      sectionTitle: "Our Synods & Locations",
      sectionSubtitle:
        "31 branch churches and outreach stations across four synods in Ethiopia and North America.",
      addisAbaba: "Addis Ababa Synod",
      eastShowa: "East Showa Zone Synod",
      easternEthiopia: "Eastern Ethiopia Synod",
      usaNorthAmerica: "USA / North America",
      branchesLabel: "Branches",
      viewDirectory: "View Full Directory",
    },
    buttons: {
      learnMore: "Learn More",
      readMore: "Read More",
      watchNow: "Watch Now",
      listenNow: "Listen Now",
      downloadMp3: "Download MP3",
      addToCart: "Add to Cart",
      viewCart: "View Cart",
      checkout: "Checkout",
      submit: "Submit",
      subscribe: "Subscribe",
      rsvp: "RSVP",
      donateNow: "Donate Now",
      giveOnline: "Give Online",
      copy: "Copy",
      copied: "Copied!",
      close: "Close",
      viewAll: "View All",
    },
    forms: {
      fullName: "Full Name",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Message",
      prayerNote: "Prayer Note (Optional)",
      city: "City",
      country: "Country",
      preferredLanguage: "Preferred Language",
      required: "This field is required.",
      invalidEmail: "Please enter a valid email address.",
      selectOption: "Please select an option.",
      success: "Thank you — your submission was received.",
      error: "Something went wrong. Please try again.",
    },
    give: {
      sectionTitle: "Give Toward the Work of the Gospel",
      pageSubtitle:
        "Partner with Gospel Light Ministries International through secure online giving — supporting 32 congregations across Ethiopia and our Washington, D.C. sanctuary.",
      currencyUsd: "USD ($)",
      frequencyOneTime: "One-Time Gift",
      frequencyMonthly: "Monthly Ministry Partner",
      frequencyAnnual: "Annual Kingdom Seed",
      fundLabel: "Fund Designation",
      paymentMethodLabel: "Payment Method",
      amountSectionLabel: "Gift Amount",
      customAmountLabel: "Custom Amount",
      paymentCardLabel: "Credit / Debit Card (Stripe)",
      paymentApplePayLabel: "Apple Pay / Google Pay",
      paymentTithelyLabel: "Tithe.ly (Official Church Giving Portal)",
      paymentCheckLabel: "Check by Mail",
      launchTithelyCta: "Launch Tithe.ly Giving Portal",
      tithelyBoxBody: "Already give through Tithe.ly? Launch the official portal in a new tab to complete your gift there in one click.",
      checkBoxBody: "Make checks payable to Gospel Light Ministries International and mail to our Alexandria, VA office:",
      monthlyPartnerSuffix: "Monthly Partner",
      partnershipBannerTitle: "Become a Monthly Covenant Partner (የቃል ኪዳን አጋር)",
      partnershipBannerBody:
        "Join our Covenant Partners giving $35+/mo USD toward the work of the Gospel, or give a special gift this month — and receive this month's Special Partner Offer.",
      claimOfferCheckboxTemplate:
        "Yes! Send me this month's Special Partner Offer: {title} by Apostle Daniel Makonnen.",
      claimOfferMonthlyOnlyNote: "Available for Monthly Covenant Partners and Annual Kingdom Gifts.",
      donorDetailsTitle: "Your Details",
      submitGift: "Donate Now",
      receiptModalTitle: "Stewardship Receipt",
      receiptThankYou: "Thank you for partnering with Gospel Light Ministries International.",
      receiptReferenceLabel: "Reference ID",
      printReceipt: "Print Receipt",
      downloadReceipt: "Download Receipt",
      impactTitle: "Where Your Gift Goes",
      impactCongregationsTitle: "32 Ethiopian Congregations",
      impactCongregationsBody:
        "Sustains worship, discipleship, and pastoral care across the Addis Ababa, East Showa, and Eastern Ethiopia Synods, including 22 rural outreach stations.",
      impactPressTitle: "GLM Press & Bible Translation",
      impactPressBody:
        "Publishes Apostle Daniel Makonnen's Amharic and English discipleship manuals used in Bible schools and local churches.",
      impactBroadcastTitle: "Global Satellite & Digital Broadcast",
      impactBroadcastBody:
        "Carries sermons and live services to the Ethiopian diaspora worldwide, from Addis Ababa to Washington, D.C.",
      taxBadgeTitle: "Secure & Tax-Deductible",
      taxBadgeBody:
        "256-bit TLS encryption protects every gift. US donors receive a 501(c)(3) tax-deductible receipt.",
      checkWireTitle: "Give by Check or Wire Transfer",
      usOfficeGiveLabel: "US Administrative Office",
      addisOfficeGiveLabel: "Addis Ababa HQ Office",
      payableToLabel: "Payable to",
      funds: {
        "Tithes & General Ministry": "Tithes, Offerings & General Ministry (አስራትና መባ)",
        "Global Revival Crusades & Live Broadcasts":
          "Global Revival Crusades & Live Broadcasts (ጉባኤዎች እና የቀጥታ ስርጭት)",
        "Ethiopian Rural Church Planting (22 Stations)":
          "Ethiopian Rural Church Planting — 22 Outreach Stations (የገጠር ስርጭት ጣቢያዎች)",
        "Aware International HQ Sanctuary": "Aware International HQ Sanctuary — Addis Ababa (አዋሬ ዋና ቢሮ)",
        "Washington DC Sanctuary": "Washington, D.C. Sanctuary & North America Ministry (ዋሽንግተን ዲሲ አጥቢያ)",
        "Compassion & Humanitarian Relief": "Compassion & Humanitarian Relief (የበጎ አድራጎት አገልግሎት)",
      },
    },
    cart: {
      title: "Your Book Cart",
      empty: "Your cart is empty. Browse the Book Store to add titles.",
      remove: "Remove",
      increase: "Increase quantity",
      decrease: "Decrease quantity",
      subtotalUsd: "Subtotal (USD)",
      formatPrint: "Print",
      formatPdf: "PDF",
      checkoutTitle: "Checkout",
      deliveryNote:
        "Digital PDF titles are emailed instantly after checkout; print titles ship from our Alexandria, VA and Addis Ababa HQ offices.",
      openAria: "Open Book Store Cart",
      closeAria: "Close cart",
    },
    footer: {
      missionStatement:
        "Serving 32 congregations across Ethiopia and our Washington, D.C. sanctuary in North America with the unchanging Gospel of Jesus Christ — uncompromising biblical truth, Spirit-empowered worship, and generational discipleship.",
      rightsReserved: "Gospel Light Ministries International. All rights reserved.",
      updatedLabel: "Updated November 2026",
      tithelyCta: "Give via Tithe.ly",
      socialYoutube: "Gospel Light Ministries on YouTube",
      socialFacebook: "Gospel Light Ministries on Facebook",
      socialTelegram: "Gospel Light Ministries on Telegram",
      socialInstagram: "Gospel Light Ministries on Instagram",
      socialTiktok: "Gospel Light Ministries on TikTok",
      socialX: "Gospel Light Ministries on X",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      colAbout: "About",
      colMedia: "Media",
      colKeepInTouch: "Keep in Touch",
      colGiveSocials: "Connect & Give",
      waysToWatchLabel: "Ways to Watch (Live Stream)",
      vodLabel: "Video on Demand (22+ Sermons)",
      youtubeChannelLabel: "YouTube Channel (@AwareGospelLightEthiopia)",
      facebookLiveLabel: "Facebook Live (EGLIC)",
      telegramChannelLabel: "Telegram Channel (t.me/EGLIC)",
      discipleshipLabel: "Discipleship & Bible School",
      partnerConnectLabel: "Partner Connect (Monthly Covenant)",
      enewsletterLabel: "E-Newsletter & SMS Alerts",
      emailUsLabel: "Email Us",
      goToTopAria: "Go to top",
    },
    a11y: {
      skipToContent: "Skip to main content",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      languageSwitcher: "Switch language",
      playVideo: "Play video",
      pauseVideo: "Pause video",
      primaryNav: "Primary Navigation",
      mobileNav: "Mobile navigation menu",
    },
  },
  am: {
    brand: {
      name: "የወንጌል ብርሃን አለማቀፍ አገልግሎት",
      tagline: "Gospel Light Ministries International",
    },
    topBar: {
      motto: "የእምነት ቅርስን መገንባት — ትናንት፣ ዛሬ እና ለዘላለም!",
      live: "ቀጥታ ስርጭት እሁድ ከጠዋቱ 10፡00 (EAT/EST) | ረቡዕ",
      hqPrefix: "ዋና ቢሮ፦",
      usPrefix: "አሜሪካ፦",
      sisterPortalLabel: "የአዲስ አበባ ዋና ቢሮ ድረ-ገጽ",
      prayerRequestLabel: "የጸሎት ጥያቄ",
      donateLabel: "ይለግሱ",
      contactLabel: "አግኙን",
      productsLabel: "ምርቶች",
    },
    nav: {
      home: "ዋና ገጽ",
      about: "ስለ እኛ",
      sermons: "ስብከቶችና ቀጥታ ስርጭት",
      locations: "አጥቢያዎች (32+1)",
      books: "መጽሐፍት",
      give: "መዋጮ",
      contact: "አግኙን",
      languageToggle: "English",
      dailyScripture: "የዕለቱ ቃል",
      events: "ጉባኤዎች",
      ministryTeaching: "ስብከቶች እና ሚዲያ",
      prayerArmy: "የጸሎት ሠራዊት",
      partnership: "አጋርነት",
      products: "ምርቶች",
      vodSermons: "ስብከቶች (Video on Demand)",
      todaysScripture: "የዛሬው ቁልፍ ጥቅስ",
      faithWalk: "የእምነት ጉዞዎ (ድነትና ደቀ መዝሙርነት)",
      searchPlaceholder: "ስብከቶችን፣ መጻሕፍትን፣ አጥቢያዎችን ይፈልጉ…",
      searchAria: "ድረ-ገጹን ይፈልጉ",
    },
    hero: {
      kicker: "ኅዳር 2026 • ዓለም አቀፍ የተሃድሶ እና የሚዲያ አገልግሎት",
      title: "የኢየሱስ ክርስቶስን የማዳንና የተሃድሶ ኃይል ለኢትዮጵያና ለዓለም ሁሉ ማድረስ",
      subtitle:
        "ከ43 ዓመታት በላይ፣ ሐዋሪያው ዳንኤል መኮንን የኢየሱስ ክርስቶስን ወንጌል በኃይል ለመስበክ ሐዋርያዊ ራዕይን ተሸክሞ ቆይቷል — አሁን በኢትዮጵያ የሚገኙ 32 አጥቢያዎችን፣ በሰሜን አሜሪካ ያለውን የዋሽንግተን ዲሲ ቤተመቅደሳችንን እና በዓለም ዙሪያ ያለውን የኢትዮጵያ ዲያስፖራ የሚደርስ ዕለታዊ የሚዲያ ስርጭት ይደግፋል።",
      ctaPrimary: "አሁን ይለግሱ",
      ctaSecondary: "የጸሎት ጥያቄ ያቅርቡ",
      ctaTertiary: "ቀጥታ ስርጭት እና ስብከቶች",
      watchLatestTeaching: "የቅርብ ጊዜውን ትምህርት ይከታተሉ",
      headlineLine1: "ሰዎችን ሁሉ ወደ እርሱ ለመሳብ",
      headlineLine2Gold: "የኢየሱስን ስም ከፍ ስናደርግ",
      headlineLine3: "ለእግዚአብሔር ክብር ይሁን!",
      slide2Badge: "★ ልዩ ማስታወቂያ ★",
      slide2Title: "ልዩ የተሃድሶ እና የፈውስ ፕሮግራም በቀጥታ ከሐዋሪያው ዳንኤል መኮንን ጋር",
      slide2Subtitle: "እሁድ ከጠዋቱ 9፡00 (EAT) እና 10፡00 (EST) • ረቡዕ በቀጥታ ስርጭት",
      watchLive: "ቀጥታ ይከታተሉ",
      slideAriaTemplate: "ስላይድ {n} ከ{total}",
      prevSlideAria: "ያለፈው ስላይድ",
      nextSlideAria: "የሚቀጥለው ስላይድ",
    },
    schedule: {
      hqTitle: "አዋሬ ዓለም አቀፍ ዋና ቢሮ (አዲስ አበባ)",
      hqSunday: "የሰንበት አምልኮ ከጠዋቱ 9፡00 – 12፡30 (EAT, UTC+3)",
      hqWednesday: "የረቡዕ የተሃድሶና ጸሎት ከቀኑ 5፡30 (EAT, UTC+3)",
      dcTitle: "የዋሽንግተን ዲሲ ቤተመቅደስ",
      dcAddress: "2401 Virginia Ave NW",
      dcSunday: "የሰንበት አምልኮ ከጠዋቱ 10፡00 (EST, UTC-5)",
      dcWednesday: "የረቡዕ የመጽሐፍ ቅዱስ ጥናትና ጸሎት ከምሽቱ 7፡00 (EST, UTC-5)",
      liveStreamTitle: "ዓለም አቀፍ ቀጥታ ስርጭት",
      joinLive: "አሁን ቀጥታ ይከታተሉ",
    },
    salvation: {
      label: "ድነት",
      headline: "ኢየሱስ ሕይወትዎን እንዲለውጥ ዝግጁ ነዎት?",
      ctaButton: "ዛሬ ኢየሱስን ይቀበሉ!",
      modalTitle: "የእምነት ጉዞዎና የድነት ጸሎት",
      prayerIntro: "ከኃጢአት ርቀው በኢየሱስ ክርስቶስ ላይ ለመታመን ዝግጁ ከሆኑ፣ ይህን ጸሎት ከልብዎ ከእኛ ጋር ይጸልዩ፦",
      prayerText:
        "ጌታ ኢየሱስ፣ የእግዚአብሔር ልጅ እንደ ሆንህ፣ ለኃጢአቴ እንደሞትህ እና ዳግም እንደተነሳህ አምናለሁ። ከኃጢአቴ እርቃለሁ፣ ለመዳንም በአንተ ብቻ ታምናለሁ። ወደ ልቤና ሕይወቴ ግባ። አዲስ አድርገኝ፣ ዘመኔን ሁሉ እንድከተልህ ምራኝ። አሜን።",
      scriptureRomansRef: "ሮሜ 10፡9-10",
      scriptureRomansText:
        "\"በአፍህ ኢየሱስ ጌታ እንደ ሆነ ተናዘዝ፥ እግዚአብሔርም ከሙታን እንዳስነሣው በልብህ ብታምን፥ ትድናለህ።\"",
      scriptureJohnRef: "ዮሐንስ 3፡16",
      scriptureJohnText:
        "\"እግዚአብሔር አለምን እጅግ ስለወደደ አንድያ ልጁን ሰጠ፤ በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ።\"",
      requestGuideIntro:
        "ወደ እግዚአብሔር ቤተሰብ እንኳን በደህና መጡ! የሐዋሪያው ዳንኤል መኮንን ነፃ የአዲስ አማኝ ጥናት መምሪያ፣ የክርስትና እድገት — ክፍል 1ን ይጠይቁ።",
      requestGuideCta: "ነፃውን ጥናት መምሪያ ላኩልኝ",
    },
    sermonsSpotlight: {
      sectionTitle: "ተመርጡ ስብከቶችና ትምህርቶች",
      sectionSubtitle:
        "ከሐዋሪያው ዳንኤል መኮንንና ከፓስተሮቻችን የተሰጡ የቅርብ ጊዜና ክላሲክ መልእክቶች።",
    },
    recentHighlights: {
      highlightsTitle: "የቅርብ ጊዜ ዜናዎችና ድንቅ ነገሮች",
      storyHeadline: "በአዋሬ ዓለም አቀፍ ቤተመቅደስና በ32 የኢትዮጵያ አጥቢያዎች ለተሃድሶ ምሽቶች ሺዎች ይሰበሰባሉ",
      storyBody:
        "ከአዲስ አበባ አዋሬ ዋና ቢሮ ጀምሮ በአዳማ፣ በሐረርና በድሬዳዋ ባሉ ጉባኤዎች፣ ለእግዚአብሔር ቃል አዲስ ረሃብ በሁሉም ሲኖዶስ ለሚካሄዱ የሳምንት አጋማሽ ተሃድሶ ምሽቶች ብዙ ሰዎችን እየሳበ ነው — የፓስተሮቻችን ቡድን ይህ መንፈሳዊ ንቅናቄ ከቤተመቅደስ ወደ ቤተሰቦችና የገጠር ስርጭት ጣቢያዎች እየተዛመተ መሆኑን ይመለከታል።",
      readMore: "ተጨማሪ ያንብቡ",
      readMoreBody:
        "ሐዋሪያው ዳንኤል መኮንንና በአዲስ አበባ፣ በምስራቅ ሸዋና በምስራቅ ኢትዮጵያ ያለው የፓስተሮች ቡድን ለሳምንት አጋማሽ ጸሎትና ተሃድሶ አገልግሎቶች እያደገ ያለውን ጉባኤ ይመለከታሉ፤ ብዙ አጥቢያዎችም ተጨማሪ መቀመጫ እየጨመሩ ነው። አመራሩ ይህን ለቀጣይነት ባለው የጸሎት ሠራዊት ምልጃና ለደቀ መዝሙርነት ትኩረት እንደ ምክንያት ይጠቅሳል — እንዲሁም መላውን መረብ በፆም፣ በጸሎትና በቃሉ አማካኝነት ይህን እንቅስቃሴ እንዲጠብቅ ይጠራል።",
      teachingsTitle: "የቅርብ ጊዜ ትምህርቶች",
      watchAllCta: "ከ22+ ትምህርቶች ሁሉንም ይከታተሉ",
    },
    eventsSection: {
      sectionTitle: "2026–2027 ጉባኤዎችና መሰባሰቦች",
      sectionSubtitle:
        "በቀጣዮቹ ጉባኤዎች፣ መሰባሰቦችና ማሰልጠኛዎች በቀጥታ ወይም በመስመር ላይ ይቀላቀሉን።",
      liveStreamed: "በቀጥታ ይተላለፋል",
    },
    impact: {
      sectionTitle: "አራት አስርት ዓመታት የተሃድሶ አገልግሎት በቁጥር",
      sectionSubtitle:
        "በ1970ዎቹ በአዲስ አበባ ከአንድ የከርሰ ምድር ጸሎት ስብሰባ ጀምሮ እስከ ዓለም አቀፍ የተሃድሶና የስርጭት አገልግሎት — እግዚአብሔር ያደረገው ማጠቃለያ።",
    },
    historicVisitation: {
      headline: "በኢትዮጵያ የመንፈስ ቅዱስ ታሪካዊ ጉብኝት — ለወንጌል አዎ ይላሉ?",
      exploreLocationsCta: "ሁሉንም 32+1 አጥቢያዎች ይመልከቱ",
      readHistoryCta: "ሙሉ ታሪካችንን ያንብቡ",
      statYears: "ዓመታት የሐዋርያዊ ተሃድሶ",
      statCongregations: "የኢትዮጵያ አጥቢያዎች",
      statSouls: "የተደረሱ ነፍሳት",
      statStations: "የገጠር ተልዕኮ ጣቢያዎች",
    },
    stayConnected: {
      sectionTitle: "ከእግዚአብሔር ጸጋ ጋር ይተባበሩ",
      subheadline: "ስለ ፈውስ አገልግሎቶች፣ ነቅተ ትምህርቶችና የአገልግሎት ድንቅ ነገሮች ወደ ኢሜልዎ ዝማኔ ይቀበሉ።",
      checkboxUpdates: "የአገልግሎት ዝማኔዎችንና ልዩ ማስታወቂያዎችን ለመቀበል ወደ ኢሜል ዝርዝሬ ያክሉኝ።",
      checkboxInformational: "መረጃ ሰጪ መልእክቶችን ለመቀበል እስማማለሁ።",
      checkboxDonation: "የመዋጮ ጥያቄ መልእክቶችን ለመቀበል እስማማለሁ።",
      checkboxPrivacyTemplate: "{privacyPolicyLink}ን እቀበላለሁ።",
      tcpaDisclosure:
        "ይህን ቅጽ በማስገባትዎ ከወንጌል ብርሃን አለማቀፍ አገልግሎት ኢሜልና/ወይም የጽሑፍ መልእክቶችን ለመቀበል ተስማምተዋል። የመልእክትና የዳታ ክፍያዎች ሊፈጸሙ ይችላሉ። በመልእክቶቻችን ውስጥ ባሉት መመሪያዎች ወይም ማንኛውንም ቢሮ በቀጥታ በማግኘት በማንኛውም ጊዜ መዋቀሩን ማቆም ይችላሉ።",
      submitLabel: "አስመዝግበኝ",
      successMessage: "ተመዝግበዋል! ከወንጌል ብርሃን አለማቀፍ አገልግሎት ጋር ተባብረው ለመቀጠልዎ እናመስግናለን።",
    },
    discoverProducts: {
      sectionTitle: "ግብዓቶችንና ምርቶችን ያግኙ",
      body:
        "የመንፈሳዊ ጉዞዎን ለመባረክና ለማሳደግ በመጻሕፍት፣ በትምህርቶችና በሚዲያ ግብዓቶችን ያግኙ፤ ነፍሳትን ወደ እግዚአብሔር መንግሥት በማምጣት ከሐዋሪያው ዳንኤል መኮንን ጋር ለመተባበር ያስታጥቅዎታል።",
      exploreCta: "አሁን ይመልክቱ!",
    },
    scriptureDivider: {
      quoteEn:
        "\"And daily in the temple, and in every house, they ceased not to teach and preach Jesus Christ.\"",
      referenceEn: "Acts 5:42 (KJV)",
      quoteAm:
        "\"ዕለት ዕለትም በመቅደስና በቤታቸው ኢየሱስ እርሱ ክርስቶስ እንደ ሆነ ማስተማርንና መስበክን አይተዉም ነበር።\"",
      referenceAm: "የሐዋርያት ሥራ 5፡42",
    },
    monthlyOffer: {
      badge: "የኅዳር 2026 ወርሃዊ የአጋር ስጦታ መጽሐፍ",
      title: "የእግዚአብሔር ድምጽ — ለአዲስ ወርሃዊ አጋሮች በዚህ ወር በነፃ",
      body:
        "በወር $35+ USD የወርሃዊ ቃል ኪዳን አጋርነት ዘር ይትክሉ — ወይም በዚህ ወር ልዩ ስጦታ ይስጡ — እና የሐዋሪያው ዳንኤል መኮንን የእግዚአብሔር ድምጽ መጽሐፍን እንደ ምስጋና ይቀበሉ፦ ፈጣን ዲጂታል ፒዲኤፍ ወይም ለእርስዎ የሚላክ የታተመ ቅጂ።",
      claimCta: "ስጦታውን ይቀበሉ",
      addToCartCta: "መጽሐፉን ወደ ጋሪ ጨምር ($18 የታተመ / $13 ፒዲኤፍ)",
      pdfNote: "ነባር ወርሃዊ አጋር ነዎት? ዲጂታል ቅጂው የእርስዎ ነው — ለማግኛ አገናኝ ማንኛውንም ቢሮ ያግኙ።",
      bulletDigital: "ዲጂታል ውርድ (በዓለም ዙሪያ ፒዲኤፍ)",
      bulletPhysical: "የታተመ መጽሐፍ (በአሜሪካና ዓለም አቀፍ መላኪያ)",
      exploreBookPackCta: "የመጻሕፍት ጥቅልን ይመልከቱ",
    },
    dailyWord: {
      sectionTitle: "የዕለቱ ቃል",
      sectionSubtitle: "ቀንዎን በቅዱስ ቃል ላይ ተመስርተው ለመጀመር ከሐዋሪያው ዳንኤል መኮንን የሚቀርብ ቃል።",
      todayLabel: "ዛሬ",
      selectDayLabel: "የዚህ ሳምንት ትምህርቶች",
      reflectionLabel: "አስተንትኖ",
      prayDeclarationCta: "ይህን ኑዛዜ ይጸልዩ",
      copyVerseCta: "ጥቅሱን ኮፒ",
      copiedLabel: "ተኮፒ ተደርጓል!",
      authorLabel: "በ",
    },
    prayerArmySection: {
      sectionTitle: "ወደ GLM ዓለም አቀፍ የጸሎት ሠራዊት ይቀላቀሉ",
      sectionSubtitle: "አስቸኳይ የጸሎት ጥያቄ ያስገቡ፣ ወይም ጥያቄዎችን ለመቀበልና ከዓለም ዙሪያ አማኞች ጋር ለማማለድ ይመዝገቡ።",
    },
    vodSpotlight: {
      sectionTitle: "የቪዲዮ ትምህርቶችና የሚዲያ ማዕከል",
      sectionSubtitle: "ከኦፊሴላዊ የYouTube ቻናላችን የቅርብ ጊዜ ትምህርቶች — በሁሉም መድረኮች ይከታተሉን።",
      channelsLabel: "በሁሉም ቦታ ይከተሉንና ይከታተሉ",
    },
    actionCards: {
      sectionTitle: "ይሳተፉ",
      sectionSubtitle: "ከወንጌል ብርሃን አገልግሎት ጋር ለማገልገል አራት እውነተኛ መንገዶች — በኢትዮጵያ፣ በሰሜን አሜሪካ ወይም ባሉበት ቦታ።",
      volunteerTitle: "በአገልግሎት ይሳተፉ",
      volunteerDesc: "በአዋሬ ዋና ቢሮ ወይም በዋሽንግተን ዲሲ በመዘምራን፣ በሚዲያና ቴክኒክ፣ በእንግዳ ተቀባይነት፣ በወጣቶች ወይም በትርጉም ቡድን ያገልግሉ።",
      outreachTitle: "ወንጌል ስርጭት እና ተልዕኮ",
      outreachDesc: "በምስራቅ ኢትዮጵያ ሲኖዶስ ውስጥ ላሉት 22 የገጠር ስርጭት ጣቢያዎች የተልዕኮ ጉዞ ይደግፉ ወይም ይቀላቀሉ።",
      outreachLinkLabel: "22ቱን የስርጭት ጣቢያዎች ይዩ",
      prayerTitle: "ጸሎት እና ምልጃ",
      prayerDesc: "በቀንም በሌሊትም በማንኛውም ሰዓት ለአማላጅ ቡድናችን አስቸኳይ የጸሎት ጥያቄ ያስገቡ።",
      pastoralCounselingCta: "በምትኩ የእረኝነት ምክር ይጠይቁ",
      groupsTitle: "የቤት ለቤት ኅብረት",
      groupsDesc: "በአዲስ አበባ፣ በአዳማ፣ በሐረር፣ በድሬዳዋ ወይም በዋሽንግተን ዲሲ/አሌክሳንድሪያ ቫርጂኒያ የቤት ኅብረት ቡድን ያግኙ።",
    },
    actionModal: {
      teamLabel: "የትኛው ቡድን?",
      teams: {
        Choir: "መዘምራን",
        "Media & Technical": "ሚዲያና ቴክኒክ",
        Hospitality: "እንግዳ ተቀባይነት",
        "Youth Ministry": "የወጣቶች አገልግሎት",
        Translation: "ትርጉም",
      },
      cityLabel: "ከተማ",
      groupCitiesLabel: "የቅርብ ኅብረት ቡድን",
      groupCities: {
        "Addis Ababa": "አዲስ አበባ",
        Adama: "አዳማ",
        Harar: "ሐረር",
        "Dire Dawa": "ድሬዳዋ",
        "Washington, D.C. / Alexandria, VA": "ዋሽንግተን ዲሲ / አሌክሳንድሪያ ቫርጂኒያ",
      },
      noteLabel: "ሌላ ማሳወቅ የሚፈልጉት ነገር አለ?",
      submitLabel: "አስገባ",
      confirmTitle: "እናመስግናለን!",
      confirmBody: "የአገልግሎት ቡድናችን ጥያቄዎን ተቀብሏል፤ በቅርቡ ያገኙዎታል።",
      titles: {
        Volunteer: "የበጎ አድራጎት ቡድን ማመልከቻ",
        Outreach: "የገጠር ስርጭት ድጋፍና የተልዕኮ ጉዞዎች",
        Prayer: "የጸሎት ጥያቄ",
        "Home Groups": "የኅብረት ቡድን ያግኙ",
        "New Believer": "ነፃ የአዲስ አማኝ ጥናት መምሪያ ይጠይቁ",
      },
    },
    community: {
      sectionTitle: "አገልግሎታችን በተግባር — የFacebook እና YouTube ማህበረሰብ",
      sectionSubtitle: "ከአዲስ አበባና ከዋሽንግተን ዲሲ አጥቢያዎቻችን የተወሰዱ እውነተኛ ቅጽበቶች — በFacebook እና YouTube ይከታተሉን።",
      followFacebook: "በFacebook ይከተሉንና ቀጥታ ይከታተሉ",
      watchYoutube: "በYouTube ይከታተሉ",
      galleryLabel: "የፎቶና ሚዲያ ማዕከል",
      captionApostleDaniel: "ሐዋሪያው ዳንኤል መኮንን",
      captionPastorAberham: "ፓስተር አብርሃም በዳሶ",
      captionHistory: "የ1970ዎቹ ተሃድሶ ማህደር",
      captionEastShowa: "የምስራቅ ሸዋ ሲኖዶስ",
      captionWorship: "የአዋሬ አጥቢያ አምልኮ",
      captionBookCover: "የእግዚአብሔር ድምጽ",
    },
    getInvolved: {
      sectionTitle: "ይገናኙን እና ይሳተፉ",
      sectionSubtitle:
        "በየትኛውም የእምነት ጉዞ ደረጃ ቢሆኑም፣ በወንጌል ብርሃን አገልግሎት ለእርስዎ የሚሆን ቀጣይ ርምጃ አለ።",
      prayerTitle: "የጸሎት ጥያቄ ያስገቡ",
      prayerDesc: "ፍላጎትዎን ያጋሩ፤ የአስተዳደግ ቡድናችን ከእርስዎ ጋር ይጸልያል።",
      discipleshipTitle: "የአዲስ አማኝ እና ደቀ መዝሙርነት ትምህርት",
      discipleshipDesc: "በክርስትና እድገትና መንፈሳዊ ብስለት ቀጣይ ርምጃዎን ይውሰዱ።",
      teamTitle: "በአምልኮ፣ በወጣቶች ወይም በስርጭት ቡድን ይሳተፉ",
      teamDesc: "በአምልኮ፣ በወጣቶች አገልግሎት ወይም በገጠር ስርጭት ከጉባኤያችን ጋር ያገልግሉ።",
      pastoralTitle: "የእረኝነት ምክርና ጉብኝት",
      pastoralDesc: "ከፓስተሮቻችን ጋር ሚስጥራዊ ንግግር ወይም ጉብኝት ይጠይቁ።",
    },
    rsvpModal: {
      title: "ለዝግጅት ይመዝገቡ",
      attendanceInPerson: "በአካል",
      attendanceOnline: "በመስመር ላይ ስርጭት",
      branchAffiliationLabel: "የአጥቢያ/ጉባኤ ትውውቅ",
      confirmTitle: "ተመዝግበዋል!",
      confirmBody: "ምላሽዎ ደርሶናል። ቀኑን ያስቀምጡ — እናንተን ለማየት እንጠባበቃለን።",
    },
    contactModal: {
      officeLabel: "ይህ ለየትኛው ቢሮ ይድረስ?",
      officeEthiopia: "የኢትዮጵያ ዋና ቢሮ (አዲስ አበባ)",
      officeUs: "የዋሽንግተን ዲሲ ቢሮ (አሜሪካ)",
      confirmTitle: "መልእክት ተልኳል",
      confirmBody: "እናመስግናለን — የአስተዳደግ ቡድናችን በቅርቡ ያገኙዎታል።",
    },
    prayerModal: {
      title: "የጸሎት ጥያቄ ያስገቡ",
      subtitle: "በልብዎ ያለውን ያጋሩ — የአማላጅ ቡድናችንና የጸሎት ሠራዊታችን ከእርስዎ ጋር ይጸልያሉ።",
      categoryLabel: "የጸሎት ፍላጎት ዓይነት",
      categories: {
        "Healing & Health": "ፈውስና ጤና",
        "Family & Marriage": "ቤተሰብና ትዳር",
        "Provision & Employment": "ድልድልና ስራ",
        "Salvation of a Loved One": "የቤተሰብ አባል መዳን",
        "Guidance & Decisions": "መምሪያና ውሳኔ",
        "Thanksgiving & Testimony": "ምስጋናና ምስክርነት",
        Other: "ሌላ",
      },
      prayerRequestLabel: "የጸሎት ጥያቄዎ",
      confidentialLabel: "ጥያቄዬ በሚስጥር ይቀመጥ (ለአስተዳደግ ቡድን ብቻ)",
      followUpLabel: "ፓስተር ተከትሎ እንዲያገኘኝ እፈልጋለሁ",
      joinArmyLabel: "ወደ GLM የጸሎት ሠራዊት ጨምረኝ (ለጸሎት ጥያቄዎችን ለመቀበል)",
      submitLabel: "የጸሎት ጥያቄ አስገባ",
      confirmTitle: "ከእርስዎ ጋር እየጸለይን ነው",
      confirmBody: "ጥያቄዎ በአማላጅ ቡድናችን ደርሷል። ይበረታቱ — ብቻዎን አይደለም የምትጸልዩት።",
    },
    about: {
      pageTitle: "ስለ እኛና አመራር",
      pageSubtitle: "ተልዕኳችንን፣ ታሪካችንን፣ የእምነት አንቀጻችንንና የአስተዳደግ አመራራችንን የሚያስተባብር አንድ ገጽ።",
      navOverview: "ራዕይና ተልዕኮ",
      navHistory: "የአገልግሎት ታሪክ",
      navApostle: "ሐዋሪያው ዳንኤል መኮንን",
      navPastor: "ፓስተር አብርሃም በዳሶ",
      navBeliefs: "የእምነት አንቀጽ",
      navWorship: "የአምልኮ ጊዜ",
      navTestimonies: "ድንቅ ስራዎችና ምስክርነቶች",
      visionLabel: "ራዕያችን",
      missionLabel: "ተልዕኳችን",
      commitmentsTitle: "ዋና ዋና ቁርጠኝነቶቻችን",
      historyTitle: "ታሪካችን",
      beliefsTitle: "የእምነት አንቀጽ",
      bioHighlightsTitle: "ዋና ዋና ነጥቦች",
      contactTitle: "አግኙን",
      viewSermons: "ስብከቶችን ይዩ",
      viewBooks: "መጻሕፍትን ይዩ",
      partnerBannerTitle: "ይህን ራዕይ ተባበሩ",
      partnerBannerBody:
        "አራት አስርት ዓመታት ተሃድሶ፣ 32 የኢትዮጵያ አጥቢያዎችና የሰሜን አሜሪካ ማዕከል — ለዚህ ራዕይ በሚለግሱ አጋሮች የሚደገፍ።",
      partnerCta: "ይህን ራዕይ ተባበሩ",
      naServiceScheduleTitle: "የሰሜን አሜሪካ የአምልኮ መርሃ ግብር",
    },
    sermonsPage: {
      pageTitle: "ስብከቶችና ቀጥታ ስርጭት",
      pageSubtitle:
        "ከሐዋሪያው ዳንኤል መኮንንና ከፓስተሮቻችን የተሰጡ መልእክቶችን ይከታተሉ ወይም ያድምጡ፤ ወይም ከአዲስ አበባና ከዋሽንግተን ዲሲ የሚተላለፈውን ቀጥታ ስርጭት ይቀላቀሉ።",
      searchPlaceholder: "ስብከቶችን፣ ሰባኪዎችን ወይም ጥቅሶችን ይፈልጉ…",
      allTopicsLabel: "ሁሉም ትምህርቶች",
      allSpeakersLabel: "ሁሉም ሰባኪዎች",
      topicFilterLabel: "ርዕስ",
      speakerFilterLabel: "ሰባኪ",
      scriptureFiltersLabel: "የትምህርት ተከታታይ ማጣሪያዎች",
      resetFilters: "ማጣሪያዎችን ያጽዱ",
      showingCountTemplate: "{count} ከ{total} ትምህርቶች እየታዩ",
      loadAndWatch: "ይጫኑና ይከታተሉ",
      nowPlaying: "አሁን እየተጫወተ ነው",
      hdVideoMode: "ኤችዲ ቪዲዮ",
      audioMode: "ዝቅተኛ ዳታ ኦዲዮ",
      downloadAudioTemplate: "MP3 ኦዲዮ ያውርዱ ({size} MB)",
      shareTeaching: "ትምህርቱን ያጋሩ",
      shareCopied: "አገናኝ ተኮፒ ተደርጓል!",
      studyNotesToggle: "የጥናት ማስታወሻና ጥቅስ",
      onDemandTabLabel: "ቀድሞ የተቀዱ ስብከቶች",
      liveTabLabel: "ቀጥታ ስርጭት",
      liveNowBadge: "አሁን በቀጥታ",
      offlineBadge: "ከመስመር ውጭ",
      nextBroadcastLabel: "ቀጣይ ስርጭት",
      watchYoutube: "በYouTube ይከታተሉ (@AwareGospelLightEthiopia)",
      subscribeYoutube: "በYouTube ይመዝገቡ",
      listenAudioStream: "ድምጽ ብቻ ያድምጡ",
      submitPrayerComment: "የቀጥታ ጸሎት አስተያየት ያስገቡ",
      speedLabel: "ፍጥነት",
      skipBack: "15 ሰከንድ ወደ ኋላ",
      skipForward: "15 ሰከንድ ወደ ፊት",
      playAria: "አጫውት",
      pauseAria: "አቁም",
      followEverywhereLabel: "በሁሉም መድረኮች ይከተሉን",
      watchFacebookLive: "በFacebook Live ይከታተሉ",
      topics: {
        "Christian Growth": "የክርስትና እድገት",
        "Holy Spirit": "መንፈስ ቅዱስ",
        "Hearing God's Voice": "የእግዚአብሔር ድምጽ",
        "Revival & Repentance": "ተሃድሶ እና ንስሐ",
        "Prophetic Archive": "ትንቢታዊ መልእክቶች",
        Discipleship: "ደቀ መዝሙርነት",
      },
    },
    locationsPage: {
      pageTitle: "የሲኖዶስና አጥቢያ ማውጫ",
      pageSubtitle: "በኢትዮጵያና በሰሜን አሜሪካ የሚገኙ 31 አጥቢያዎችና የገጠር ስርጭት ጣቢያዎች — በፍለጋና በማጣሪያ የተደራጁ።",
      allSynodsLabel: "ሁሉም ሲኖዶሶች",
      allSynodsNote: "32 የኢትዮጵያ አጥቢያዎችና ጣቢያዎች፣ እና 1 የአሜሪካ ቤተመቅደስ",
      searchPlaceholder: "በስም፣ በከተማ ወይም በሰፈር ይፈልጉ…",
      typeFilterLabel: "የአጥቢያ ዓይነት",
      allTypesLabel: "ሁሉም ዓይነቶች",
      urbanLabel: "አጥቢያ ቤተክርስቲያናት",
      ruralLabel: "ስርጭት ጣቢያዎች",
      showingCountTemplate: "{count} ከ{total} አጥቢያዎች እየታዩ",
      resetFilters: "ማጣሪያዎችን ያጽዱ",
      serviceTimesMapContact: "የአምልኮ ጊዜ፣ ካርታና አድራሻ",
      synodOversightLabel: "የሲኖዶስ ተቆጥጣሪነት",
      serviceTimesLabel: "የአምልኮ ጊዜያት",
      openInMaps: "በGoogle Maps ይክፈቱ",
      planVisit: "ጉብኝትዎን ያቅዱ / ፓስተርን ያግኙ",
      addressLabel: "አድራሻ",
    },
    booksPage: {
      pageTitle: "የGLM Press የመጻሕፍት መደብር",
      pageSubtitle: "በሐዋሪያው ዳንኤል መኮንን የተዘጋጁ መሠረታዊ የአማርኛና የእንግሊዝኛ ደቀ መዝሙርነት መጻሕፍት፣ በመጽሐፍ ቅዱስ ትምህርት ቤቶችና አጥቢያዎች የሚያገለግሉ።",
      viewCartTemplate: "የመጻሕፍት ጋሪን ይዩ ({count} እቃዎች)",
      printLabel: "የታተመ መጽሐፍ",
      pdfLabel: "ዲጂታል ፒዲኤፍ መጽሐፍ",
      pagesLabel: "ገጾች",
      isbnLabel: "ISBN",
      topicsLabel: "ርዕሶች",
      aboutBookLabel: "ስለዚህ መጽሐፍ",
      keyThemesLabel: "ዋና ዋና ርዕሶች",
      addPrint: "+ የታተመውን ጨምር",
      addDigitalPdf: "+ ዲጂታል ፒዲኤፍ ጨምር",
      addedToCartTemplate: "{title} ወደ ጋሪዎ ተጨምሯል።",
      readExcerpt: "ናሙናና ማውጫ ያንብቡ",
      pressCrest: "GLM Press",
      bulkOrderTitle: "የቤተክርስቲያንና የመጽሐፍ ቅዱስ ትምህርት ቤት የጅምላ ትዕዛዝ",
      bulkOrderBody:
        "ለአጥቢያዎ፣ ለሲኖዶስ መጽሐፍ ቅዱስ ትምህርት ቤት ወይም ለአነስተኛ ቡድን 10 ወይም ከዚያ በላይ ኮፒ ማዘዝ ይፈልጋሉ? ለጅምላ ዋጋ በቀጥታ የአዲስ አበባ ዋና ቢሮ ወይም የአሌክሳንድሪያ ቫርጂኒያ ቢሮን ያግኙ።",
      bulkOrderHqCta: "የአዲስ አበባ ዋና ቢሮን በኢሜል ያግኙ",
      bulkOrderUsCta: "የአሌክሳንድሪያ ቫርጂኒያ ቢሮን በኢሜል ያግኙ",
    },
    synods: {
      sectionTitle: "ሲኖዶሶቻችንና አጥቢያዎቻችን",
      sectionSubtitle:
        "በኢትዮጵያና በሰሜን አሜሪካ በአራት ሲኖዶሶች ውስጥ የሚገኙ 31 አጥቢያዎችና የገጠር ስርጭት ጣቢያዎች።",
      addisAbaba: "የአዲስ አበባ ሲኖዶስ",
      eastShowa: "የምስራቅ ሸዋ ዞን ሲኖዶስ",
      easternEthiopia: "የምስራቅ ኢትዮጵያ ሲኖዶስ",
      usaNorthAmerica: "አሜሪካ / ሰሜን አሜሪካ",
      branchesLabel: "አጥቢያዎች",
      viewDirectory: "ሙሉ ዝርዝር ይዩ",
    },
    buttons: {
      learnMore: "ተጨማሪ ይወቁ",
      readMore: "ተጨማሪ ያንብቡ",
      watchNow: "አሁን ይከታተሉ",
      listenNow: "አሁን ያድምጡ",
      downloadMp3: "MP3 ያውርዱ",
      addToCart: "ወደ ጋሪ ጨምር",
      viewCart: "ጋሪውን ይዩ",
      checkout: "ክፍያ ይፈጽሙ",
      submit: "ያስገቡ",
      subscribe: "ይመዝገቡ",
      rsvp: "ይመልሱ",
      donateNow: "አሁን ይለግሱ",
      giveOnline: "አስራትና መባ",
      copy: "ኮፒ",
      copied: "ተኮፒ ተደርጓል!",
      close: "ዝጋ",
      viewAll: "ሁሉንም ይዩ",
    },
    forms: {
      fullName: "ሙሉ ስም",
      firstName: "መጠሪያ ስም",
      lastName: "የአባት ስም",
      email: "ኢሜል አድራሻ",
      phone: "ስልክ ቁጥር",
      message: "መልእክት",
      prayerNote: "የጸሎት መልእክት (አማራጭ)",
      city: "ከተማ",
      country: "ሀገር",
      preferredLanguage: "የሚመርጡት ቋንቋ",
      required: "ይህ መስክ መሞላት አለበት።",
      invalidEmail: "እባክዎ ትክክለኛ የሆነ ኢሜል አድራሻ ያስገቡ።",
      selectOption: "እባክዎ አንድ አማራጭ ይምረጡ።",
      success: "እናመስግናለን። መልእክትዎ ተቀብሏል።",
      error: "አንድ ችግር ተፈጥሯል። እንደገና ይሞክሩ።",
    },
    give: {
      sectionTitle: "ለወንጌል ስራ ይስጡ",
      pageSubtitle:
        "በኢትዮጵያ የሚገኙ 32 አጥቢያዎችንና የዋሽንግተን ዲሲ ቤተመቅደሳችንን በሚደግፍ አስተማማኝ የመስመር ላይ ስጦታ ከወንጌል ብርሃን አለማቀፍ አገልግሎት ጋር ይተባበሩ።",
      currencyUsd: "የአሜሪካ ዶላር ($)",
      frequencyOneTime: "አንድ ጊዜ ስጦታ",
      frequencyMonthly: "ወርሃዊ አጋር",
      frequencyAnnual: "ዓመታዊ ስጦታ",
      fundLabel: "የመዋጮ አላማ",
      paymentMethodLabel: "የክፍያ አሰራር",
      amountSectionLabel: "የስጦታ መጠን",
      customAmountLabel: "የተለየ መጠን",
      paymentCardLabel: "ክሬዲት / ደብት ካርድ (Stripe)",
      paymentApplePayLabel: "አፕል ፔይ / ጉግል ፔይ",
      paymentTithelyLabel: "Tithe.ly (ይፋዊ የቤተክርስቲያን መዋጮ መድረክ)",
      paymentCheckLabel: "በፖስታ ቼክ",
      launchTithelyCta: "የTithe.ly መዋጮ መድረክን ይክፈቱ",
      tithelyBoxBody: "አስቀድመው በTithe.ly ይለግሳሉ? በአዲስ ትር ይፋዊውን መድረክ በመክፈት በአንድ ጠቅታ ስጦታዎን ያጠናቅቁ።",
      checkBoxBody: "ቼክን ለወንጌል ብርሃን አለማቀፍ አገልግሎት በመጻፍ ወደ Alexandria, VA ቢሮአችን ይላኩ፦",
      monthlyPartnerSuffix: "ወርሃዊ አጋር",
      partnershipBannerTitle: "ወርሃዊ የቃል ኪዳን አጋር ይሁኑ",
      partnershipBannerBody:
        "ለወንጌል ስራ $35+/ወር USD የሚለግሱ የቃል ኪዳን አጋሮቻችንን ይቀላቀሉ፣ ወይም በዚህ ወር የተለየ ስጦታ ይስጡ — እና የዚህ ወር የተለየ የአጋር ስጦታ ይቀበሉ።",
      claimOfferCheckboxTemplate: "አዎ! በዚህ ወር የተለየ የአጋር ስጦታ ይላኩልኝ፦ {title} በሐዋሪያው ዳንኤል መኮንን።",
      claimOfferMonthlyOnlyNote: "ለወርሃዊ የቃል ኪዳን አጋሮችና ለዓመታዊ ስጦታ ለጋሾች ብቻ ይገኛል።",
      donorDetailsTitle: "የእርስዎ ዝርዝር",
      submitGift: "አሁን ይለግሱ",
      receiptModalTitle: "የስጦታ ደረሰኝ",
      receiptThankYou: "ከወንጌል ብርሃን አለማቀፍ አገልግሎት ጋር ለመተባበርዎ እናመስግናለን።",
      receiptReferenceLabel: "የማጣቀሻ ቁጥር",
      printReceipt: "ደረሰኝ ያትሙ",
      downloadReceipt: "ደረሰኝ ያውርዱ",
      impactTitle: "ስጦታዎ የሚሄድበት",
      impactCongregationsTitle: "32 የኢትዮጵያ አጥቢያዎች",
      impactCongregationsBody:
        "በአዲስ አበባ፣ በምስራቅ ሸዋ እና በምስራቅ ኢትዮጵያ ሲኖዶሶች — 22 የገጠር ስርጭት ጣቢያዎችን ጨምሮ — አምልኮ፣ ደቀ መዝሙርነትና እረኝነት ይደግፋል።",
      impactPressTitle: "GLM Press እና የመጽሐፍ ቅዱስ ትርጉም",
      impactPressBody: "በሐዋሪያው ዳንኤል መኮንን የተዘጋጁ የአማርኛና የእንግሊዝኛ ደቀ መዝሙርነት መጻሕፍትን ያሳትማል።",
      impactBroadcastTitle: "ዓለም አቀፍ ሳተላይትና ዲጂታል ስርጭት",
      impactBroadcastBody: "ከአዲስ አበባ እስከ ዋሽንግተን ዲሲ ለዓለም ዙሪያ ለሚገኝ ዲያስፖራ ስብከቶችንና ቀጥታ አገልግሎቶችን ያስተላልፋል።",
      taxBadgeTitle: "አስተማማኝና ከቀረጥ ነፃ",
      taxBadgeBody:
        "256-bit TLS ምስጠራ ሁሉንም ስጦታ ይጠብቃል። የአሜሪካ ለጋሾች የ501(c)(3) ከቀረጥ ነፃ ደረሰኝ ይቀበላሉ።",
      checkWireTitle: "በቼክ ወይም በዝውውር ይስጡ",
      usOfficeGiveLabel: "የአሜሪካ አስተዳደር ቢሮ",
      addisOfficeGiveLabel: "የአዲስ አበባ ዋና ቢሮ",
      payableToLabel: "ለሚከተለው ይከፈል",
      funds: {
        "Tithes & General Ministry": "አስራትና መባ (Tithes, Offerings & General Ministry)",
        "Global Revival Crusades & Live Broadcasts": "ጉባኤዎች እና የቀጥታ ስርጭት (Global Revival Crusades & Live Broadcasts)",
        "Ethiopian Rural Church Planting (22 Stations)":
          "የገጠር ስርጭት ጣቢያዎች — 22 ጣቢያዎች (Ethiopian Rural Church Planting)",
        "Aware International HQ Sanctuary": "አዋሬ ዋና ቢሮ (Aware International HQ Sanctuary — Addis Ababa)",
        "Washington DC Sanctuary": "ዋሽንግተን ዲሲ አጥቢያ (Washington, D.C. Sanctuary & North America)",
        "Compassion & Humanitarian Relief": "የበጎ አድራጎት አገልግሎት (Compassion & Humanitarian Relief)",
      },
    },
    cart: {
      title: "የመጻሕፍት ጋሪዎ",
      empty: "ጋሪዎ ባዶ ነው። መጻሕፍትን ለመጨመር የመጻሕፍት መደብርን ይጎብኙ።",
      remove: "አስወግድ",
      increase: "ቁጥር ጨምር",
      decrease: "ቁጥር ቀንስ",
      subtotalUsd: "ድምር (USD)",
      formatPrint: "የታተመ",
      formatPdf: "ፒዲኤፍ",
      checkoutTitle: "ክፍያ ይፈጽሙ",
      deliveryNote:
        "ዲጂታል ፒዲኤፍ መጻሕፍት ክፍያ እንደተፈጸመ በኢሜል ይደርሳሉ፤ የታተሙ መጻሕፍት ከአሌክሳንድሪያ ቫርጂኒያና ከአዲስ አበባ ዋና ቢሮ ይላካሉ።",
      openAria: "የመጻሕፍት ጋሪን ክፈት",
      closeAria: "ጋሪን ዝጋ",
    },
    footer: {
      missionStatement:
        "በኢትዮጵያ የሚገኙ 32 አጥቢያዎችንና የዋሽንግተን ዲሲ ቤተመቅደሳችንን በሰሜን አሜሪካ በማይለወጠው የኢየሱስ ክርስቶስ ወንጌል የምታገለግል — ያልተደለዘ የመጽሐፍ ቅዱስ እውነት፣ በመንፈስ ቅዱስ የታጠቀ አምልኮ እና የትውልድ ደቀ መዝሙርነት።",
      rightsReserved: "የወንጌል ብርሃን አለማቀፍ አገልግሎት። መብቱ በህግ የተጠበቀ ነው።",
      updatedLabel: "የተዘመነው ህዳር 2026",
      tithelyCta: "በTithe.ly ይስጡ",
      socialYoutube: "የወንጌል ብርሃን አገልግሎት በYouTube",
      socialFacebook: "የወንጌል ብርሃን አገልግሎት በFacebook",
      socialTelegram: "የወንጌል ብርሃን አገልግሎት በTelegram",
      socialInstagram: "የወንጌል ብርሃን አገልግሎት በInstagram",
      socialTiktok: "የወንጌል ብርሃን አገልግሎት በTikTok",
      socialX: "የወንጌል ብርሃን አገልግሎት በX",
      privacyPolicy: "የግላዊነት መመሪያ",
      termsOfUse: "የአጠቃቀም ስርዓት",
      colAbout: "ስለ እኛ",
      colMedia: "ሚዲያ",
      colKeepInTouch: "ተገናኙን",
      colGiveSocials: "ይተባበሩና ይለግሱ",
      waysToWatchLabel: "የመከታተያ መንገዶች (ቀጥታ ስርጭት)",
      vodLabel: "ስብከቶች (ከ22+ VOD)",
      youtubeChannelLabel: "የYouTube ቻናል (@AwareGospelLightEthiopia)",
      facebookLiveLabel: "Facebook Live (EGLIC)",
      telegramChannelLabel: "Telegram ቻናል (t.me/EGLIC)",
      discipleshipLabel: "ደቀ መዝሙርነትና የመጽሐፍ ቅዱስ ትምህርት ቤት",
      partnerConnectLabel: "የአጋር ግንኙነት (ወርሃዊ ቃል ኪዳን)",
      enewsletterLabel: "ኢሜል ዜናና የSMS ማንቂያ",
      emailUsLabel: "ኢሜል ይላኩልን",
      goToTopAria: "ወደ ላይ ይሂዱ",
    },
    a11y: {
      skipToContent: "ወደ ዋናው ይዘት ዝለል",
      openMenu: "የአሰሳ ምናሌ ክፈት",
      closeMenu: "የአሰሳ ምናሌ ዝጋ",
      languageSwitcher: "ቋንቋ ቀይር",
      playVideo: "ቪዲዮውን አስጀምር",
      pauseVideo: "ቪዲዮውን አቁም",
      primaryNav: "ዋና አሰሳ",
      mobileNav: "የተንቀሳቃሽ ስልክ አሰሳ ምናሌ",
    },
  },
};

export function getDictionary(locale: Locale): UiDictionary {
  return DICTIONARY[locale];
}
