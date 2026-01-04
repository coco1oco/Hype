export const events = [
  {
    id: 'twice-this-is-for-manila',
    title: 'TWICE · “This Is For” Manila',
    tagline: 'A 360° stage experience that wrapped Philippine Arena in pink light.',
    category: 'Trending',
    tags: ['K-Pop', '360 Stage', 'Live Nation'],
    startTime: '2025-10-04T19:30:00+08:00',
    endTime: '2025-10-04T22:00:00+08:00',
    venue: 'Philippine Arena',
    city: 'Bulacan',
    address: 'Philippine Arena, Ciudad de Victoria, Bocaue, Bulacan',
    coordinates: {
      lat: 14.7991,
      lng: 120.9189
    },
    venueType: 'stadium',
    accessibility: true,
    description: 'TWICE’s “This Is For” world tour stop delivered a two-hour set packed with “Fancy,” “What Is Love?,” “Feel Special,” and new album cuts, all performed on a rotating 360-degree stage for ONCE PH.',
    heroColor: '#171339',
    heroAccent: '#ffb5e1',
    hypeScore: 97,
    cover: '/twice.jpg',
    organizer: {
      name: 'Live Nation Philippines',
      contact: 'info@livenation.ph'
    },
    metrics: {
      views: 6100,
      buyers: 2050,
      recency: 0.97,
    },
    tiers: [
      {
        id: 'twice-thisisfor-vip',
        name: 'VIP 360 Soundcheck',
        price: 16250,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Soundcheck access', '360° floor pit', 'Pink lanyard set'],
        capacity: 450
      },
      {
        id: 'twice-thisisfor-lowerbox',
        name: 'Lower Box 360',
        price: 9800,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Lower box seating', 'LED wristband sync', 'Digital pass'],
        capacity: 2100
      },
      {
        id: 'twice-thisisfor-upperbox',
        name: 'Upper Box Premium',
        price: 5800,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Upper box seating', 'Souvenir laminate'],
        capacity: 4800
      }
    ],
  },
  {
    id: 'blackpink-deadline-manila',
    title: 'BLACKPINK WORLD TOUR <DEADLINE>',
    tagline: 'A cinematic, monochrome finale that just lit up Manila.',
    category: 'Fan Favorite',
    tags: ['K-Pop', 'Arena', 'Immersive'],
    startTime: '2025-11-20T20:00:00+08:00',
    endTime: '2025-11-20T23:30:00+08:00',
    venue: 'Philippine Arena',
    city: 'Bulacan',
    address: 'Philippine Arena, Ciudad de Victoria, Bocaue, Bulacan',
    coordinates: {
      lat: 14.7991,
      lng: 120.9189
    },
    venueType: 'stadium',
    accessibility: true,
    description: 'A limited-run <DEADLINE> stop with monochrome visuals, orchestral remixes, and a surprise final act for Filipino BLINKs.',
    heroColor: '#05020d',
    heroAccent: '#f4b2d6',
    hypeScore: 98,
    cover: '/blackpink.jpg',
    organizer: {
      name: 'YG Entertainment',
      contact: 'events@ygent.com'
    },
    metrics: {
      views: 6400,
      buyers: 2100,
      recency: 0.99,
    },
    tiers: [
      {
        id: 'blackpink-deadline-vip',
        name: 'VIP Deadline Pit',
        price: 18500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Soundcheck film session', 'Exclusive monochrome merch kit', 'Early entry'],
        capacity: 400
      },
      {
        id: 'blackpink-deadline-lowerbox',
        name: 'Lower Box Premiere',
        price: 9800,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Reserved seating', 'LED wristband sync', 'Digital keepsake pass'],
        capacity: 3500
      }
    ],
  },
  {
    id: 'tyla-we-wanna-party-manila',
    title: 'Tyla · We Wanna Party Asia in Manila',
    tagline: 'Grammy-winning amapiano energy takes over MOA Arena.',
    category: 'Trending',
    tags: ['Pop', 'Amapiano', 'Asia Tour'],
    startTime: '2025-12-03T20:00:00+08:00',
    endTime: '2025-12-03T23:00:00+08:00',
    venue: 'SM Mall of Asia Arena',
    city: 'Pasay',
    address: 'SM Mall of Asia Arena, JW Diokno Blvd, Pasay City',
    coordinates: {
      lat: 14.5352,
      lng: 120.9822
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Tyla’s first Manila show brings the “We Wanna Party” Asia tour to MOA Arena with a bass-heavy set built around “Water,” “ART,” and amapiano reworks of fan favorites.',
    heroColor: '#1d0f2a',
    heroAccent: '#ff9ed1',
    hypeScore: 89,
    cover: '/tyla.jpg',
    organizer: {
      name: 'Live Nation Philippines',
      contact: 'info@livenation.ph'
    },
    metrics: {
      views: 3200,
      buyers: 1200,
      recency: 0.85,
    },
    tiers: [
      {
        id: 'tyla-vip-soundcheck',
        name: 'VIP Dancefloor + Soundcheck',
        price: 14500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Preshow soundcheck party', 'Front dancefloor access', 'Exclusive tour laminate'],
        capacity: 350
      },
      {
        id: 'tyla-lower-box',
        name: 'Lower Box Groove',
        price: 8250,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Lower box seating', 'LED wristband', 'Digital zine'],
        capacity: 2500
      },
      {
        id: 'tyla-upper-box',
        name: 'Upper Box Vibes',
        price: 4200,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Upper box seating', 'Merch coupon'],
        capacity: 4800
      }
    ],
  },
  {
    id: 'day6-decade-manila',
    title: 'DAY6 10th Anniversary Tour <The DECADE>',
    tagline: 'A full-band celebration of a decade of DAY6 anthems.',
    category: 'Fan Favorite',
    tags: ['K-Band', 'Anniversary', 'Live'],
    startTime: '2025-12-14T19:00:00+08:00',
    endTime: '2025-12-14T22:00:00+08:00',
    venue: 'SM Mall of Asia Arena',
    city: 'Pasay',
    address: 'SM Mall of Asia Arena, JW Diokno Blvd, Pasay City',
    coordinates: {
      lat: 14.5352,
      lng: 120.9822
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'DAY6 marks ten years with “The DECADE,” a Manila stop featuring orchestral intros, extended jams of “You Were Beautiful,” “Time of Our Life,” and fan-selected deep cuts.',
    heroColor: '#081424',
    heroAccent: '#6ad1ff',
    hypeScore: 85,
    cover: '/day6.jpg',
    organizer: {
      name: 'JYP Entertainment',
      contact: 'events@jyptheatre.com'
    },
    metrics: {
      views: 2700,
      buyers: 980,
      recency: 0.81,
    },
    tiers: [
      {
        id: 'day6-vip-soundcheck',
        name: 'VIP Soundcheck',
        price: 13500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Soundcheck entry', 'Hi-touch photo moment', 'Anniversary badge set'],
        capacity: 400
      },
      {
        id: 'day6-lower-box',
        name: 'Lower Box Anniversary',
        price: 7800,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Lower box seating', 'Collectible ticket', 'Digital photo book'],
        capacity: 2600
      },
      {
        id: 'day6-upper-box',
        name: 'Upper Box Celebration',
        price: 4200,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Upper box seating', 'LED wristband'],
        capacity: 5000
      }
    ],
  },
  {
    id: 'tech-workshop-2025',
    title: 'Web Development Masterclass 2025',
    tagline: 'Learn modern web technologies from industry experts.',
    category: 'Chill',
    tags: ['Workshop', 'Education', 'Tech'],
    startTime: '2025-03-10T09:00:00+08:00',
    endTime: '2025-03-10T17:00:00+08:00',
    venue: 'SMX Convention Center',
    city: 'Pasay',
    address: 'SMX Convention Center, SM Mall of Asia Complex, Pasay City',
    coordinates: {
      lat: 14.5316,
      lng: 120.9816
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'A comprehensive workshop covering React, Node.js, and modern development practices. Includes hands-on coding sessions and networking opportunities.',
    heroColor: '#0a1929',
    heroAccent: '#61dafb',
    hypeScore: 68,
    cover: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'Tech Community PH',
      contact: 'hello@techcommunity.ph'
    },
    metrics: {
      views: 1200,
      buyers: 350,
      recency: 0.65,
    },
    tiers: [
      {
        id: 'workshop-early',
        name: 'Early Bird',
        price: 2500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Full day access', 'Lunch included', 'Workshop materials'],
        capacity: 100
      },
      {
        id: 'workshop-regular',
        name: 'Regular',
        price: 3500,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Full day access', 'Workshop materials'],
        capacity: 200
      }
    ],
  },
  {
    id: 'jazz-night-makati',
    title: 'Smooth Jazz Night at The Peninsula',
    tagline: 'An intimate evening of jazz and cocktails.',
    category: 'Niche',
    tags: ['Jazz', 'Music', 'Nightlife'],
    startTime: '2025-02-28T20:00:00+08:00',
    endTime: '2025-02-28T23:00:00+08:00',
    venue: 'The Peninsula Manila',
    city: 'Makati',
    address: 'The Peninsula Manila, Corner of Ayala and Makati Avenues, Makati',
    coordinates: {
      lat: 14.5536,
      lng: 121.026
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Experience an elegant evening of smooth jazz performances featuring local and international artists. Includes welcome drinks and light refreshments.',
    heroColor: '#1a1a2e',
    heroAccent: '#f4a261',
    hypeScore: 72,
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'Jazz Society Manila',
      contact: 'events@jazzsociety.ph'
    },
    metrics: {
      views: 850,
      buyers: 280,
      recency: 0.71,
    },
    tiers: [
      {
        id: 'jazz-standard',
        name: 'Standard',
        price: 3500,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Event access', 'Welcome drink', 'Light refreshments'],
        capacity: 150
      },
      {
        id: 'jazz-vip',
        name: 'VIP',
        price: 6500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['VIP seating', 'Premium drinks', 'Meet & greet'],
        capacity: 30
      }
    ],
  },
  {
    id: 'c-old-start-2025-hackathon',
    title: 'C(old) (St)art 2025 Hackathon',
    tagline: '48 hours of code, caffeine, and chaos for student builders.',
    category: 'Chill',
    tags: ['Hackathon', 'Students', 'Tech'],
    startTime: '2025-11-29T09:00:00+08:00',
    endTime: '2025-11-30T21:00:00+08:00',
    venue: 'The Linden Suites',
    city: 'Ortigas',
    address: 'The Linden Suites, Ortigas Center, Pasig City',
    coordinates: {
      lat: 14.5867,
      lng: 121.0563
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'A student-centered hackathon where teams ship wild prototypes over one weekend, from AI side projects to playful campus tools.',
    heroColor: '#050816',
    heroAccent: '#64ffda',
    hypeScore: 82,
    cover: '/cs.png',
    organizer: {
      name: 'Campus Creators PH',
      contact: 'hello@campuscreators.ph'
    },
    metrics: {
      views: 1900,
      buyers: 420,
      recency: 0.8,
    },
    tiers: [
      {
        id: 'coldstart-team-pass',
        name: 'Team Pass',
        price: 0,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Team of up to 4', 'Meals & swag'],
        capacity: 200
      }
    ],
  },
  {
    id: 'ygg-play-summit',
    title: 'YGG Play Summit',
    tagline: 'Web3 gaming, guilds, and play economies in one roof.',
    category: 'Trending',
    tags: ['Web3', 'Gaming', 'Conference'],
    startTime: '2025-09-06T10:00:00+08:00',
    endTime: '2025-09-06T19:00:00+08:00',
    venue: 'SMX Convention Center',
    city: 'Pasay',
    address: 'SMX Convention Center, SM Mall of Asia Complex, Pasay City',
    coordinates: {
      lat: 14.5316,
      lng: 120.9816
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Guild leaders, devs, and players gather for a day of talks, live tournaments, and hands-on demos of the next wave of play-and-own titles.',
    heroColor: '#05020d',
    heroAccent: '#ffdd57',
    hypeScore: 88,
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'Yield Guild Games',
      contact: 'events@ygg.games'
    },
    metrics: {
      views: 3100,
      buyers: 1150,
      recency: 0.9,
    },
    tiers: [
      {
        id: 'ygg-general',
        name: 'General Pass',
        price: 1800,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Main stage access', 'Expo floor', 'Loot quest'],
        capacity: 1500
      },
      {
        id: 'ygg-vip',
        name: 'Guild VIP',
        price: 4200,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['VIP lounge', 'Speaker meet & greet', 'Priority seating'],
        capacity: 150
      }
    ],
  },
  {
    id: 'superai-conference-singapore',
    title: 'SuperAI Conference',
    tagline: 'Where frontier AI builders, founders, and researchers collide.',
    category: 'Fan Favorite',
    tags: ['AI', 'Conference', 'Founders'],
    startTime: '2025-07-18T09:00:00+08:00',
    endTime: '2025-07-19T18:00:00+08:00',
    venue: 'Marina Bay Sands Expo',
    city: 'Singapore',
    address: '10 Bayfront Ave, Singapore',
    coordinates: {
      lat: 1.2834,
      lng: 103.8607
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Two days of keynotes, demos, and hallway conversations around AI agents, infrastructure, and real-world deployments.',
    heroColor: '#040b1a',
    heroAccent: '#00d4ff',
    hypeScore: 94,
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'SuperAI',
      contact: 'hello@superai.io'
    },
    metrics: {
      views: 5400,
      buyers: 2100,
      recency: 0.96,
    },
    tiers: [
      {
        id: 'superai-standard',
        name: 'Standard Pass',
        price: 520,
        currency: 'USD',
        availability: 'Available',
        perks: ['2-day conference', 'Expo', 'Recorded talks'],
        capacity: 2500
      },
      {
        id: 'superai-founder',
        name: 'Founder & Operator',
        price: 780,
        currency: 'USD',
        availability: 'Limited',
        perks: ['Curated networking', 'Private roundtables'],
        capacity: 500
      }
    ],
  },
  {
    id: 'flair-dlsud',
    title: 'Flair DLSU-D',
    tagline: 'A campus festival for creators, performers, and student founders.',
    category: 'Chill',
    tags: ['Campus', 'Festival', 'Student'],
    startTime: '2025-09-27T15:00:00+08:00',
    endTime: '2025-09-27T23:00:00+08:00',
    venue: 'De La Salle University-Dasmariñas Oval',
    city: 'Dasmariñas',
    address: 'DLSU-D, Dasmariñas, Cavite',
    coordinates: {
      lat: 14.2995,
      lng: 120.9571
    },
    venueType: 'outdoor',
    accessibility: true,
    description: 'An all-evening student fair with live bands, founder booths, art pop-ups, and food trucks under campus lights.',
    heroColor: '#1b0b2e',
    heroAccent: '#ff6f91',
    hypeScore: 79,
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'DLSU-D Student Government',
      contact: 'sg@dlsud.edu.ph'
    },
    metrics: {
      views: 1800,
      buyers: 750,
      recency: 0.83,
    },
    tiers: [
      {
        id: 'flair-gen-ad',
        name: 'General Admission',
        price: 350,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Festival access', 'Main stage'],
        capacity: 4000
      },
      {
        id: 'flair-pit',
        name: 'Pit Pass',
        price: 650,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Front-of-stage pit', 'Exclusive wristband'],
        capacity: 600
      }
    ],
  },
  {
    id: 'paskuhan-up-diliman',
    title: 'Paskuhan UP Diliman',
    tagline: 'Lanterns, food stalls, and live acts across the Sunken Garden.',
    category: 'Fan Favorite',
    tags: ['Campus', 'Holiday', 'Festival'],
    startTime: '2025-12-15T16:00:00+08:00',
    endTime: '2025-12-15T23:59:00+08:00',
    venue: 'UP Diliman Sunken Garden',
    city: 'Quezon City',
    address: 'UP Diliman, Quezon City, Metro Manila',
    coordinates: {
      lat: 14.6549,
      lng: 121.0647
    },
    venueType: 'outdoor',
    accessibility: true,
    description: 'The iconic year-end Paskuhan with lantern parades, org booths, and bands playing into the night.',
    heroColor: '#0c1a24',
    heroAccent: '#ffd166',
    hypeScore: 92,
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'UP Diliman',
      contact: 'events@upd.edu.ph'
    },
    metrics: {
      views: 4200,
      buyers: 1800,
      recency: 0.9,
    },
    tiers: [
      {
        id: 'paskuhan-field',
        name: 'Field Access',
        price: 250,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Field access', 'Stage viewing'],
        capacity: 8000
      },
      {
        id: 'paskuhan-grandstand',
        name: 'Grandstand Seats',
        price: 450,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Reserved seating', 'Better stage view'],
        capacity: 1500
      }
    ],
  },
  {
    id: 'malayang-diwa-fest-cvsu',
    title: 'Malayang Diwa Fest Cavite State University',
    tagline: 'A day of music, art, and advocacy in CvSU.',
    category: 'Niche',
    tags: ['Campus', 'Festival', 'Advocacy'],
    startTime: '2025-09-13T14:00:00+08:00',
    endTime: '2025-09-13T22:30:00+08:00',
    venue: 'Cavite State University Main Campus Grounds',
    city: 'Indang',
    address: 'CvSU Main Campus, Indang, Cavite',
    coordinates: {
      lat: 14.1926,
      lng: 120.8764
    },
    venueType: 'outdoor',
    accessibility: true,
    description: 'A student-organized fest mixing spoken word, campus bands, and org booths centered on free expression and community.',
    heroColor: '#1c1124',
    heroAccent: '#f78da7',
    hypeScore: 76,
    cover: '/cvsu.jpg',
    organizer: {
      name: 'CvSU Central Student Government',
      contact: 'csg@cvsu.edu.ph'
    },
    metrics: {
      views: 1600,
      buyers: 620,
      recency: 0.82,
    },
    tiers: [
      {
        id: 'malayang-gen-ad',
        name: 'General Admission',
        price: 300,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Grounds access', 'Main stage'],
        capacity: 5000
      }
    ],
  },
  {
    id: 'hamilton-manila',
    title: 'Hamilton',
    tagline: 'The international tour of the Broadway phenomenon arrives in Manila.',
    category: 'Fan Favorite',
    tags: ['Musical', 'Theatre', 'Broadway'],
    startTime: '2025-06-21T20:00:00+08:00',
    endTime: '2025-06-21T23:00:00+08:00',
    venue: 'The Theatre at Solaire',
    city: 'Parañaque',
    address: '1 Asean Ave, Parañaque, Metro Manila',
    coordinates: {
      lat: 14.5213,
      lng: 120.9832
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Lin-Manuel Miranda’s Tony Award-winning musical about Alexander Hamilton, staged with the original creative team’s touring production.',
    heroColor: '#1b1206',
    heroAccent: '#f2c94c',
    hypeScore: 95,
    cover: '/ham.jpg',
    organizer: {
      name: 'GMG Productions',
      contact: 'tickets@gmgproductions.com'
    },
    metrics: {
      views: 5800,
      buyers: 2300,
      recency: 0.97,
    },
    tiers: [
      {
        id: 'hamilton-orchestra',
        name: 'Orchestra',
        price: 12500,
        currency: 'PHP',
        availability: 'Limited',
        perks: ['Best seats', 'Souvenir playbill'],
        capacity: 400
      },
      {
        id: 'hamilton-mezzanine',
        name: 'Mezzanine',
        price: 8200,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Balcony seating', 'Playbill'],
        capacity: 600
      }
    ],
  },
  {
    id: 'aws-innovation-cup-2025',
    title: 'AWS Innovation Cup 2025',
    tagline: 'A builder competition for cloud-native, AI, and startup teams.',
    category: 'Trending',
    tags: ['AWS', 'Hackathon', 'Cloud'],
    startTime: '2025-11-08T09:00:00+08:00',
    endTime: '2025-11-09T18:00:00+08:00',
    venue: 'AWS Manila Office & Virtual',
    city: 'Taguig',
    address: 'Bonifacio Global City, Taguig, Metro Manila',
    coordinates: {
      lat: 14.5491,
      lng: 121.0463
    },
    venueType: 'indoor',
    accessibility: true,
    description: 'Teams prototype cloud-native solutions with mentorship from AWS SA\'s and compete for credits, swag, and spotlight time.',
    heroColor: '#0b1829',
    heroAccent: '#ff9900',
    hypeScore: 87,
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: 'Amazon Web Services',
      contact: 'events-asean@amazon.com'
    },
    metrics: {
      views: 2600,
      buyers: 900,
      recency: 0.88,
    },
    tiers: [
      {
        id: 'aws-team-pass',
        name: 'Team Pass',
        price: 0,
        currency: 'PHP',
        availability: 'Available',
        perks: ['Team of up to 5', 'Mentorship', 'AWS credits (for winners)'],
        capacity: 80
      }
    ],
  },
]

export const getEventById = (id) => events.find(e => e.id === id)

export const filterEvents = (filters) => {
  let filtered = [...events]

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(e => e.category === filters.category)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  if (filters.date) {
    filtered = filtered.filter(e => {
      const eventDate = new Date(e.startTime).toISOString().split('T')[0]
      return eventDate === filters.date
    })
  }

  if (filters.location) {
    const locationLower = filters.location.toLowerCase()
    filtered = filtered.filter(e =>
      e.city.toLowerCase().includes(locationLower) ||
      e.venue.toLowerCase().includes(locationLower)
    )
  }

  return filtered
}

