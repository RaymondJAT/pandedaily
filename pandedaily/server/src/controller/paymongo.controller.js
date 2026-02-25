const https = require('https')

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY
const PAYMONGO_API_URL = 'api.paymongo.com'

if (!PAYMONGO_SECRET_KEY) {
  console.error('❌ PAYMONGO_SECRET_KEY is not set in environment variables')
}

const createCheckoutSession = async (req, res) => {
  console.log('='.repeat(50))
  console.log('CREATE CHECKOUT SESSION CALLED')
  console.log('Time:', new Date().toISOString())

  try {
    const { lineItems, successUrl, cancelUrl, metadata } = req.body

    if (!lineItems || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      })
    }

    // Format line items correctly for PayMongo
    const formattedLineItems = lineItems.map((item) => ({
      amount: Math.round(parseFloat(item.amount) * 100),
      currency: 'PHP',
      name: item.name,
      quantity: item.quantity,
      description: item.description || '',
    }))

    const requestBody = {
      data: {
        attributes: {
          billing: {
            name: metadata?.customer_name || '',
            email: metadata?.customer_email || '',
            phone: metadata?.customer_contact || '',
          },
          billing_information_fields_editable: 'enabled',
          cancel_url: cancelUrl,
          success_url: successUrl,
          line_items: formattedLineItems,
          payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          reference_number: metadata?.order_reference,
          description: `PandeDaily Order - ${metadata?.total_items || 0} items`,
          metadata: metadata || {},
        },
      },
    }

    const requestBodyString = JSON.stringify(requestBody)
    console.log('Sending to PayMongo:', requestBodyString)

    // Create the authorization header correctly using env variable
    const authString = Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')
    console.log('Auth header (first 20 chars):', authString.substring(0, 20) + '...')

    const options = {
      hostname: PAYMONGO_API_URL,
      path: '/v1/checkout_sessions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBodyString),
        Authorization: 'Basic ' + authString,
      },
    }

    console.log('Request options:', {
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      authHeaderPresent: !!options.headers.Authorization,
    })

    const paymongoReq = https.request(options, (paymongoRes) => {
      let data = ''

      paymongoRes.on('data', (chunk) => {
        data += chunk
      })

      paymongoRes.on('end', () => {
        console.log('PayMongo response status:', paymongoRes.statusCode)
        console.log('PayMongo response headers:', paymongoRes.headers)
        console.log('PayMongo response data:', data)

        try {
          // Check if response is HTML (error page) instead of JSON
          if (data.trim().startsWith('<')) {
            console.error('Received HTML response instead of JSON')
            return res.status(502).json({
              success: false,
              message: 'Received invalid response from PayMongo',
            })
          }

          const response = JSON.parse(data)

          if (paymongoRes.statusCode >= 400) {
            console.error('PayMongo error details:', response.errors)

            return res.status(paymongoRes.statusCode).json({
              success: false,
              message: response.errors?.[0]?.detail || 'PayMongo API error',
              errors: response.errors,
            })
          }

          res.status(200).json({
            success: true,
            data: response.data,
          })
        } catch (error) {
          console.error('Parse error:', error)
          res.status(500).json({
            success: false,
            message: 'Failed to parse PayMongo response',
            rawData: data.substring(0, 200),
          })
        }
      })
    })

    paymongoReq.on('error', (error) => {
      console.error('PayMongo request error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to connect to PayMongo: ' + error.message,
      })
    })

    paymongoReq.write(requestBodyString)
    paymongoReq.end()
  } catch (error) {
    console.error('Create checkout session error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
    })
  }
}

// Get checkout session
const getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params

    const options = {
      hostname: PAYMONGO_API_URL,
      path: `/v1/checkout_sessions/${sessionId}`,
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64'),
      },
    }

    const paymongoReq = https.request(options, (paymongoRes) => {
      let data = ''

      paymongoRes.on('data', (chunk) => {
        data += chunk
      })

      paymongoRes.on('end', () => {
        try {
          const response = JSON.parse(data)

          if (paymongoRes.statusCode >= 400) {
            return res.status(paymongoRes.statusCode).json({
              success: false,
              message: response.errors?.[0]?.detail || 'PayMongo API error',
            })
          }

          res.status(200).json({
            success: true,
            data: response.data,
          })
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to parse PayMongo response',
          })
        }
      })
    })

    paymongoReq.on('error', (error) => {
      console.error('PayMongo request error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to connect to PayMongo',
      })
    })

    paymongoReq.end()
  } catch (error) {
    console.error('Get checkout session error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Webhook handler for PayMongo events
const handleWebhook = async (req, res) => {
  try {
    const event = req.body

    console.log('='.repeat(50))
    console.log('WEBHOOK RECEIVED:', event.type)

    switch (event.type) {
      case 'checkout_session.payment_paid':
      case 'payment.paid':
        console.log('✅ Payment successful!')

        // Extract session ID and metadata
        let sessionId, metadata

        if (event.data?.attributes?.data) {
          sessionId = event.data.attributes.data.id
          metadata = event.data.attributes.data.attributes?.metadata || {}
        } else {
          sessionId = event.data?.id
          metadata = event.data?.attributes?.metadata || {}
        }

        console.log('Session ID:', sessionId)
        console.log('Metadata:', metadata)
        console.log('✅ Order will be created by PaymentSuccess page')

        break

      case 'payment.failed':
        console.log('❌ Payment failed:', event.data)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  handleWebhook,
}
