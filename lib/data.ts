import { Villa, CampingGear, TourGuide, Attraction, KithulProduct, CustomerComment, CustomerInquiry } from './types';

export const AGENCY_CONFIG = {
  name: 'The Sinharaja Collection Lankagama',
  sinhalaName: 'ද සිංහරාජ කලෙක්ෂන් ලංකාගම',
  tagline: 'Your Curated Gateway to Sinharaja & Lankagama Rainforest Stays & Experiences',
  phone: '+94 76 797 6081',
  whatsappNumber: '94767976081', // formatted for wa.me links
  email: 'info@sinharajacollection.com',
  address: 'Main Road, Lankagama, Southern Province, Sri Lanka',
  adminPin: '1234', // Default Agency Admin PIN for demo
};

export const VILLAS: Villa[] = [
  {
    id: 'villa-1',
    name: 'Sinharaja Gin Ganga River Edge Villa',
    sinhalaName: 'ගිං ගඟ අද්දර ඉකෝ විලා',
    tagline: 'Natural river bath, bird calls & authentic village cuisine',
    description: 'Located directly by the crystal-clear waters of Gin Ganga in Lankagama. Step straight from your wooden balcony into cool natural stream pools. Perfect for peaceful nature retreats with traditional Sri Lankan meals prepared on woodfire hearths.',
    pricePerNightLKR: 12500,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    bedConfig: '1 King Bed, 1 Queen Bed, 1 Single Daybed',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    features: ['Natural River Bathing Pool', 'Woodfire Village Meals', 'Balcony with Jungle View', 'Solar Hot Water', 'Leech Protection Gear', 'Free Local Tea'],
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80'
    ],
    locationDetails: 'Near Lankagama suspension bridge & Gin Ganga riverbank',
    ownerContact: '+94 71 450 1122 (Mr. Karunathilaka)',
    acType: 'both',
    hasKitchen: true,
    highlights: [
      {
        title: 'Direct River Access',
        desc: 'Private wooden stairs directly into the crystal-clear natural swimming pool of Gin Ganga.',
        icon: 'Droplets'
      },
      {
        title: 'Authentic Woodfire Cooking',
        desc: 'Traditional Sri Lankan village curries cooked on earthen clay pots and woodfire.',
        icon: 'Utensils'
      },
      {
        title: 'Solar Hot Water',
        desc: 'Eco-friendly hot water showers in both private bathrooms.',
        icon: 'Sun'
      },
      {
        title: 'Free Anti-Leech Protection',
        desc: 'Complimentary high-grade leech socks and herbal citronella spray for all guests.',
        icon: 'ShieldCheck'
      }
    ],
    facilities: [
      {
        category: 'Nature & River Access',
        items: [
          'Natural river swimming pool right in front of villa',
          'Wooden viewing deck with sun chairs over Gin Ganga',
          'Fish therapy / pedicure pool in natural stream',
          'Private riverbank barbecue & campfire corner'
        ]
      },
      {
        category: 'Bedrooms & Comfort',
        items: [
          '2 Separate bedrooms with ceiling fans & mosquito nets',
          'Premium linen, fluffy towels and extra warm blankets',
          '2 Attached private bathrooms with solar hot water showers',
          'Natural herbal toiletries and organic shampoo provided'
        ]
      },
      {
        category: 'Dining & Local Cuisine',
        items: [
          'Traditional village breakfast included (Hoppers/Milk rice/Roti with lunu miris)',
          'Lunch & Dinner available on request (Authentic local organic vegetables & river fish)',
          'Unlimited fresh mountain spring drinking water & herbal tea',
          'Outdoor riverside dining table under bamboo shade'
        ]
      },
      {
        category: 'Safety & Guest Care',
        items: [
          'Complimentary anti-leech socks & organic repellent spray',
          'Free safe vehicle parking on premises',
          '24/7 Local caretaker on call',
          'First aid kit with leech bite remedies'
        ]
      }
    ],
    foodOptions: [
      'Traditional Village Rice & Curry (Woodfire cooked in clay pots)',
      'Sri Lankan Breakfast (String hoppers, Pol sambol, Kiri hodi, Dhal)',
      'Evening Ceylon Highland Tea with Kithul Jaggery',
      'Riverside Charcoal BBQ Dinner (Chicken, Fish, Corn on cob)'
    ],
    houseRules: [
      'Check-in from 02:00 PM | Check-out by 11:00 AM',
      'No soap, shampoo, or chemicals in the natural river to protect aquatic species',
      'Please keep noise down after 10:00 PM to respect rainforest wildlife',
      'No single-use polythene bags or plastic bottles left near river banks'
    ]
  },
  {
    id: 'villa-2',
    name: 'Brahmana Ella Fall View Eco Lodge',
    sinhalaName: 'බ්‍රාහ්මණ ඇල්ල වීව් ඉකෝ ලොජ්',
    tagline: 'Wake up to the roaring sound of Brahmana Ella waterfall',
    description: 'Perched on the upper slope with panoramic views of the famous 35m Brahmana Ella waterfall and surrounding tea estates. Cozy private chalets surrounded by endemic Sinharaja flora and mist in the early mornings.',
    pricePerNightLKR: 16000,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    bedConfig: '2 Queen Beds, 2 Single Beds',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    features: ['Brahmana Waterfall View', 'Private Dining Deck', 'Hot Water Shower', 'High-Speed Wi-Fi', 'Guided Walk Included', 'Traditional Breakfast'],
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    locationDetails: 'Brahmana Ella access road, Lankagama',
    ownerContact: '+94 77 334 9871 (Saman Weerasinghe)',
    acType: 'non-ac',
    hasKitchen: false,
    highlights: [
      {
        title: 'Panoramic Waterfall View',
        desc: 'Unobstructed direct line of sight to the roaring Brahmana Ella cascade.',
        icon: 'Eye'
      },
      {
        title: 'Complimentary Waterfall Walk',
        desc: 'A guided morning walk through tea estate paths directly to the waterfall base.',
        icon: 'Compass'
      },
      {
        title: 'High-Speed Wi-Fi',
        desc: 'Fast 4G Wi-Fi connection for remote workers and trip planning.',
        icon: 'Wifi'
      },
      {
        title: 'Waterfall Deck Dining',
        desc: 'Private outdoor dining deck with mist sweeping past during morning breakfast.',
        icon: 'Coffee'
      }
    ],
    facilities: [
      {
        category: 'Scenic Views & Location',
        items: [
          'Direct balcony view of Brahmana Ella waterfall',
          'Private 10-minute trek path to the waterfall basin',
          'Bordered by organic highland tea garden',
          'Bird watching vantage point with high biodiversity'
        ]
      },
      {
        category: 'Rooms & Living Areas',
        items: [
          '3 Spacious bedrooms with plush mattresses',
          'Private panoramic balconies attached to master bedrooms',
          'High-pressure hot water rain showers in both bathrooms',
          'Work desk with electric outlets & backup emergency lighting'
        ]
      },
      {
        category: 'Food & Beverage',
        items: [
          'Complimentary full village breakfast included daily',
          'Fresh hand-plucked organic tea served on arrival',
          'Traditional lunch & dinner menus featuring jackfruit, river fish & local greens',
          'Outdoor charcoal BBQ grill set provided on request'
        ]
      },
      {
        category: 'Technology & Work',
        items: [
          'Reliable high-speed Wi-Fi across all rooms and terrace',
          'Bluetooth sound system for soft acoustic ambient music',
          'Hairdryer, ironing facilities and luggage storage available',
          'Secure parking for up to 2 vehicles'
        ]
      }
    ],
    foodOptions: [
      'Signature Brahmana Breakfast (Pittu or Hoppers with Seeni Sambol & Kiri Hodi)',
      'Rainforest Special Rice & Curry (7 curries with papadum & woodfire chutney)',
      'Fresh Tea Tasting Platter with Jaggery',
      'Evening Firepit BBQ (Marinated chicken/fish skewers with garlic bread)'
    ],
    houseRules: [
      'Check-in: 02:00 PM | Check-out: 11:00 AM',
      'Please do not cross waterfall safety ropes when water level rises',
      'Smoking strictly permitted only in designated outdoor garden zones',
      'Quiet hours begin at 10:30 PM'
    ]
  },
  {
    id: 'villa-3',
    name: 'Lankagama Deep Forest Wooden Chalet',
    sinhalaName: 'ලංකාගම ඩීප් ෆොරස්ට් වුඩන් චැලේ',
    tagline: 'Rustic luxury at the buffer border of Sinharaja Rainforest',
    description: 'Crafted from sustainable local timber, this secluded chalet blends right into the rainforest canopy. Unplug from the busy city, breathe the cleanest air in Sri Lanka, and fall asleep to the symphony of cicadas and nocturnal jungle sounds.',
    pricePerNightLKR: 18500,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    bedConfig: '2 King Canopy Beds',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    features: ['Canopy Observation Deck', 'Eco-Architecture', 'Star Gazing Patio', 'Organic Homegrown Vegetables', 'Firepit Lounge', 'Free Trekking Maps'],
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    locationDetails: 'Upper Lankagama, bordering Sinharaja reserve boundary',
    ownerContact: '+94 70 219 8834 (Bandara)',
    acType: 'non-ac',
    hasKitchen: false,
    highlights: [
      {
        title: 'Rainforest Canopy Deck',
        desc: 'Elevated wooden deck touching rainforest tree branches where giant squirrels visit.',
        icon: 'Trees'
      },
      {
        title: 'Star Gazing Firepit',
        desc: 'Stone campfire circle with zero light pollution for observing star constellations.',
        icon: 'Sparkles'
      },
      {
        title: 'Pure Spring Water',
        desc: 'Drinking and bath water fed directly by a pristine mountain natural spring.',
        icon: 'Droplets'
      },
      {
        title: 'Handcrafted Wood Architecture',
        desc: 'Built entirely with eco-timber following traditional Sri Lankan forestry techniques.',
        icon: 'Home'
      }
    ],
    facilities: [
      {
        category: 'Rainforest Experience',
        items: [
          'High elevation canopy balcony overlooking virgin rainforest',
          'Private stone firepit and wood campfire lounge',
          'Night wildlife observation torches & binoculars provided',
          'Free Sinharaja trail map and bird guide books'
        ]
      },
      {
        category: 'Timber Architecture',
        items: [
          'Hand-carved timber king canopy beds with soft draping mosquito netting',
          'Open-air jungle showers with hot water & natural stone tiling',
          'Warm wool blankets for crisp mountain night air',
          'Solar energy power backup system'
        ]
      },
      {
        category: 'Organic Produce & Dining',
        items: [
          '100% Organic village vegetables harvested from adjacent garden',
          'Full board meal packages available (Breakfast, Lunch, Dinner)',
          'Traditional herbal porridge (Kola Kenda) served every morning',
          'Woodfire roasted tea & fresh wild honey'
        ]
      },
      {
        category: 'Trekking Support',
        items: [
          'Direct departure point for upper Sinharaja buffer trails',
          'Leech socks, walking bamboo sticks and rain ponchos included',
          'Local trail guide arrangements with priority booking'
        ]
      }
    ],
    foodOptions: [
      'Morning Herbal Kola Kenda with Jaggery',
      'Lankagama Farm Lunch (7 curries with freshly harvested vegetables)',
      'Clay Pot Rice with Village Chicken or Dry Fish Curry',
      'Campfire Roasted Corn & Kithul Honey Pancakes'
    ],
    houseRules: [
      'Check-in: 02:00 PM | Check-out: 11:00 AM',
      'Strictly non-smoking indoors to preserve timber structure',
      'No loud loudspeakers or disruptive music (nature sounds only)',
      'Do not feed wild animals visiting the canopy deck'
    ]
  },
  {
    id: 'villa-4',
    name: 'Nilwella Green Stream Family Cottage',
    sinhalaName: 'නිල්වැල්ල ග්‍රීන් ස්ට්‍රීම් ෆැමිලි කොට්ජ්',
    tagline: 'Spacious cottage ideal for families and trekking groups',
    description: 'A cozy, family-friendly estate bungalow nestled amidst cardamom and tea gardens with a gentle natural stream running through the front garden. Safe for children with large verandas and delicious home-cooked village spreads.',
    pricePerNightLKR: 14000,
    maxGuests: 8,
    bedrooms: 3,
    bathrooms: 2,
    bedConfig: '2 Queen Beds, 4 Single Bunk Beds',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    features: ['Accommodates up to 8 Guests', 'Private Stream In Garden', 'Full Kitchen Available', 'BBQ Grill Facilities', 'Spacious Veranda', 'Vehicle Parking'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    locationDetails: 'Nilwella junction, Lankagama approach',
    ownerContact: '+94 76 991 4455 (Mrs. Kanthi)',
    acType: 'both',
    hasKitchen: true,
    highlights: [
      {
        title: 'Accommodates up to 8',
        desc: 'Ideal for extended families, university groups, and trekking teams.',
        icon: 'Users'
      },
      {
        title: 'Child-Safe Garden Stream',
        desc: 'Gentle, ankle-deep natural stream flowing through the front lawn safe for children to paddle.',
        icon: 'Droplets'
      },
      {
        title: 'Self-Cooking Kitchen',
        desc: 'Fully equipped kitchen with refrigerator and gas stove for groups who want to cook.',
        icon: 'Utensils'
      },
      {
        title: 'Spacious Veranda & Parking',
        desc: 'Large traditional front veranda with ample secure parking for multiple vehicles.',
        icon: 'Home'
      }
    ],
    facilities: [
      {
        category: 'Family & Group Comfort',
        items: [
          '3 Bedrooms with bedding for up to 8 adult guests',
          'Spacious living room with sofa set and family dining table',
          'Child-safe garden with grassy lawn for outdoor games',
          'Large open veranda with lounge chairs overlooking garden stream'
        ]
      },
      {
        category: 'Kitchen & Self-Catering',
        items: [
          'Full kitchen equipped with gas stove, refrigerator & utensils',
          'Rice cooker, blender, cookware and tableware provided',
          'Outdoor charcoal BBQ grill with skewers included',
          'Option to hire local village cook for on-site cooking'
        ]
      },
      {
        category: 'Bathrooms & Laundry',
        items: [
          '2 Clean full bathrooms with hot water showers',
          'Washing machine available for trekking laundry',
          'Fresh towels and linen provided for all guests'
        ]
      },
      {
        category: 'Access & Parking',
        items: [
          'Wide concrete driveway with parking for 3 vans / SUVs',
          'Easy ground-level access suitable for elderly family members',
          'Convenient access to Neluwa-Lankagama main route'
        ]
      }
    ],
    foodOptions: [
      'Self-cooking in equipped kitchen (Buy fresh village veggies locally)',
      'Cook-on-Demand (Village cook Mrs. Kanthi can prepare traditional meals)',
      'Family BBQ Evening Pack (Charcoal grill, marinated meat/fish)',
      'Traditional Village Breakfast (String hoppers, roti, pol sambol)'
    ],
    houseRules: [
      'Check-in: 02:00 PM | Check-out: 11:00 AM',
      'Please supervise small children when playing in garden stream',
      'Kitchen must be left reasonably clean after self-cooking',
      'Pets allowed on prior notice'
    ]
  }
];

export const CAMPING_GEAR: CampingGear[] = [
  {
    id: 'gear-pack-1',
    name: 'Full 4-Person Rainforest Wilderness Camp Set',
    sinhalaName: 'සම්පූර්ණ පුද්ගලයින් 4 කඳවුරු කට්ටලය',
    category: 'package',
    description: 'Everything you need for an unforgettable camping night in Lankagama. Heavy-duty waterproof tent resistant to rainforest downpours, thermal ground mats, cooking kit and high-beam lights.',
    includes: [
      '1x 4-Person Double-Layer Waterproof Tent (Rain-Proof 3000mm)',
      '4x Thermal Sleeping Bags + Ground Moisture Foam Mats',
      '1x Portable Butane Gas Camping Cooker + 2 Gas Cartridges',
      '1x Stainless Steel Mess Cookware Set (Pan, Pot, Kettle)',
      '2x 1000lm Rechargeable Waterproof Camp Lanterns + 2 Headlamps',
      '4x Anti-Leech Protection Socks (Complimentary Free Use)'
    ],
    pricePerDayLKR: 5500,
    capacity: 'Up to 4 Persons',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gear-pack-2',
    name: 'Couple Rainforest Adventure Camp Set',
    sinhalaName: 'පුද්ගලයින් 2 කූඩාරම් සහ කඳවුරු පැක්',
    category: 'package',
    description: 'Compact, ultra-comfortable 2-person camping setup ready to pitch beside the river or in approved camp zones.',
    includes: [
      '1x 2-Person Wind & Rain Shield Dome Tent',
      '2x Inflatable Sleeping Mats & Lightweight Warm Sleeping Bags',
      '1x Compact Gas Burner with Mini Gas Cylinder',
      '1x Camping Tea Kettle & Cups Set',
      '1x Multi-function LED Tent Lamp with Powerbank feature',
      '2x Leech Socks'
    ],
    pricePerDayLKR: 3800,
    capacity: '2 Persons',
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gear-pack-3',
    name: 'Night BBQ & Campfire Gathering Pack',
    sinhalaName: 'බාබකියු සහ රාත්‍රී ගිනිමැල කට්ටලය',
    category: 'accessory',
    description: 'Add sizzle to your Lankagama camping trip with our easy portable grill setup and firewood bundle.',
    includes: [
      'Heavy-Duty Portable Folding Charcoal BBQ Grill',
      'Stainless Steel Skewers, Meat Tongs & Grill Brush',
      '1x Bag of Coconut Shell Lump Charcoal (Burns for 3+ Hours)',
      'Dry Rainforest Firewood Bundle with Eco Firestarters',
      'Fire-safe Grill Table Mat'
    ],
    pricePerDayLKR: 2500,
    capacity: 'Group Add-on',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gear-item-1',
    name: 'Solo 4-Person Dome Tent (Tent Only)',
    sinhalaName: 'පුද්ගලයින් 4 ජලයට ඔරොත්තු දෙන කූඩාරම පමණක්',
    category: 'tent',
    description: 'Stand-alone double-layer waterproof 4-person tent with flysheet, pegs, and carry bag.',
    includes: ['Waterproof Dome Tent', 'Ground Pegs & Guy Lines', 'Carry Bag'],
    pricePerDayLKR: 2200,
    capacity: '4 Persons',
    imageUrl: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gear-item-2',
    name: 'Portable Gas Stove with 2x Cartridges',
    sinhalaName: 'ගෑස් ලිප සහ සිලින්ඩර් 2ක්',
    category: 'cooking',
    description: 'Easy-to-use safe butane burner stove in a hard carry case. Boil river water or cook quick noodles and tea.',
    includes: ['Single Burner Portable Stove', '2x Butane Gas Cartridges', 'Windshield Ring'],
    pricePerDayLKR: 1200,
    capacity: 'Cooking Kit',
    imageUrl: 'https://images.unsplash.com/photo-1525811902-f2342640856e?auto=format&fit=crop&w=800&q=80'
  }
];

export const TOUR_GUIDES: TourGuide[] = [
  {
    id: 'guide-1',
    name: 'Sunil Shantha',
    nickname: 'Lankagama Sunil Aiya',
    experienceYears: 14,
    languages: ['Sinhala (Native)', 'English (Conversational)'],
    specialties: ['Brahmana Ella & Duwili Ella Deep Waterfall Treks', 'Gin Ganga Secret Swimming Spots', 'Jungle Navigation & Safety'],
    dailyRateLKR: 4500,
    halfDayRateLKR: 2800,
    bio: 'Born and raised right in Lankagama village. Sunil knows every waterfall cascade, hidden canyon, and safe footstep in the Sinharaja buffer zone. He is legendary among travelers for his patient guidance, safety precautions against flash floods, and storytelling.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    verifiedLocal: true
  },
  {
    id: 'guide-2',
    name: 'Kavinda Wickramasinghe',
    nickname: 'Birding Kavinda',
    experienceYears: 9,
    languages: ['Sinhala (Native)', 'English (Fluent)', 'Tamil (Basic)'],
    specialties: ['Sinharaja Endemic Birds (Sri Lanka Blue Magpie, Serendib Scops Owl)', 'Herpetology & Frogs', 'Nature Photography'],
    dailyRateLKR: 5500,
    halfDayRateLKR: 3500,
    bio: 'Certified Department of Wildlife Conservation nature guide specializing in Sinharaja’s endemic biodiversity. If you are a photographer, birdwatcher, or nature lover, Kavinda will spot elusive frogs and rare birds you would otherwise walk straight past.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    verifiedLocal: true
  },
  {
    id: 'guide-3',
    name: 'Nalin Pradeep',
    nickname: 'Adventure Nalin',
    experienceYears: 7,
    languages: ['Sinhala (Native)', 'English (Conversational)'],
    specialties: ['Off-trail Trekking', 'Camping Site Selection & Campfire Setup', 'Night Rainforest Sound Walks'],
    dailyRateLKR: 4200,
    halfDayRateLKR: 2500,
    bio: 'Energetic youth guide from Lankagama with extensive wilderness survival and first-aid training. Great companion for active youth groups, camping parties, and adventurous hikers wanting to explore the scenic ridges around Lankagama.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    verifiedLocal: true
  }
];

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'attraction-1',
    name: 'Brahmana Ella Falls',
    badge: '35m Waterfall',
    description: 'The crowning jewel of Lankagama village, roaring down over tiered black rock cliffs into deep natural pools. Easily reachable from village villas with a 15-minute nature walk.',
    caution: 'Always bathe in designated calm rock pools; avoid slippery waterfall top ledges during rain.',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'attraction-2',
    name: 'Doowili Ella Falls',
    badge: 'Mist Waterfall',
    description: 'Named "Dust/Mist Falls" for the fine moisture cloud it creates as water plunges through dense rainforest canopy. A mesmerizing jungle trek through virgin rainforest.',
    caution: 'Requires a certified local guide due to dense forest paths and leeches.',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'attraction-3',
    name: 'Gin Ganga Natural Rock Pools',
    badge: 'Crystal River Bathing',
    description: 'Pristine, non-polluted headwaters of the Gin River flowing directly out of the Sinharaja reserve. Cool, crystal-clear water with natural fish pedicure.',
    caution: 'Do not use shampoo or chemical soaps to protect local fish and aquatic ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'attraction-4',
    name: 'Neluwa - Lankagama Scenic Route',
    badge: 'Scenic Road & Bridges',
    description: 'The scenic road connecting Neluwa to Lankagama winding parallel to Gin Ganga with scenic bridges. 4x4 or high clearance vehicle recommended during heavy monsoon.',
    caution: 'Drive slowly and respect wild animals crossing the road.',
    imageUrl: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80'
  }
];

export const KITHUL_PRODUCTS: KithulProduct[] = [
  {
    id: 'kithul-treacle-750',
    name: '100% Pure Sinharaja Kithul Treacle (750ml Bottle)',
    sinhalaName: 'සිංහරාජ පිරිසිදු කිතුල් පැණි (750ml බෝතලය)',
    category: 'treacle',
    description: 'Freshly slow-boiled sweet nectar extracted from wild Sinharaja rainforest Kithul palms in Lankagama. Absolutely zero added sugar, artificial sweeteners, or preservatives. Thick golden-amber consistency with an enchanting caramel aroma.',
    priceLKR: 2200,
    unit: 'bottle',
    weightOrVolume: '750ml Glass Bottle',
    purityBadge: '100% Pure Forest Grade',
    harvestOrigin: 'Upper Gin Ganga Valley Palms, Lankagama',
    deliveryNote: 'Delivered directly to your Villa or Campsite in Lankagama, or safely packed for air travel.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true
  },
  {
    id: 'kithul-treacle-clay-1000',
    name: 'Traditional Clay Pot Kithul Treacle (1L Kalagediya)',
    sinhalaName: 'නියම කැකුළු කිතුල් පැණි මැටි කලගෙඩිය (1L)',
    category: 'treacle',
    description: 'Poured while warm into an earthen unglazed clay pot that preserves the natural floral enzymes and imparts a soothing earthen aroma. Perfect companion with fresh buffalo curd, hoppers, or morning tea.',
    priceLKR: 3200,
    unit: 'clay pot',
    weightOrVolume: '1000ml Earthen Pot',
    purityBadge: 'Heritage Clay Vessel',
    harvestOrigin: 'Sinharaja Buffer Zone, Lankagama',
    deliveryNote: 'Delivered directly to your villa dining table for morning breakfast with curd.',
    imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: false
  },
  {
    id: 'kithul-jaggery-500',
    name: 'Authentic Lankagama Kithul Jaggery (500g Halves)',
    sinhalaName: 'නියම ලංකාගම කිතුල් හකුරු මුල් (500g)',
    category: 'jaggery',
    description: 'Handcrafted jaggery hemispheres set in dried coconut shell moulds. Velvety smooth texture that melts like fudge on the tongue with pure dark treacle notes. 100% genuine rainforest quality.',
    priceLKR: 1400,
    unit: 'pack',
    weightOrVolume: '500g (2 Whole Halves)',
    purityBadge: 'Sugar-Free Guarantee',
    harvestOrigin: 'Lankagama Village Home-Heaths',
    deliveryNote: 'Delivered fresh to your room for Ceylon tea pairing or souvenir takeaway.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true
  },
  {
    id: 'kithul-jaggery-1000',
    name: 'Sinharaja Palm Jaggery Master Block (1kg Bundle)',
    sinhalaName: 'සිංහරාජ බැමි කිතුල් හකුරු (1kg)',
    category: 'jaggery',
    description: 'Full 1kg bundle of freshly boiled pure Kithul jaggery wrapped in traditional dried palm leaves. Long shelf-life without chemical additives.',
    priceLKR: 2600,
    unit: 'bundle',
    weightOrVolume: '1kg Leaf Wrapped Bundle',
    purityBadge: 'Eco Palm Leaf Wrapped',
    harvestOrigin: 'Lankagama Forest Groves',
    deliveryNote: 'Delivered to your villa or dispatched via courier islandwide.',
    imageUrl: 'https://images.unsplash.com/photo-1606913084603-3e7702b01627?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: false
  },
  {
    id: 'kithul-toddy-bottle-1500',
    name: 'Freshly Tapped Sinharaja Kithul Raa (1.5L Chilled)',
    sinhalaName: 'නැවුම් ස්වාභාවික කිතුල් රා (1.5L සිසිල් කළ)',
    category: 'toddy',
    description: 'Tapped fresh at dawn from mature Sinharaja Kithul palms by registered village tappers. Naturally sweet, effervescent, and delightfully refreshing with pure jungle yeasts. No synthetic spirits or chemicals. Served chilled.',
    priceLKR: 1800,
    unit: 'bottle',
    weightOrVolume: '1.5L Cold Chilled Bottle',
    purityBadge: 'Daily Dawn Tapped',
    harvestOrigin: 'Lankagama Kithul Groves',
    deliveryNote: 'Delivered chilled directly to your villa balcony or campsite icebox.',
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true
  },
  {
    id: 'kithul-toddy-experience',
    name: 'Traditional Kithul Tapping & Fresh Toddy Tasting Tour',
    sinhalaName: 'කිතුල් මල කැපීම සහ නැවුම් රා රස විඳීමේ අත්දැකීම',
    category: 'experience',
    description: 'An unforgettable private rainforest cultural experience! Walk with our master village tapper into the lush palm groves. Witness the daring art of palm climbing, traditional inflorescence tapping, and sip sweet morning toddy straight from the fresh clay collection pot!',
    priceLKR: 4500,
    unit: 'group tour',
    weightOrVolume: 'Private Session (Up to 4 Trekkers)',
    purityBadge: 'Exclusive Living Experience',
    harvestOrigin: 'Rainforest Palm Canopies, Lankagama',
    deliveryNote: 'Guided walking departure directly from your villa in Lankagama (Morning 7:00 AM or Evening 4:30 PM).',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true
  }
];

export const CUSTOMER_COMMENTS: CustomerComment[] = [
  {
    id: 'rev-1',
    author: 'Dr. Shanil Wickramasinghe',
    cityOrCountry: 'Colombo, Sri Lanka',
    rating: 5,
    category: 'Pure Kithul & Hakuru',
    comment: 'We stayed at Sinharaja Gin Ganga River Edge Villa and ordered 3 bottles of Kithul Pani and jaggery through the site. It arrived at our villa within 30 minutes! The treacle is 100% pure—no sugar crystals, just that deep aromatic forest flavour with hoppers. We bought 6 more bottles to take to Colombo.',
    stayedAtOrOrdered: 'Sinharaja Gin Ganga River Edge Villa',
    createdAt: '2026-10-14',
    isVerified: true
  },
  {
    id: 'rev-2',
    author: 'Mark & Elena Schmidt',
    cityOrCountry: 'Munich, Germany',
    rating: 5,
    category: 'Fresh Raa Experience',
    comment: 'The fresh Kithul toddy experience was the highlight of our 2-week Sri Lanka holiday! The local tapper showed us how he climbs 50 feet up the palm with ropes. Drinking sweet, foaming toddy fresh from the clay pot in the cool morning mist was extraordinary. 10/10 authenticity!',
    stayedAtOrOrdered: 'Fresh Toddy Tasting Tour & Brahmana Lodge',
    createdAt: '2026-10-11',
    isVerified: true
  },
  {
    id: 'rev-3',
    author: 'Kavindi & Nimesh Ratnayake',
    cityOrCountry: 'Kandy, Sri Lanka',
    rating: 5,
    category: 'Villa Stay',
    comment: 'ලංකාගම එන්න කලින් හිතුවේ ගොඩක් අමාරු වෙයි කියලා. ඒත් The Sinharaja Collection හරහා Villa එකයි, Camping gear සෙට් එකයි, Tour Guide Sunil අයියවයි හැමදේම එකම තැනින් බුක් කරගත්තා. විලා එකටම නැවුම් කිතුල් පැණි සහ රා ගෙනත් දුන්න එක සුපිරි සේවාවක්!',
    stayedAtOrOrdered: 'Brahmana Ella Fall View Eco Lodge',
    createdAt: '2026-10-08',
    isVerified: true
  },
  {
    id: 'rev-4',
    author: 'Ruwan Jayakody',
    cityOrCountry: 'Galle, Sri Lanka',
    rating: 5,
    category: 'Camping Gear',
    comment: 'The 4-person waterproof tent pack withstood heavy evening rainforest showers without a single drop entering! Having the gas cooker and rechargeable lanterns included made camping by Gin Ganga super easy. Highly recommend getting everything from them in one go.',
    stayedAtOrOrdered: 'Full 4-Person Wilderness Camp Set',
    createdAt: '2026-10-02',
    isVerified: true
  },
  {
    id: 'rev-5',
    author: 'Sophie Dubois',
    cityOrCountry: 'Lyon, France',
    rating: 5,
    category: 'Pure Kithul & Hakuru',
    comment: 'Pure forest luxury. The clay pot kithul treacle with village curd for breakfast was divine. The agency team delivered everything right to our chalet deck with genuine Sri Lankan hospitality.',
    stayedAtOrOrdered: 'Lankagama Deep Forest Wooden Chalet',
    createdAt: '2026-09-28',
    isVerified: true
  },
  {
    id: 'rev-6',
    author: 'Ashen Bandara',
    cityOrCountry: 'Gampaha, Sri Lanka',
    rating: 5,
    category: 'Fresh Raa Experience',
    comment: 'කොළඹින් ගන්න තියෙන සීනි දාපු රා වගේ නෙවෙයි, මෙහේ තියෙන්නේ නියම ස්වාභාවික පැණි රස පිරිසිදු කිතුල් රා. විලා එකේ බැල්කනියටම ගෙනත් දුන්න සීතල බෝතල් දෙකෙන් සවස දියනාලා ඇවිත් ගත්ත ආතල් එක උපරිමයි!',
    stayedAtOrOrdered: 'Freshly Tapped Sinharaja Kithul Raa',
    createdAt: '2026-09-22',
    isVerified: true
  }
];

export const CUSTOMER_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq-101',
    name: 'Sanath Kulatunga',
    phone: '0773456789',
    email: 'sanath.k@gmail.com',
    subject: 'Kithul Treacle Delivery to Villa & 4WD Access',
    message: 'We are arriving at Gin Ganga River Edge Villa this Friday for 3 days. Can you deliver 4 bottles of pure Kithul treacle and 1kg jaggery on Saturday morning? Also is normal sedan car okay from Neluwa?',
    preferredVillaOrProduct: 'Sinharaja Gin Ganga River Edge Villa',
    status: 'contacted',
    createdAt: '2026-10-18T10:15:00.000Z'
  },
  {
    id: 'inq-102',
    name: 'Dilini Senaviratne',
    phone: '0718899221',
    email: 'dilini.s@yahoo.com',
    subject: 'Fresh Raa Tasting Experience for Group of 6',
    message: 'Can we book the live Kithul tapping and fresh Raa tasting session for 6 people on Sunday morning? Also want to know timing.',
    preferredVillaOrProduct: 'Fresh Toddy Tasting Tour',
    status: 'new',
    createdAt: '2026-10-19T14:30:00.000Z'
  }
];

