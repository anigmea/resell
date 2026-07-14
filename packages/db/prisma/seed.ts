import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Simple hash for seed users (not bcrypt to avoid dep in seed)
const hash = (pw: string) => createHash('sha256').update(pw).digest('hex')

async function main() {
  console.log('Seeding database...')

  // ── Venues ───────────────────────────────────────────────────────────────
  const [dyPatil, wankhede, lalbhaiStadium, chinnaswamy, indiraGandhi] =
    await Promise.all([
      prisma.venue.upsert({
        where:  { id: 'venue-dy-patil' },
        update: {},
        create: {
          id:       'venue-dy-patil',
          name:     'DY Patil Stadium',
          city:     'Mumbai',
          address:  'Sector 7, Nerul, Navi Mumbai, Maharashtra 400706',
          mapsUrl:  'https://maps.google.com/?q=DY+Patil+Stadium',
          capacity: 55000,
        },
      }),
      prisma.venue.upsert({
        where:  { id: 'venue-wankhede' },
        update: {},
        create: {
          id:       'venue-wankhede',
          name:     'Wankhede Stadium',
          city:     'Mumbai',
          address:  'D Rd, Churchgate, Mumbai, Maharashtra 400020',
          mapsUrl:  'https://maps.google.com/?q=Wankhede+Stadium',
          capacity: 33108,
        },
      }),
      prisma.venue.upsert({
        where:  { id: 'venue-lalbhai' },
        update: {},
        create: {
          id:       'venue-lalbhai',
          name:     'Lalbhai Contractor Stadium',
          city:     'Delhi',
          address:  'Surat, Gujarat 395007',
          mapsUrl:  'https://maps.google.com/?q=Lalbhai+Contractor+Stadium',
          capacity: 28000,
        },
      }),
      prisma.venue.upsert({
        where:  { id: 'venue-chinnaswamy' },
        update: {},
        create: {
          id:       'venue-chinnaswamy',
          name:     'M. Chinnaswamy Stadium',
          city:     'Bangalore',
          address:  'MG Rd, Shivajinagar, Bengaluru, Karnataka 560001',
          mapsUrl:  'https://maps.google.com/?q=Chinnaswamy+Stadium',
          capacity: 40000,
        },
      }),
      prisma.venue.upsert({
        where:  { id: 'venue-indira-gandhi' },
        update: {},
        create: {
          id:       'venue-indira-gandhi',
          name:     'Indira Gandhi Arena',
          city:     'Delhi',
          address:  'Indraprastha Estate, New Delhi 110002',
          mapsUrl:  'https://maps.google.com/?q=Indira+Gandhi+Arena+Delhi',
          capacity: 16000,
        },
      }),
    ])

  console.log('  ✓ Venues')

  // ── Events ────────────────────────────────────────────────────────────────
  const [
    coldplay, ipl1, ipl2, comedy1, comedy2,
    festival1, concert2, sports3, comedy3, concert3, other1, sports4,
  ] = await Promise.all([
    prisma.event.upsert({
      where:  { id: 'event-coldplay' },
      update: {},
      create: {
        id:          'event-coldplay',
        title:       'Coldplay: Music of the Spheres World Tour',
        description: 'Experience Coldplay live in their record-breaking global tour with full production including drone shows, light wristbands, and pyrotechnics.',
        category:    'CONCERT',
        venueId:     dyPatil.id,
        organizer:   'BookMyShow Live',
        dateTime:    new Date('2026-12-01T19:00:00+05:30'),
        city:        'Mumbai',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-ipl-mi-csk' },
      update: {},
      create: {
        id:          'event-ipl-mi-csk',
        title:       'IPL 2026: Mumbai Indians vs Chennai Super Kings',
        description: 'The most awaited IPL rivalry — MI vs CSK at Wankhede. Expect fireworks on and off the pitch.',
        category:    'SPORTS',
        venueId:     wankhede.id,
        organizer:   'Board of Control for Cricket in India',
        dateTime:    new Date('2026-04-18T19:30:00+05:30'),
        city:        'Mumbai',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-ipl-rcb-dc' },
      update: {},
      create: {
        id:          'event-ipl-rcb-dc',
        title:       'IPL 2026: Royal Challengers vs Delhi Capitals',
        description: 'RCB's home fortress — come witness the roaring crowd at Chinnaswamy.',
        category:    'SPORTS',
        venueId:     chinnaswamy.id,
        organizer:   'Board of Control for Cricket in India',
        dateTime:    new Date('2026-04-25T15:30:00+05:30'),
        city:        'Bangalore',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-zakir-mumbai' },
      update: {},
      create: {
        id:          'event-zakir-mumbai',
        title:       'Zakir Khan: Tathastu Live',
        description: 'Zakir Khan brings his acclaimed solo show Tathastu to Mumbai — an evening of relatable stories and sharp wit.',
        category:    'COMEDY',
        venueId:     dyPatil.id,
        organizer:   'Insider Live',
        dateTime:    new Date('2026-09-12T20:00:00+05:30'),
        city:        'Mumbai',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-kenny-delhi' },
      update: {},
      create: {
        id:          'event-kenny-delhi',
        title:       'Kenny Sebastian: Don\'t Be That Guy',
        description: 'Kenny Sebastian's newest hour of stand-up, performing live in Delhi.',
        category:    'COMEDY',
        venueId:     indiraGandhi.id,
        organizer:   'Comedy Club India',
        dateTime:    new Date('2026-10-05T19:30:00+05:30'),
        city:        'Delhi',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-sunburn' },
      update: {},
      create: {
        id:          'event-sunburn',
        title:       'Sunburn Festival 2026',
        description: 'Asia\'s biggest EDM festival returns with 3 days of music, art, and culture featuring global headliners.',
        category:    'FESTIVAL',
        venueId:     dyPatil.id,
        organizer:   'Percept Live',
        dateTime:    new Date('2026-12-27T16:00:00+05:30'),
        city:        'Mumbai',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-arijit-bangalore' },
      update: {},
      create: {
        id:          'event-arijit-bangalore',
        title:       'Arijit Singh Live in Concert',
        description: 'The voice of a generation — Arijit Singh performs his greatest hits live in Bangalore.',
        category:    'CONCERT',
        venueId:     chinnaswamy.id,
        organizer:   'BookMyShow Live',
        dateTime:    new Date('2026-11-08T18:30:00+05:30'),
        city:        'Bangalore',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-proKabaddi' },
      update: {},
      create: {
        id:          'event-proKabaddi',
        title:       'Pro Kabaddi League: Season 12 Finals',
        description: 'The grand finale of Pro Kabaddi League Season 12, featuring the top two teams battling for the championship.',
        category:    'SPORTS',
        venueId:     indiraGandhi.id,
        organizer:   'Star Sports',
        dateTime:    new Date('2026-10-20T19:00:00+05:30'),
        city:        'Delhi',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-biswa-bangalore' },
      update: {},
      create: {
        id:          'event-biswa-bangalore',
        title:       'Biswa Kalyan Rath: Sushi',
        description: 'Biswa brings his new stand-up special Sushi to Bangalore — smart, dry, and brilliantly observed.',
        category:    'COMEDY',
        venueId:     chinnaswamy.id,
        organizer:   'Paytm Insider',
        dateTime:    new Date('2026-08-30T20:00:00+05:30'),
        city:        'Bangalore',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-dua-lipa-delhi' },
      update: {},
      create: {
        id:          'event-dua-lipa-delhi',
        title:       'Dua Lipa: Radical Optimism Tour',
        description: 'Dua Lipa makes her India debut with the Radical Optimism tour, an electrifying pop spectacle.',
        category:    'CONCERT',
        venueId:     indiraGandhi.id,
        organizer:   'Live Nation India',
        dateTime:    new Date('2026-11-22T19:00:00+05:30'),
        city:        'Delhi',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-nh7' },
      update: {},
      create: {
        id:          'event-nh7',
        title:       'NH7 Weekender Bangalore 2026',
        description: 'India\'s happiest music festival returns to Bangalore with an eclectic mix of indie, rock, and electronic acts.',
        category:    'FESTIVAL',
        venueId:     chinnaswamy.id,
        organizer:   'Only Much Louder',
        dateTime:    new Date('2026-11-14T12:00:00+05:30'),
        city:        'Bangalore',
        status:      'UPCOMING',
      },
    }),
    prisma.event.upsert({
      where:  { id: 'event-ipl-mi-kkr' },
      update: {},
      create: {
        id:          'event-ipl-mi-kkr',
        title:       'IPL 2026: Mumbai Indians vs Kolkata Knight Riders',
        description: 'Two of IPL\'s most successful franchises face off at Wankhede.',
        category:    'SPORTS',
        venueId:     wankhede.id,
        organizer:   'Board of Control for Cricket in India',
        dateTime:    new Date('2026-05-02T19:30:00+05:30'),
        city:        'Mumbai',
        status:      'UPCOMING',
      },
    }),
  ])

  console.log('  ✓ Events')

  // ── Users ─────────────────────────────────────────────────────────────────
  const [seller1, seller2, seller3, buyer1, buyer2, admin] = await Promise.all([
    prisma.user.upsert({
      where:  { email: 'rahul.seller@example.com' },
      update: {},
      create: {
        id:            'user-seller-1',
        name:          'Rahul Sharma',
        email:         'rahul.seller@example.com',
        phone:         '+919876543210',
        passwordHash:  hash('password123'),
        role:          'SELLER',
        phoneVerified: true,
        kycStatus:     'VERIFIED',
        upiId:         'rahul@upi',
      },
    }),
    prisma.user.upsert({
      where:  { email: 'priya.seller@example.com' },
      update: {},
      create: {
        id:            'user-seller-2',
        name:          'Priya Mehta',
        email:         'priya.seller@example.com',
        phone:         '+919876543211',
        passwordHash:  hash('password123'),
        role:          'SELLER',
        phoneVerified: true,
        kycStatus:     'VERIFIED',
        upiId:         'priya@upi',
      },
    }),
    prisma.user.upsert({
      where:  { email: 'arjun.seller@example.com' },
      update: {},
      create: {
        id:            'user-seller-3',
        name:          'Arjun Nair',
        email:         'arjun.seller@example.com',
        phone:         '+919876543212',
        passwordHash:  hash('password123'),
        role:          'SELLER',
        phoneVerified: true,
        kycStatus:     'VERIFIED',
        upiId:         'arjun@upi',
      },
    }),
    prisma.user.upsert({
      where:  { email: 'sneha.buyer@example.com' },
      update: {},
      create: {
        id:            'user-buyer-1',
        name:          'Sneha Kulkarni',
        email:         'sneha.buyer@example.com',
        phone:         '+919876543213',
        passwordHash:  hash('password123'),
        role:          'BUYER',
        phoneVerified: true,
        kycStatus:     'UNVERIFIED',
      },
    }),
    prisma.user.upsert({
      where:  { email: 'vikram.buyer@example.com' },
      update: {},
      create: {
        id:            'user-buyer-2',
        name:          'Vikram Singh',
        email:         'vikram.buyer@example.com',
        phone:         '+919876543214',
        passwordHash:  hash('password123'),
        role:          'BUYER',
        phoneVerified: true,
        kycStatus:     'UNVERIFIED',
      },
    }),
    prisma.user.upsert({
      where:  { email: 'admin@resell.in' },
      update: {},
      create: {
        id:            'user-admin',
        name:          'Resell Admin',
        email:         'admin@resell.in',
        phone:         '+919000000000',
        passwordHash:  hash('admin123'),
        role:          'ADMIN',
        phoneVerified: true,
        kycStatus:     'VERIFIED',
      },
    }),
  ])

  console.log('  ✓ Users')

  // ── Listings ──────────────────────────────────────────────────────────────
  const listings = await Promise.all([
    // Coldplay — active listings
    prisma.listing.upsert({
      where:  { id: 'listing-cold-1' },
      update: {},
      create: {
        id:            'listing-cold-1',
        eventId:       coldplay.id,
        sellerId:      seller1.id,
        seatSection:   'Silver',
        seatRow:       'G',
        seatNumber:    '24',
        originalPrice: 750000,  // ₹7,500
        askingPrice:   1200000, // ₹12,000
        ticketFileUrl: 'https://example.com/tickets/cold-1.pdf',
        status:        'ACTIVE',
      },
    }),
    prisma.listing.upsert({
      where:  { id: 'listing-cold-2' },
      update: {},
      create: {
        id:            'listing-cold-2',
        eventId:       coldplay.id,
        sellerId:      seller2.id,
        seatSection:   'Gold',
        seatRow:       'C',
        seatNumber:    '12',
        originalPrice: 1200000,
        askingPrice:   2500000, // ₹25,000
        ticketFileUrl: 'https://example.com/tickets/cold-2.pdf',
        status:        'ACTIVE',
      },
    }),
    prisma.listing.upsert({
      where:  { id: 'listing-cold-3' },
      update: {},
      create: {
        id:            'listing-cold-3',
        eventId:       coldplay.id,
        sellerId:      seller3.id,
        seatSection:   'Platinum',
        seatRow:       'A',
        seatNumber:    '5',
        originalPrice: 2000000,
        askingPrice:   4500000, // ₹45,000
        ticketFileUrl: 'https://example.com/tickets/cold-3.pdf',
        status:        'ACTIVE',
      },
    }),
    // IPL MI vs CSK
    prisma.listing.upsert({
      where:  { id: 'listing-ipl1-1' },
      update: {},
      create: {
        id:            'listing-ipl1-1',
        eventId:       ipl1.id,
        sellerId:      seller1.id,
        seatSection:   'North Stand',
        seatRow:       'D',
        originalPrice: 250000,
        askingPrice:   400000,
        ticketFileUrl: 'https://example.com/tickets/ipl1-1.pdf',
        status:        'ACTIVE',
      },
    }),
    prisma.listing.upsert({
      where:  { id: 'listing-ipl1-2' },
      update: {},
      create: {
        id:            'listing-ipl1-2',
        eventId:       ipl1.id,
        sellerId:      seller2.id,
        seatSection:   'Premium',
        seatRow:       'B',
        seatNumber:    '8',
        originalPrice: 500000,
        askingPrice:   800000,
        ticketFileUrl: 'https://example.com/tickets/ipl1-2.pdf',
        status:        'ACTIVE',
      },
    }),
    // RCB vs DC
    prisma.listing.upsert({
      where:  { id: 'listing-ipl2-1' },
      update: {},
      create: {
        id:            'listing-ipl2-1',
        eventId:       ipl2.id,
        sellerId:      seller3.id,
        seatSection:   'East Stand',
        originalPrice: 300000,
        askingPrice:   550000,
        ticketFileUrl: 'https://example.com/tickets/ipl2-1.pdf',
        status:        'ACTIVE',
      },
    }),
    // Zakir Khan
    prisma.listing.upsert({
      where:  { id: 'listing-zakir-1' },
      update: {},
      create: {
        id:            'listing-zakir-1',
        eventId:       comedy1.id,
        sellerId:      seller1.id,
        seatSection:   'Floor',
        originalPrice: 199900,
        askingPrice:   299900,
        ticketFileUrl: 'https://example.com/tickets/zakir-1.pdf',
        status:        'ACTIVE',
      },
    }),
    // Arijit Singh
    prisma.listing.upsert({
      where:  { id: 'listing-arijit-1' },
      update: {},
      create: {
        id:            'listing-arijit-1',
        eventId:       concert2.id,
        sellerId:      seller2.id,
        seatSection:   'VIP',
        seatRow:       'B',
        originalPrice: 500000,
        askingPrice:   900000,
        ticketFileUrl: 'https://example.com/tickets/arijit-1.pdf',
        status:        'ACTIVE',
      },
    }),
    // Sunburn — pending verification
    prisma.listing.upsert({
      where:  { id: 'listing-sunburn-1' },
      update: {},
      create: {
        id:            'listing-sunburn-1',
        eventId:       festival1.id,
        sellerId:      seller3.id,
        seatSection:   '3-Day Pass',
        originalPrice: 599900,
        askingPrice:   750000,
        ticketFileUrl: 'https://example.com/tickets/sunburn-1.pdf',
        status:        'PENDING_VERIFICATION',
      },
    }),
    // SOLD listing (for order below)
    prisma.listing.upsert({
      where:  { id: 'listing-cold-sold' },
      update: {},
      create: {
        id:            'listing-cold-sold',
        eventId:       coldplay.id,
        sellerId:      seller1.id,
        seatSection:   'Silver',
        seatRow:       'H',
        seatNumber:    '11',
        originalPrice: 750000,
        askingPrice:   1100000,
        ticketFileUrl: 'https://example.com/tickets/cold-sold.pdf',
        status:        'SOLD',
      },
    }),
  ])

  console.log('  ✓ Listings')

  // ── Orders ────────────────────────────────────────────────────────────────
  const soldListing = listings[listings.length - 1]
  await Promise.all([
    prisma.order.upsert({
      where:  { id: 'order-1' },
      update: {},
      create: {
        id:               'order-1',
        listingId:        soldListing.id,
        buyerId:          buyer1.id,
        sellerId:         seller1.id,
        amount:           1100000,
        platformFee:      55000,
        sellerPayout:     1045000,
        paymentStatus:    'PAID',
        razorpayOrderId:  'order_seed_001',
        razorpayPaymentId:'pay_seed_001',
        ticketReleasedAt: new Date('2026-07-01T10:30:00+05:30'),
      },
    }),
    prisma.order.upsert({
      where:  { id: 'order-2' },
      update: {},
      create: {
        id:            'order-2',
        listingId:     listings[3].id, // IPL listing
        buyerId:       buyer2.id,
        sellerId:      seller1.id,
        amount:        400000,
        platformFee:   20000,
        sellerPayout:  380000,
        paymentStatus: 'PENDING',
        razorpayOrderId: 'order_seed_002',
      },
    }),
  ])

  console.log('  ✓ Orders')
  console.log('\nSeed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
