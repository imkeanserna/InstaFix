import NotFound from "@/app/not-found";
import { HomeFooter } from "@/components/home/footer";
import { DiscoverComponent, InstafixHeroCTA } from "@/components/home/homeContent";

export const LOGO = {
  "black-logo": "/nav-bar/instafix-logo-black.svg",
  "yellow-logo": "/nav-bar/instafix-logo-yellow.svg"
}

export const HERO_TEXTS = [
  "when things break 🔧",
  "home and beyond 🏠🚀",
  "everyday problems ⚡",
];

export const HERO_SECTION_CONFIG = {
  rotatingTexts: HERO_TEXTS,
  staticText: 'Experts for',
  description: 'Connect instantly with AI-powered experts who fix your problems fast, easy and hassle-free',
  smallDescription: 'AI-powered - fast, easy and hassle-free.',
  button: {
    text: 'Find out more',
    mobileText: 'Get Started for free',
    variant: 'ghost',
    className: `relative font-cocogoose bg-amber-950 hover:bg-amber-950 flex text-xs md:text-base
            items-center justify-center border-none rounded-2xl md:rounded-full py-8 px-6 md:px-10 active:scale-[0.98]`
  }
};

export const TESTIMONIALS = [
  "/home-page/testimonial-hero/testimonial-hero-1.webp",
  "/home-page/testimonial-hero/testimonial-hero-2.webp",
  "/home-page/testimonial-hero/testimonial-hero-3.webp"
];

export const OVER_ALL_TESTIMONIAL = "/home-page/testimonial-hero/testimonals-overall.webp";

export const HERO_IMAGE = {
  "car-behind": "/home-page/car-behind.avif"
};

export const FREELANCERS_IMAGE = {
  "freelancer-woman": "/home-page/freelancer-woman.avif",
  "freelancer-man": "/home-page/freelancer-man.avif",
  "bathroom": "/home-page/bathroom.webp",
}

export const SECTION_CONFIG = [
  {
    id: 'smartMatching',
    emoji: '📸',
    text: 'Smart Matching',
    image: "/home-page/feature/camera-feature.avif"
  },
  {
    id: 'instantAssistance',
    emoji: '⚡',
    text: 'Instant Assistance',
    image: "/home-page/feature/ai-chat-feature.avif"
  },
  {
    id: 'seamlessCommunication',
    emoji: '💬',
    text: 'Seamless Communication',
    image: "/home-page/feature/in-house-chat.avif"
  }
];

export const HEADING_AI_SECTION = {
  "heading": "Introducing InstaFix Assistant",
  "subheading": "your personal AI assistant 🤖, connecting you with expert freelancers instantly.",
  "mobileHeading": "Introducing InstaFix Assistant your <span class='text-yellow-400 italic text-[2.3rem]'>personal AI assistant</span> 🤖, connecting you with expert freelancers instantly."
}

export const AI_MESSAGES = [
  {
    sender: 'User',
    text: "I have a broken bathroom sink. Can you help me fix it?",
  },
  {
    sender: 'AI',
    text: "I see you need help with a broken sink! Before we dive into repairs, let’s check the issue. Is the problem with water leakage, clogging, or is the sink physically damaged?",
  },
  {
    sender: 'User',
    text: "There’s water leaking from the pipes underneath.",
  },
  {
    sender: 'AI',
    text: "Got it! A leak under the sink could be due to a loose connection, a worn-out seal, or a cracked pipe. Have you tried tightening any connections?",
  },
  {
    sender: 'User',
    text: " No, I haven’t checked yet.",
  },
  {
    sender: 'AI',
    text: "No worries! A good first step is to look for any loose nuts or fittings. Can you inspect the pipes and see if anything seems loose or dripping?",
  },
  {
    sender: 'User',
    text: " Yes, I see that the P-trap connection is a bit loose.",
  },
  {
    sender: 'AI',
    text: "Got it! You could try tightening it with a wrench, but if the leak persists, this might need expert repair. Let me connect you with an InstaFix freelancer who can fix this for you.",
  },
];

export const SCROLLING_TEXT = {
  text: "Fix Smarter Not Harder,"
}

export const LOOPING_BANNER_TEXTS = [
  "Less hassle more solutions",
  "Instant Solutions",
  "Trusted Experts"
]

export const MOBILE_SECTION = {
  title: {
    main: "Freelance and",
    highlighted: "earn money 💸"
  },
  description: "Enhance your freelancing experience, grow your income, and enjoy a seamless, user-friendly app that effortlessly connects you with clients.",
  mobileImage: "/home-page/mobile-view.avif",
  features: [
    {
      title: "Skill Up, earn more",
      description: "With thousands of users looking for expert help, you'll always find new opportunities. The more you work, the more you earn!"
    },
    {
      title: "Set your own schedule",
      description: "Be your own boss choose when to work and take on projects that fit your time."
    },
    {
      title: "Maximize Your Earnings",
      description: "Earn instantly with no hidden fees. Unlock exclusive deals and incentives as you grow!"
    }
  ]
}

export const DISCOVER_SECTION = {
  component: DiscoverComponent,
  config: {
    title: 'Discover your personalized benefits. 🔍',
    sections: [
      {
        type: 'Users',
        buttonText: 'Users',
        description: 'Get your problems fixed quickly and affordably by skilled freelancers 🛠️.',
        image: FREELANCERS_IMAGE["freelancer-woman"],
        accentColor: 'yellow'
      },
      {
        type: 'Freelancers',
        buttonText: 'Freelancers',
        description: 'Boost your earnings while doing what you do best! 🚀',
        subDescription: '+ Unlock exclusive job opportunities based on your skills and experience.',
        image: FREELANCERS_IMAGE["freelancer-man"],
        accentColor: 'orange'
      }
    ]
  }
};

export const CALLTOACTION = {
  component: InstafixHeroCTA,
  config: {
    title: 'Be Part of Instafix',
    description: 'Find top freelancers, post your projects, and get matched instantly. Work on your schedule, hire with confidence, and fuel your success with Instafix.',
    callToImage: '/home-page/call-to-action/home-camera-detection.gif',
    buttonText: 'Get Started Instafix Now',
  }
}

export const FOOTER_SECTION = {
  component: HomeFooter,
  config: {
    sections: [
      {
        type: 'instafix-description',
        description: 'Get more done in less time with ai.',
        subdescription: 'Crafted by skilled freelancers who know the hustle balancing speed, quality, and efficiency.'
      },
      {
        type: 'form',
        heading: 'The latest Instafix insights delivered to your inbox',
        subdescription: 'By submitting this form, you consent to Instafix processing your data and contacting you to fulfill your request. For more information on how we are committed to protecting and respecting your privacy, please review our Privacy Policy.',
        buttonText: 'Subscribe'
      }
    ]
  }
}

export const NOT_FOUND_PAGE = {
  component: NotFound,
  config: {
    image: "/404-page/freelancer-3d.avif",
    sections: [
      {
        type: "heading",
        title: "Sorry!,",
        message: "this page isn't available",
      },
      {
        type: "description",
        text: "The page you were looking for couldn't be found.",
      },
      {
        type: "links",
        content: [
          {
            regularText: "Go back to the ",
            linkText: "homepage",
            href: "/",
          },
          {
            regularText: " or visit our ",
            linkText: "Help Center",
            href: "/help-center",
          },
        ],
      },
    ],
  },
};

export const LOCATIONSMARKERS = [
  { location: [14.5995, 120.9842], size: 0.1 }, // Philippines (Manila)
  { location: [10.3157, 123.8854], size: 0.07 }, // Cebu, Visayas
  { location: [7.1907, 125.4553], size: 0.1 },
  { location: [19.076, 72.8777], size: 0.03 },  // Hong Kong
  { location: [39.9042, 116.4074], size: 0.08 }, // China (Beijing)
  { location: [40.7128, -74.006], size: 0.1 },   // This is New York City, remove it or update to Tokyo
  { location: [34.6937, 135.5022], size: 0.05 }, // Japan (Osaka)
  { location: [41.0082, 28.9784], size: 0.06 },  // This is Istanbul, remove it or update to another city in Japan
];
