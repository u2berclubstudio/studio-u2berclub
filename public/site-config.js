/* =====================================================================
   U2ber Club Studio — Site Content Config (universal: browser + Node)
   Single source of truth for editable text/links and admin field groups.
   ===================================================================== */
(function () {
  var SITE_DEFAULTS = {
    // Brand
    brandName: "U2BER CLUB",
    brandTag: "Studio · Ludhiana",

    // Hero
    heroSub: "Ludhiana's Home for Creators & Founders",
    heroTitle: "Lights. Camera.",
    heroAccent: "Ludhiana.",
    heroLead: "A world-class podcast & content studio, right here in Ludhiana — built to turn your story, your business, and your voice into content the whole city watches.",
    heroBtnPrimary: "Start Your Creator Journey →",
    heroBtnGhost: "Are You a Founder?",
    heroBtnExplore: "Explore Podcast Setups →",

    // Studio gallery
    galleryStyle: "carousel",
    galleryEyebrow: "Inside the Studio",
    gLabel1: "The Main Studio",
    gLabel2: "The Punjab Set",
    gLabel3: "Green Pod Corner",
    gLabel4: "Interview Set",
    gLabel5: "The Couch Set",
    gLabel6: "Green Panel Set",
    gLabel7: "Creator Corner",
    bookBtn: "Book the Studio →",

    // Contact / WhatsApp
    whatsappNumber: "916239399649",
    bookMessage: "I want to book a studio.",
    whatsappLink: "https://wa.me/message/7WN2XYZPQPO5M1",

    // Made in Ludhiana
    madeTitle: "Made in Ludhiana",
    madeBody: "A platform for the founders, CEOs and business owners building Ludhiana — to share their entrepreneurial journey on camera. Your grind, your wins, your lessons. We produce it. The city gets inspired.",
    madeBtn: "Apply to be featured →",
    formActionUrl: "https://docs.google.com/forms/d/e/1FAIpQLScmu7UwxqS7dGVTrwCyR11IAx63SH1qKdLhmMYikb_wh21yNw/formResponse",

    // Launchpad
    launchEyebrow: "Batch 01 · Applications Open",
    launchHeading: "100 Days · 100 Videos",
    launchTagline: "The work you already do is your content. In 100 days, we put it in front of your city.",
    launchBody1: "Architect, doctor, real estate, boutique owner, nail artist, makeup artist, tarot reader — it doesn’t matter what you do. You already have the one thing people actually watch content for: real experience in real work. Nobody has shown you how to put it on camera yet. That’s the whole job here.",
    launchBody2: "100 days. 100 videos. Shot at the studio, with me working on them personally alongside you — which is exactly why only a handful of people make it into a batch.",
    launchPill1: "Any profession",
    launchPill2: "30 hours across 100 days",
    launchPill3: "U2ber Club Studio, Ludhiana",
    launchPill4: "Very limited",
    launchRuleTitle: "One condition.",
    launchRuleBody: "For these 100 days, the strategy is mine. What we make, how we make it, when it goes out — that’s my call. I will listen to you, I will understand your work deeply, and we will talk about all of it. But once we start, there are no ifs and no buts for 100 days.",
    launchRuleNote: "If you can’t hand over that trust for 100 days, this program isn’t for you — and that is completely fine.",
    ls1t: "Apply", ls1d: "I read every application myself. Not everyone gets in.",
    ls2t: "Lock Your Positioning", ls2d: "Who you are, who you speak to, what you get known for — before a single video.",
    ls3t: "Shoot at the Studio",   ls3d: "You show up, we direct. Set, lights, sound and camera are ours.",
    ls4t: "100 Reels, Live",       ls4d: "Consistent on Instagram, until people in your field know your name.",
    launchBtn: "Apply for Batch 01 →",
    launchNote: "This is a paid program. The price is discussed only after selection.",

    // Mission
    missionTitle: "Every city deserves its own creators.",
    missionAccent: "Ludhiana's time is now.",
    missionBody: "Talent isn't the problem — access is. U2ber Club Studio is built to give the people of Ludhiana the stage, the tools and the support to tell their stories to the world. Whether you're a founder with a journey or a beginner with a dream, this is where you start.",
    missionBtn: "Begin Your Journey →",

    // Footer
    footerAbout: "Ludhiana's content creation studio & learning hub — fully equipped for podcasts, shows and shoots. Inspiring the city to create, one story at a time.",
    studioName: "PODCAST STUDIO U2BERCLUB",
    address: "Main Hambran Rd, near Govind Godham, Partap Singhwala, Ludhiana, Punjab 141008",
    directionsUrl: "https://share.google/q3JyVMnax2m92PeHh",
    hours: "Open daily · from 10:30 AM",
    instaUrl: "https://www.instagram.com/u2berclubstudio",
    websiteUrl: "https://www.u2berclub.com",

    // Tracking / Ads (used server-side to inject snippets; leave blank to disable)
    gtmId: "",
    pixelId: "",
    gaId: ""
  };

  var SITE_FIELDS = [
    ["Brand", [
      ["brandName", "Brand name", "text"],
      ["brandTag", "Brand tagline (small)", "text"]
    ]],
    ["Hero (top section)", [
      ["heroSub", "Small line above heading", "text"],
      ["heroTitle", "Heading line 1", "text"],
      ["heroAccent", "Heading line 2 (coloured)", "text"],
      ["heroLead", "Lead paragraph", "textarea"],
      ["heroBtnPrimary", "Primary button label", "text"],
      ["heroBtnGhost", "Secondary button label", "text"],
      ["heroBtnExplore", "Explore Setups button label", "text"]
    ]],
    ["Studio Gallery", [
      ["galleryStyle", "Display style", "select", [["carousel", "Sliding carousel (auto-scroll)"], ["grid", "Responsive grid"]]],
      ["galleryEyebrow", "Section label", "text"],
      ["gLabel1", "Photo 1 caption", "text"],
      ["gLabel2", "Photo 2 caption", "text"],
      ["gLabel3", "Photo 3 caption", "text"],
      ["gLabel4", "Photo 4 caption", "text"],
      ["gLabel5", "Photo 5 caption", "text"],
      ["gLabel6", "Photo 6 caption", "text"],
      ["gLabel7", "Photo 7 caption", "text"],
      ["bookBtn", "Book Studio button label", "text"]
    ]],
    ["Contact / WhatsApp", [
      ["whatsappLink", "WhatsApp Business chat link (wa.me/message/…) — used for contact buttons", "text"],
      ["whatsappNumber", "WhatsApp number, digits only incl. country code — used for auto-filled booking details", "text"],
      ["bookMessage", "Prefilled booking message (fallback if no chat link)", "text"]
    ]],
    ["Made in Ludhiana", [
      ["madeTitle", "Heading", "text"],
      ["madeBody", "Description", "textarea"],
      ["madeBtn", "Button label", "text"],
      ["formActionUrl", "Google Form submit URL (…/formResponse)", "text"]
    ]],
    ["Launchpad", [
      ["launchEyebrow", "Eyebrow label", "text"],
      ["launchHeading", "Heading", "text"],
      ["launchTagline", "Tagline (bold line)", "text"],
      ["launchBody1", "Paragraph 1", "textarea"],
      ["launchBody2", "Paragraph 2", "textarea"],
      ["launchPill1", "Pill 1 \u2014 For", "text"],
      ["launchPill2", "Pill 2 \u2014 Time", "text"],
      ["launchPill3", "Pill 3 \u2014 Where", "text"],
      ["launchPill4", "Pill 4 \u2014 Seats", "text"],
      ["launchRuleTitle", "Condition box \u2014 title", "text"],
      ["launchRuleBody", "Condition box \u2014 text", "textarea"],
      ["launchRuleNote", "Condition box \u2014 closing line", "textarea"],
      ["ls1t", "Step 1 title", "text"], ["ls1d", "Step 1 description", "text"],
      ["ls2t", "Step 2 title", "text"], ["ls2d", "Step 2 description", "text"],
      ["ls3t", "Step 3 title", "text"], ["ls3d", "Step 3 description", "text"],
      ["ls4t", "Step 4 title", "text"], ["ls4d", "Step 4 description", "text"],
      ["launchBtn", "Button label", "text"],
      ["launchNote", "Line under the button", "text"]
    ]],
    ["Mission", [
      ["missionTitle", "Heading", "text"],
      ["missionAccent", "Heading (coloured part)", "text"],
      ["missionBody", "Description", "textarea"],
      ["missionBtn", "Button label", "text"]
    ]],
    ["Footer / Location", [
      ["footerAbout", "About blurb", "textarea"],
      ["studioName", "Studio name", "text"],
      ["address", "Address", "textarea"],
      ["directionsUrl", "Get Directions link", "text"],
      ["hours", "Opening hours", "text"],
      ["instaUrl", "Instagram URL", "text"],
      ["websiteUrl", "Website URL", "text"]
    ]],
    ["Tracking & Ads", [
      ["gtmId", "Google Tag Manager ID (GTM-XXXXXXX)", "text"],
      ["pixelId", "Meta Pixel ID (numbers)", "text"],
      ["gaId", "Google Analytics 4 ID (G-XXXXXXX)", "text"]
    ]]
  ];

  function applyContentObject(c) {
    document.querySelectorAll("[data-key]").forEach(function (el) {
      var k = el.getAttribute("data-key");
      if (c[k] != null && c[k] !== "") el.textContent = c[k];
    });
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var k = el.getAttribute("data-link");
      if (c[k]) el.setAttribute("href", c[k]);
    });
    document.querySelectorAll("[data-glabel]").forEach(function (el) {
      var k = el.getAttribute("data-glabel");
      if (c[k] != null) el.setAttribute("data-label", c[k]);
    });
    var wa = String(c.whatsappNumber || "").replace(/[^0-9]/g, "");
    var bookHref = c.whatsappLink
      ? c.whatsappLink
      : ("https://wa.me/" + wa + "?text=" + encodeURIComponent(c.bookMessage || "I want to book a studio."));
    document.querySelectorAll('[data-wa="book"]').forEach(function (el) {
      el.setAttribute("href", bookHref);
    });
  }

  var api = {
    SITE_DEFAULTS: SITE_DEFAULTS,
    SITE_FIELDS: SITE_FIELDS,
    applyContentObject: applyContentObject,
    mergeContent: function (over) { return Object.assign({}, SITE_DEFAULTS, over || {}); }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") {
    window.SITE_DEFAULTS = SITE_DEFAULTS;
    window.SITE_FIELDS = SITE_FIELDS;
    window.applyContentObject = applyContentObject;
    window.mergeContent = api.mergeContent;
  }
})();
