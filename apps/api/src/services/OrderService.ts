import Razorpay from 'razorpay'
import { createHmac } from 'crypto'
import { PrismaClient } from '@resell/db'

const PLATFORM_FEE_RATE = 0.05

export class OrderService {
  private _rzp: Razorpay | null = null

  constructor(private prisma: PrismaClient) {}

  private get rzp(): Razorpay {
    if (!this._rzp) {
      const key_id = process.env.RAZORPAY_KEY_ID
      if (!key_id) throw Object.assign(new Error('Razorpay not configured'), { statusCode: 503 })
      this._rzp = new Razorpay({ key_id, key_secret: process.env.RAZORPAY_KEY_SECRET ?? '' })
    }
    return this._rzp
  }

  /** Create a Razorpay order for a listing and persist a PENDING Order row */
  async createOrder(listingId: string, buyerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where:   { id: listingId },
      include: { event: { select: { title: true } }, seller: { select: { id: true, name: true } } },
    })
    if (!listing)                       throw Object.assign(new Error('Listing not found'), { statusCode: 404 })
    if (listing.status !== 'ACTIVE')    throw Object.assign(new Error('Listing is not available'), { statusCode: 409 })
    if (listing.sellerId === buyerId)   throw Object.assign(new Error('Cannot buy your own listing'), { statusCode: 400 })

    const platformFee   = Math.round(listing.askingPrice * PLATFORM_FEE_RATE)
    const sellerPayout  = listing.askingPrice - platformFee

    // Create Razorpay order (amount in paise)
    const rzpOrder = await this.rzp.orders.create({
      amount:   listing.askingPrice,
      currency: 'INR',
      receipt:  `listing_${listingId}`,
      notes:    { listingId, buyerId, eventTitle: listing.event.title },
    })

    // Persist pending order
    const order = await this.prisma.order.create({
      data: {
        listingId,
        buyerId,
        sellerId:        listing.sellerId,
        amount:          listing.askingPrice,
        platformFee,
        sellerPayout,
        paymentStatus:   'PENDING',
        razorpayOrderId: rzpOrder.id,
      },
    })

    return {
      orderId:         order.id,
      razorpayOrderId: rzpOrder.id,
      amount:          listing.askingPrice,
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID ?? '',
    }
  }

  /** Verify Razorpay payment signature and mark order + listing as PAID/SOLD */
  async verifyPayment(orderId: string, buyerId: string, body: {
    razorpayPaymentId: string
    razorpayOrderId:   string
    razorpaySignature: string
  }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })
    if (!order)               throw Object.assign(new Error('Order not found'), { statusCode: 404 })
    if (order.buyerId !== buyerId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
    if (order.paymentStatus !== 'PENDING') throw Object.assign(new Error('Order already processed'), { statusCode: 409 })

    // Verify HMAC-SHA256 signature
    const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
      .digest('hex')

    if (expectedSig !== body.razorpaySignature) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 })
    }

    // Mark order paid + listing sold in a transaction
    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus:    'PAID',
          razorpayPaymentId: body.razorpayPaymentId,
          ticketReleasedAt: new Date(),
        },
      }),
      this.prisma.listing.update({
        where: { id: order.listingId },
        data:  { status: 'SOLD' },
      }),
    ])

    return { success: true, orderId }
  }

  async myOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where:   { buyerId },
      include: {
        listing: {
          include: {
            event: { select: { id: true, title: true, dateTime: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
