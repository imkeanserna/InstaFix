import { DiscoverComponent } from "@/components/home/homeContent";

export const LOGO = {
  "black-logo": "/nav-bar/instafix-logo-black.svg",
  "yellow-logo": "/nav-bar/instafix-logo-yellow.svg"
}

export const HERO_TEXTS = [
  "when things break",
  "home and beyond",
  "everyday problems",
];

export const HERO_SECTION_CONFIG = {
  rotatingTexts: HERO_TEXTS,
  staticText: 'Experts for',
  description: 'Connect instantly with AI-powered experts who fix your problems fast, easy and hassle-free',
  button: {
    text: 'Find out more',
    variant: 'ghost',
    className: 'relative font-cocogoose bg-amber-950 hover:bg-amber-950 flex items-center justify-center border-none rounded-full py-8 px-10 active:scale-[0.98]'
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
    image: "/home-page/man-and-woman-discussing.avif"
  },
  {
    id: 'instantAssistance',
    emoji: '⚡',
    text: 'Instant Assistance',
    image: "/home-page/living-room.avif"
  },
  {
    id: 'seamlessCommunication',
    emoji: '💬',
    text: 'Seamless Communication',
    image: "/home-page/seamless-communication.avif"
  }
];

export const HEADING_AI_SECTION = {
  "heading": "Introducing InstaFix Assistant",
  "subheading": "your personal AI assistant, connecting you with expert freelancers instantly."
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
    highlighted: "earn money."
  },
  description: "Enhance your freelancing experience, grow your income, and enjoy a seamless, user-friendly app that effortlessly connects you with clients.",
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
    title: 'Discover your personalized benefits.',
    sections: [
      {
        type: 'Users',
        buttonText: 'Users',
        description: 'Get your problems fixed quickly and affordably by skilled freelancers.',
        image: FREELANCERS_IMAGE["freelancer-woman"],
        accentColor: 'yellow'
      },
      {
        type: 'Freelancers',
        buttonText: 'Freelancers',
        description: 'Boost your earnings while doing what you do best!',
        subDescription: '+ Unlock exclusive job opportunities based on your skills and experience.',
        image: FREELANCERS_IMAGE["freelancer-man"],
        accentColor: 'orange'
      }
    ]
  }
};
