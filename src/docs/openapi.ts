const bearerAuth = { security: [{ bearerAuth: [] }] };
const adminAuth = { security: [{ bearerAuth: [] }] };

const idParam = { in: 'path', name: 'id', required: true, schema: { type: 'string' } };
const paginationParams = [
  { in: 'query', name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
  { in: 'query', name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
];
const searchParam = { in: 'query', name: 'search', required: false, schema: { type: 'string' } };
const statusParam = (name: string, values: string[]) => ({
  in: 'query',
  name,
  required: false,
  schema: { type: 'string', enum: values }
});

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Telente Store API',
    description: 'REST API for the Telente Store by Oluwayemi Oyinlola.',
    version: '1.0.0'
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'auth', description: 'Authentication and sessions' },
    { name: 'users', description: 'User profiles and administration' },
    { name: 'products', description: 'Product catalog' },
    { name: 'categories', description: 'Product categories' },
    { name: 'brands', description: 'Product brands' },
    { name: 'inventory', description: 'Stock management' },
    { name: 'cart', description: 'Shopping cart' },
    { name: 'wishlist', description: 'Saved products' },
    { name: 'checkout', description: 'Checkout and order placement' },
    { name: 'orders', description: 'Orders, returns and shipments' },
    { name: 'payments', description: 'Payments, intents and webhooks' },
    { name: 'payment-settings', description: 'Admin payment provider configuration' },
    { name: 'coupons', description: 'Discount coupons' },
    { name: 'reviews', description: 'Product reviews' },
    { name: 'returns', description: 'Return requests' },
    { name: 'contact', description: 'Contact messages' },
    { name: 'notifications', description: 'User notifications' },
    { name: 'media', description: 'File uploads and media' },
    { name: 'settings', description: 'Store settings and tax rules' },
    { name: 'analytics', description: 'Admin statistics' },
    { name: 'health', description: 'Health checks' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    responses: {
      BadRequest: {
        description: 'Invalid request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      ProviderLocked: {
        description: 'Payment settings are locked or no provider is configured',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          images: { type: 'array', items: { type: 'string' } },
          categoryId: { type: 'string' },
          brandId: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['active', 'draft', 'archived'] },
          featured: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          parentId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Brand: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' },
          product: { $ref: '#/components/schemas/Product' },
          totalPrice: { type: 'number' }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          totalPrice: { type: 'number' },
          shippingCost: { type: 'number' },
          grandTotal: { type: 'number' }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderNumber: { type: 'string' },
          userId: { type: 'string' },
          status: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
          },
          subtotal: { type: 'number' },
          discountAmount: { type: 'number' },
          taxAmount: { type: 'number' },
          shippingAmount: { type: 'number' },
          total: { type: 'number' },
          currency: { type: 'string', default: 'NGN' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          placedAt: { type: 'string', format: 'date-time' }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderId: { type: 'string' },
          method: { type: 'string', enum: ['CARD', 'TRANSFER', 'PAY_ON_DELIVERY', 'WALLET'] },
          amount: { type: 'number' },
          provider: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba', 'manual'] },
          reference: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'] },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      InlinePaymentConfig: {
        type: 'object',
        description: 'Configuration for loading the provider inline checkout script (no redirect).',
        properties: {
          scriptUrl: { type: 'string' },
          publicKey: { type: 'string' },
          reference: { type: 'string' },
          accessCode: { type: 'string', nullable: true }
        }
      },
      TransferAccount: {
        type: 'object',
        description: 'Bank account the customer must transfer into for TRANSFER payments.',
        properties: {
          bank: { type: 'string' },
          accountNumber: { type: 'string' },
          accountName: { type: 'string' },
          reference: { type: 'string' }
        }
      },
      PaymentIntent: {
        type: 'object',
        properties: {
          payment: { $ref: '#/components/schemas/Payment' },
          inline: { $ref: '#/components/schemas/InlinePaymentConfig', nullable: true },
          redirectUrl: { type: 'string', nullable: true },
          transferAccount: { $ref: '#/components/schemas/TransferAccount', nullable: true }
        }
      },
      CheckoutResponse: {
        type: 'object',
        properties: {
          order: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderNumber: { type: 'string' },
              status: { type: 'string' },
              total: { type: 'number' },
              currency: { type: 'string' }
            }
          },
          payment: { $ref: '#/components/schemas/PaymentIntent' },
          shipping: {
            type: 'object',
            properties: {
              method: { type: 'string', enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'] },
              estimate: { type: 'string' }
            }
          },
          totals: {
            type: 'object',
            properties: {
              subtotal: { type: 'number' },
              shippingAmount: { type: 'number' },
              taxAmount: { type: 'number' },
              discountAmount: { type: 'number' },
              total: { type: 'number' }
            }
          }
        }
      },
      ProviderConfig: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          configured: {
            type: 'object',
            properties: {
              publicKey: { type: 'boolean' },
              secretKey: { type: 'boolean' },
              webhookSecret: { type: 'boolean' },
              accountId: { type: 'boolean' }
            }
          },
          publicKeyPreview: { type: 'string', nullable: true }
        }
      },
      PinStatus: {
        type: 'object',
        properties: {
          pinSet: { type: 'boolean' },
          unlocked: { type: 'boolean' }
        }
      },
      PaginatedPayments: {
        type: 'object',
        properties: {
          payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' }
        }
      },
      Stats: {
        type: 'object',
        properties: {
          revenue: { type: 'number' },
          orders: { type: 'integer' },
          customers: { type: 'integer' },
          products: { type: 'integer' }
        }
      }
    }
  },
  paths: {
    // ============ Auth ============
    '/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User created', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } } } } } },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } } } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/auth/logout': {
      post: { tags: ['auth'], summary: 'Logout the current user', ...bearerAuth, responses: { 200: { description: 'Logged out' } } }
    },
    '/auth/me': {
      get: { tags: ['auth'], summary: 'Current user profile', ...bearerAuth, responses: { 200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 401: { description: 'Unauthorized' } } }
    },
    '/auth/change-password': {
      post: {
        tags: ['auth'],
        summary: 'Change the current password',
        ...bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } }
              }
            }
          }
        },
        responses: { 200: { description: 'Password changed' }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/auth/otp/request': {
      post: {
        tags: ['auth'],
        summary: 'Request a one-time passcode',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'purpose'],
                properties: { email: { type: 'string', format: 'email' }, purpose: { type: 'string', enum: ['login', 'reset', 'admin-login'] } }
              }
            }
          }
        },
        responses: { 200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { otpToken: { type: 'string' }, expiresInMinutes: { type: 'integer' } } } } } } }
      }
    },
    '/auth/otp/verify': {
      post: {
        tags: ['auth'],
        summary: 'Verify a one-time passcode',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code', 'purpose', 'otpToken'],
                properties: { email: { type: 'string' }, code: { type: 'string' }, purpose: { type: 'string' }, otpToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Verified', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/auth/forgot-password': {
      post: {
        tags: ['auth'],
        summary: 'Request a password reset link',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } }
          }
        },
        responses: { 200: { description: 'Reset email sent' } }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['auth'],
        summary: 'Reset the password with a token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: { token: { type: 'string' }, password: { type: 'string', minLength: 8 } }
              }
            }
          }
        },
        responses: { 200: { description: 'Password reset' }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/auth/refresh-token': {
      post: { tags: ['auth'], summary: 'Refresh the access token', responses: { 200: { description: 'New token', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } } } }
    },

    // ============ Users ============
    '/users/profile': {
      get: {
        tags: ['users'],
        summary: 'Get the current user profile',
        ...bearerAuth,
        responses: { 200: { description: 'Profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 401: { description: 'Unauthorized' } }
      },
      put: {
        tags: ['users'],
        summary: 'Update the current user profile',
        ...bearerAuth,
        requestBody: {
          content: {
            'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' } } } }
          }
        },
        responses: { 200: { description: 'Updated profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } }
      }
    },
    '/users/:id': {
      get: { tags: ['users'], summary: 'Get a user by id', parameters: [idParam], ...bearerAuth, responses: { 200: { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 404: { description: 'Not found' } } }
    },
    '/addresses': {
      get: { tags: ['users'], summary: 'List the current user addresses', ...bearerAuth, responses: { 200: { description: 'Addresses' } } },
      post: { tags: ['users'], summary: 'Create an address', ...bearerAuth, responses: { 201: { description: 'Address created' } } }
    },
    '/addresses/:id': {
      put: { tags: ['users'], summary: 'Update an address', parameters: [idParam], ...bearerAuth, responses: { 200: { description: 'Address updated' } } },
      delete: { tags: ['users'], summary: 'Delete an address', parameters: [idParam], ...bearerAuth, responses: { 200: { description: 'Address deleted' } } }
    },

    // ============ Products ============
    '/products': {
      get: {
        tags: ['products'],
        summary: 'List products',
        parameters: [
          { in: 'query', name: 'category', required: false, schema: { type: 'string' } },
          { in: 'query', name: 'search', required: false, schema: { type: 'string' } },
          { in: 'query', name: 'minPrice', required: false, schema: { type: 'number' } },
          { in: 'query', name: 'maxPrice', required: false, schema: { type: 'number' } },
          { in: 'query', name: 'featured', required: false, schema: { type: 'boolean' } },
          { in: 'query', name: 'limit', required: false, schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Paginated products', content: { 'application/json': { schema: { type: 'object', properties: { products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }, total: { type: 'integer' } } } } } }
        }
      },
      post: {
        tags: ['products'],
        summary: 'Create a product (admin)',
        ...adminAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name', 'price'], properties: { name: { type: 'string' }, price: { type: 'number' }, categoryId: { type: 'string' }, description: { type: 'string' }, images: { type: 'array', items: { type: 'string' } } } } } } },
        responses: { 201: { description: 'Product created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/products/search': {
      get: {
        tags: ['products'],
        summary: 'Search products',
        parameters: [{ in: 'query', name: 'q', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Matching products', content: { 'application/json': { schema: { type: 'object', properties: { products: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } } } }
      }
    },
    '/products/top': {
      get: { tags: ['products'], summary: 'Top products (admin)', ...adminAuth, responses: { 200: { description: 'Top products' } } }
    },
    '/products/{idOrSlug}': {
      get: {
        tags: ['products'],
        summary: 'Get a product by id or slug',
        parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['products'],
        summary: 'Update a product (admin)',
        parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }],
        ...adminAuth,
        responses: { 200: { description: 'Product updated' }, 400: { $ref: '#/components/responses/BadRequest' } }
      },
      delete: {
        tags: ['products'],
        summary: 'Delete a product (admin)',
        parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }],
        ...adminAuth,
        responses: { 200: { description: 'Product deleted' } }
      }
    },
    '/products/{productId}/variants': {
      get: { tags: ['products'], summary: 'List product variants', parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Variants' } } }
    },
    '/products/{productId}/reviews': {
      get: {
        tags: ['reviews'],
        summary: 'List product reviews',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }, ...paginationParams],
        responses: { 200: { description: 'Reviews' } }
      },
      post: {
        tags: ['reviews'],
        summary: 'Create a product review',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
        ...bearerAuth,
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } }
              }
            }
          }
        },
        responses: { 201: { description: 'Review created' } }
      }
    },

    // ============ Categories ============
    '/categories': {
      get: { tags: ['categories'], summary: 'List categories', responses: { 200: { description: 'Categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } },
      post: { tags: ['categories'], summary: 'Create a category (admin)', ...adminAuth, responses: { 201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } } } }
    },
    '/categories/tree': {
      get: { tags: ['categories'], summary: 'Category tree', responses: { 200: { description: 'Nested categories' } } }
    },
    '/categories/{idOrSlug}': {
      get: {
        tags: ['categories'],
        summary: 'Get a category by id or slug',
        parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } }, 404: { description: 'Not found' } }
      },
      put: { tags: ['categories'], summary: 'Update a category (admin)', parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }], ...adminAuth, responses: { 200: { description: 'Category updated' } } },
      delete: { tags: ['categories'], summary: 'Delete a category (admin)', parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }], ...adminAuth, responses: { 200: { description: 'Category deleted' } } }
    },

    // ============ Brands ============
    '/brands': {
      get: { tags: ['brands'], summary: 'List brands', responses: { 200: { description: 'Brands', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Brand' } } } } } } },
      post: { tags: ['brands'], summary: 'Create a brand (admin)', ...adminAuth, responses: { 201: { description: 'Brand created' } } }
    },
    '/brands/{idOrSlug}': {
      get: { tags: ['brands'], summary: 'Get a brand by id or slug', parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Brand', content: { 'application/json': { schema: { $ref: '#/components/schemas/Brand' } } } } } },
      put: { tags: ['brands'], summary: 'Update a brand (admin)', parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }], ...adminAuth, responses: { 200: { description: 'Brand updated' } } },
      delete: { tags: ['brands'], summary: 'Delete a brand (admin)', parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }], ...adminAuth, responses: { 200: { description: 'Brand deleted' } } }
    },

    // ============ Inventory ============
    '/inventory/{productId}': {
      get: {
        tags: ['inventory'],
        summary: 'Get inventory for a product',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Inventory', content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' }, lowStockThreshold: { type: 'integer' } } } } } } }
      }
    },
    '/inventory/check': {
      post: {
        tags: ['inventory'],
        summary: 'Check stock availability',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: { productId: { type: 'string' }, quantity: { type: 'integer' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Availability result', content: { 'application/json': { schema: { type: 'object', properties: { available: { type: 'boolean' }, availableQuantity: { type: 'integer' } } } } } } }
      }
    },

    // ============ Cart ============
    '/cart': {
      get: { tags: ['cart'], summary: 'Get the current cart', ...bearerAuth, responses: { 200: { description: 'Cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } } } }
    },
    '/cart/items': {
      post: {
        tags: ['cart'],
        summary: 'Add an item to the cart',
        ...bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: { productId: { type: 'string' }, variantId: { type: 'string' }, quantity: { type: 'integer', default: 1 } }
              }
            }
          }
        },
        responses: { 201: { description: 'Cart updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/cart/items/{itemId}': {
      put: {
        tags: ['cart'],
        summary: 'Update a cart item quantity',
        parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'string' } }],
        ...bearerAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 1 } } } } } },
        responses: { 200: { description: 'Cart updated' } }
      },
      delete: { tags: ['cart'], summary: 'Remove a cart item', parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'string' } }], ...bearerAuth, responses: { 200: { description: 'Cart updated' } } }
    },

    // ============ Wishlist ============
    '/wishlist': {
      get: { tags: ['wishlist'], summary: 'Get the wishlist', ...bearerAuth, responses: { 200: { description: 'Wishlist' } } }
    },
    '/wishlist/items': {
      post: {
        tags: ['wishlist'],
        summary: 'Add a product to the wishlist',
        ...bearerAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['productId'], properties: { productId: { type: 'string' } } } } } },
        responses: { 201: { description: 'Added' } }
      }
    },
    '/wishlist/items/{itemId}': {
      delete: { tags: ['wishlist'], summary: 'Remove an item from the wishlist', parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'string' } }], ...bearerAuth, responses: { 200: { description: 'Removed' } } }
    },
    '/wishlist/toggle': {
      post: {
        tags: ['wishlist'],
        summary: 'Toggle a product in the wishlist',
        ...bearerAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['productId'], properties: { productId: { type: 'string' } } } } } },
        responses: { 200: { description: 'Toggled', content: { 'application/json': { schema: { type: 'object', properties: { added: { type: 'boolean' } } } } } } }
      }
    },

    // ============ Checkout ============
    '/checkout/shipping-options': {
      get: {
        tags: ['checkout'],
        summary: 'List available shipping options',
        responses: {
          200: {
            description: 'Shipping options',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { method: { type: 'string', enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'] }, fee: { type: 'number' }, estimate: { type: 'string' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/checkout': {
      post: {
        tags: ['checkout'],
        summary: 'Checkout: creates the order and payment intent in one step. The order is finalized (PAID + emails) only after the payment is confirmed.',
        ...bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingMethod: { type: 'string', enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'], default: 'STANDARD' },
                  paymentMethod: { type: 'string', enum: ['CARD', 'TRANSFER', 'PAY_ON_DELIVERY'], default: 'CARD' },
                  note: { type: 'string' },
                  couponCode: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order and payment intent created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutResponse' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          503: { $ref: '#/components/responses/ProviderLocked' }
        }
      }
    },

    // ============ Orders ============
    '/orders': {
      get: { tags: ['orders'], summary: 'List the current user orders', ...bearerAuth, responses: { 200: { description: 'Orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } },
      post: { tags: ['orders'], summary: 'Submit an order (legacy flow)', ...bearerAuth, responses: { 201: { description: 'Order created', content: { 'application/json': { schema: { type: 'object', properties: { order: { $ref: '#/components/schemas/Order' } } } } } } } }
    },
    '/orders/{id}': {
      get: { tags: ['orders'], summary: 'Get an order by id', parameters: [idParam], ...bearerAuth, responses: { 200: { description: 'Order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } }, 404: { description: 'Not found' } } }
    },
    '/orders/track/{orderNumber}': {
      get: {
        tags: ['orders'],
        summary: 'Track an order by order number',
        parameters: [{ in: 'path', name: 'orderNumber', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Order status', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } }
      }
    },
    '/orders/{orderId}/shipment': {
      get: { tags: ['orders'], summary: 'Get the shipment for an order', parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }], ...bearerAuth, responses: { 200: { description: 'Shipment' } } }
    },

    // ============ Payments ============
    '/payments/intent': {
      post: {
        tags: ['payments'],
        summary: 'Create a payment intent for an order. Returns the inline script config (no redirect) or a transfer account.',
        ...bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'orderNumber', 'amount'],
                properties: {
                  orderId: { type: 'string' },
                  orderNumber: { type: 'string' },
                  amount: { type: 'number', minimum: 0 },
                  email: { type: 'string', format: 'email' },
                  method: { type: 'string', enum: ['CARD', 'TRANSFER', 'PAY_ON_DELIVERY'], default: 'CARD' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Payment intent created', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentIntent' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          502: { description: 'Provider initialization failed' },
          503: { $ref: '#/components/responses/ProviderLocked' }
        }
      }
    },
    '/payments/{paymentId}/confirm': {
      post: {
        tags: ['payments'],
        summary: 'Manually confirm a payment (finalizes the order and sends emails)',
        parameters: [{ in: 'path', name: 'paymentId', required: true, schema: { type: 'string' } }],
        ...bearerAuth,
        responses: {
          200: {
            description: 'Payment confirmed',
            content: { 'application/json': { schema: { type: 'object', properties: { payment: { $ref: '#/components/schemas/Payment' }, status: { type: 'string', enum: ['confirmed'] } } } } }
          },
          404: { description: 'Payment not found' }
        }
      }
    },
    '/payments/verify': {
      get: {
        tags: ['payments'],
        summary: 'Verify a payment by reference against the provider',
        parameters: [{ in: 'query', name: 'reference', required: true, schema: { type: 'string' } }],
        ...bearerAuth,
        responses: {
          200: { description: 'Payment after verification', content: { 'application/json': { schema: { type: 'object', properties: { payment: { $ref: '#/components/schemas/Payment' } } } } } },
          400: { description: 'reference is required' },
          404: { description: 'Payment not found' },
          503: { $ref: '#/components/responses/ProviderLocked' }
        }
      }
    },
    '/payments/methods': {
      get: {
        tags: ['payments'],
        summary: 'List available payment methods',
        ...bearerAuth,
        responses: {
          200: {
            description: 'Payment methods',
            content: { 'application/json': { schema: { type: 'object', properties: { methods: { type: 'array', items: { type: 'string', enum: ['CARD', 'TRANSFER', 'PAY_ON_DELIVERY'] } } } } } }
          }
        }
      }
    },
    '/payments/orders/{orderId}': {
      get: {
        tags: ['payments'],
        summary: 'List payments for an order',
        parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
        ...bearerAuth,
        responses: { 200: { description: 'Payments', content: { 'application/json': { schema: { type: 'object', properties: { payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } } } } } }
      }
    },
    '/payments/webhook/{provider}': {
      post: {
        tags: ['payments'],
        summary: 'Provider webhook (Paystack/Flutterwave/Nomba). Signature is verified per provider.',
        parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba'] } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Webhook received', content: { 'application/json': { schema: { type: 'object', properties: { received: { type: 'boolean' } } } } } },
          401: { description: 'Invalid signature' },
          503: { description: 'Provider locked — retry after admin unlock' }
        }
      }
    },

    // ============ Admin Payments ============
    '/admin/payments': {
      get: {
        tags: ['payments'],
        summary: 'List all payments (admin)',
        parameters: [...paginationParams, statusParam('status', ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED']), searchParam],
        ...adminAuth,
        responses: { 200: { description: 'Paginated payments', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedPayments' } } } } }
      }
    },
    '/admin/payments/{paymentId}/refund': {
      post: {
        tags: ['payments'],
        summary: 'Refund a payment (admin). Issues the refund with the provider when possible.',
        parameters: [{ in: 'path', name: 'paymentId', required: true, schema: { type: 'string' } }],
        ...adminAuth,
        responses: {
          200: { description: 'Payment refunded', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, paymentId: { type: 'string' } } } } } },
          404: { description: 'Payment not found' },
          503: { $ref: '#/components/responses/ProviderLocked' }
        }
      }
    },
    '/admin/payments/{paymentId}/status': {
      put: {
        tags: ['payments'],
        summary: 'Update a payment status (admin)',
        parameters: [{ in: 'path', name: 'paymentId', required: true, schema: { type: 'string' } }],
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'] } }
              }
            }
          }
        },
        responses: { 200: { description: 'Status updated', content: { 'application/json': { schema: { type: 'object', properties: { payment: { $ref: '#/components/schemas/Payment' } } } } } }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },

    // ============ Admin Payment Settings ============
    '/admin/payments/settings': {
      get: {
        tags: ['payment-settings'],
        summary: 'Pin and unlock status (admin)',
        ...adminAuth,
        responses: { 200: { description: 'Status', content: { 'application/json': { schema: { $ref: '#/components/schemas/PinStatus' } } } } }
      }
    },
    '/admin/payments/settings/pin': {
      post: {
        tags: ['payment-settings'],
        summary: 'Create the payment settings pin (admin)',
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pin', 'confirmPin'],
                properties: { pin: { type: 'string', pattern: '^\\d{4}$|^\\d{6}$' }, confirmPin: { type: 'string' } }
              }
            }
          }
        },
        responses: { 201: { description: 'Pin created' }, 400: { $ref: '#/components/responses/BadRequest' } }
      },
      put: {
        tags: ['payment-settings'],
        summary: 'Change the payment settings pin (admin). Re-encrypts provider secrets and locks the runtime.',
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPin', 'newPin', 'confirmPin'],
                properties: { currentPin: { type: 'string' }, newPin: { type: 'string', pattern: '^\\d{4}$|^\\d{6}$' }, confirmPin: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Pin changed' }, 400: { $ref: '#/components/responses/BadRequest' } }
      }
    },
    '/admin/payments/settings/unlock': {
      post: {
        tags: ['payment-settings'],
        summary: 'Unlock payment settings for 12 hours so checkout and webhooks can use the decrypted keys (admin)',
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', required: ['pin'], properties: { pin: { type: 'string' } } } }
          }
        },
        responses: {
          200: {
            description: 'Unlocked',
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, expiresAt: { type: 'string', format: 'date-time' } } } } }
          },
          401: { description: 'Wrong pin' }
        }
      }
    },
    '/admin/payments/settings/lock': {
      post: {
        tags: ['payment-settings'],
        summary: 'Lock payment settings immediately (admin)',
        ...adminAuth,
        responses: { 200: { description: 'Locked' } }
      }
    },
    '/admin/payments/settings/providers': {
      get: {
        tags: ['payment-settings'],
        summary: 'List provider configurations with masked secrets (admin)',
        ...adminAuth,
        responses: {
          200: {
            description: 'Providers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    providers: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/ProviderConfig' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/admin/payments/settings/providers/{provider}': {
      put: {
        tags: ['payment-settings'],
        summary: 'Save provider credentials (admin). Values are encrypted at rest with the pin.',
        parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba'] } }],
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pin'],
                properties: {
                  enabled: { type: 'boolean' },
                  publicKey: { type: 'string' },
                  secretKey: { type: 'string' },
                  webhookSecret: { type: 'string' },
                  accountId: { type: 'string' },
                  pin: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Provider saved' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { description: 'Wrong pin' } }
      },
      delete: {
        tags: ['payment-settings'],
        summary: 'Remove a provider configuration (admin)',
        parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba'] } }],
        ...adminAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { pin: { type: 'string' } } } } } },
        responses: { 200: { description: 'Provider removed' }, 401: { description: 'Wrong pin' } }
      }
    },
    '/admin/payments/settings/providers/{provider}/toggle': {
      patch: {
        tags: ['payment-settings'],
        summary: 'Enable or disable a provider (admin)',
        parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba'] } }],
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['enabled', 'pin'],
                properties: { enabled: { type: 'boolean' }, pin: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Provider toggled' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { description: 'Wrong pin' } }
      }
    },
    '/admin/payments/settings/providers/{provider}/reveal/{field}': {
      post: {
        tags: ['payment-settings'],
        summary: 'Reveal a stored secret value (admin, requires pin)',
        parameters: [
          { in: 'path', name: 'provider', required: true, schema: { type: 'string', enum: ['paystack', 'flutterwave', 'nomba'] } },
          { in: 'path', name: 'field', required: true, schema: { type: 'string', enum: ['publicKey', 'secretKey', 'webhookSecret', 'accountId'] } }
        ],
        ...adminAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', required: ['pin'], properties: { pin: { type: 'string' } } } }
          }
        },
        responses: {
          200: { description: 'Secret value', content: { 'application/json': { schema: { type: 'object', properties: { value: { type: 'string' } } } } } },
          401: { description: 'Wrong pin' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },

    // ============ Admin Orders ============
    '/admin/orders': {
      get: {
        tags: ['orders'],
        summary: 'List all orders (admin)',
        parameters: [...paginationParams, statusParam('status', ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']), searchParam],
        ...adminAuth,
        responses: { 200: { description: 'Paginated orders' } }
      }
    },
    '/admin/orders/recent': {
      get: { tags: ['analytics'], summary: 'Recent orders (admin)', parameters: [{ in: 'query', name: 'limit', required: false, schema: { type: 'integer', default: 10 } }], ...adminAuth, responses: { 200: { description: 'Recent orders' } } }
    },
    '/admin/orders/{id}': {
      get: { tags: ['orders'], summary: 'Order details (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } } }
    },
    '/admin/orders/{id}/status': {
      put: {
        tags: ['orders'],
        summary: 'Update order status (admin)',
        parameters: [idParam],
        ...adminAuth,
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', required: ['status'], properties: { status: { type: 'string' }, note: { type: 'string' } } }
            }
          }
        },
        responses: { 200: { description: 'Status updated' } }
      }
    },
    '/admin/orders/{id}/notes': {
      post: {
        tags: ['orders'],
        summary: 'Add an admin note to an order',
        parameters: [idParam],
        ...adminAuth,
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['note'], properties: { note: { type: 'string' } } } } } },
        responses: { 201: { description: 'Note added' } }
      }
    },
    '/admin/orders/{id}/status-history': {
      get: { tags: ['orders'], summary: 'Order status history (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Status history' } } }
    },

    // ============ Admin ============
    '/admin/products': {
      get: { tags: ['products'], summary: 'List products (admin)', parameters: [...paginationParams, searchParam], ...adminAuth, responses: { 200: { description: 'Products' } } },
      post: { tags: ['products'], summary: 'Create product (admin)', ...adminAuth, responses: { 201: { description: 'Created' } } }
    },
    '/admin/products/{id}': {
      get: { tags: ['products'], summary: 'Product details (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Product' } } },
      put: { tags: ['products'], summary: 'Update product (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['products'], summary: 'Delete product (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Deleted' } } }
    },
    '/admin/categories': {
      get: { tags: ['categories'], summary: 'List categories (admin)', ...adminAuth, responses: { 200: { description: 'Categories' } } },
      post: { tags: ['categories'], summary: 'Create category (admin)', ...adminAuth, responses: { 201: { description: 'Created' } } }
    },
    '/admin/categories/{id}': {
      put: { tags: ['categories'], summary: 'Update category (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['categories'], summary: 'Delete category (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Deleted' } } }
    },
    '/admin/inventory': {
      get: { tags: ['inventory'], summary: 'List inventory (admin)', parameters: [searchParam, { in: 'query', name: 'lowStock', required: false, schema: { type: 'boolean' } }], ...adminAuth, responses: { 200: { description: 'Inventory' } } }
    },
    '/admin/inventory/{productId}': {
      put: { tags: ['inventory'], summary: 'Update inventory (admin)', parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }], ...adminAuth, responses: { 200: { description: 'Updated' } } }
    },
    '/admin/users': {
      get: { tags: ['users'], summary: 'List users (admin)', parameters: [searchParam, ...paginationParams], ...adminAuth, responses: { 200: { description: 'Users' } } }
    },
    '/admin/users/{id}': {
      get: { tags: ['users'], summary: 'User details (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } } },
      put: { tags: ['users'], summary: 'Update user role/status (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } }
    },
    '/admin/stats': {
      get: { tags: ['analytics'], summary: 'Dashboard stats (admin)', ...adminAuth, responses: { 200: { description: 'Stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/Stats' } } } } } }
    },
    '/admin/returns': {
      get: { tags: ['returns'], summary: 'List returns (admin)', parameters: [...paginationParams, statusParam('status', ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED'])], ...adminAuth, responses: { 200: { description: 'Returns' } } }
    },
    '/admin/returns/{id}': {
      get: { tags: ['returns'], summary: 'Return details (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Return' } } },
      put: { tags: ['returns'], summary: 'Update return status (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      post: { tags: ['returns'], summary: 'Issue refund for a return (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Refund issued' } } }
    },
    '/admin/returns/{id}/notes': {
      post: { tags: ['returns'], summary: 'Add a note to a return (admin)', parameters: [idParam], ...adminAuth, responses: { 201: { description: 'Note added' } } }
    },
    '/admin/contact': {
      get: { tags: ['contact'], summary: 'List contact messages (admin)', parameters: [...paginationParams, statusParam('status', ['NEW', 'OPEN', 'RESOLVED'])], ...adminAuth, responses: { 200: { description: 'Messages' } } }
    },
    '/admin/contact/{id}': {
      get: { tags: ['contact'], summary: 'Contact message details (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Message' } } },
      put: { tags: ['contact'], summary: 'Update message status (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } }
    },
    '/admin/contact/{id}/reply': {
      post: { tags: ['contact'], summary: 'Reply to a contact message (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Replied' } } }
    },
    '/admin/coupons': {
      get: { tags: ['coupons'], summary: 'List coupons (admin)', ...adminAuth, responses: { 200: { description: 'Coupons' } } },
      post: { tags: ['coupons'], summary: 'Create coupon (admin)', ...adminAuth, responses: { 201: { description: 'Created' } } }
    },
    '/admin/coupons/{id}': {
      put: { tags: ['coupons'], summary: 'Update coupon (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['coupons'], summary: 'Delete coupon (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Deleted' } } }
    },
    '/admin/media/upload': {
      post: { tags: ['media'], summary: 'Upload media (admin)', ...adminAuth, responses: { 201: { description: 'Uploaded' } } }
    },
    '/admin/shipments': {
      get: { tags: ['orders'], summary: 'List shipments (admin)', ...adminAuth, responses: { 200: { description: 'Shipments' } } }
    },
    '/admin/shipments/{id}/status': {
      put: { tags: ['orders'], summary: 'Update shipment status (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } }
    },
    '/admin/tax-rules': {
      get: { tags: ['settings'], summary: 'List tax rules (admin)', ...adminAuth, responses: { 200: { description: 'Tax rules' } } },
      post: { tags: ['settings'], summary: 'Create tax rule (admin)', ...adminAuth, responses: { 201: { description: 'Created' } } }
    },
    '/admin/tax-rules/{id}': {
      put: { tags: ['settings'], summary: 'Update tax rule (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['settings'], summary: 'Delete tax rule (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Deleted' } } }
    },
    '/admin/settings': {
      get: { tags: ['settings'], summary: 'Get all store settings (admin)', ...adminAuth, responses: { 200: { description: 'Settings' } } },
      put: { tags: ['settings'], summary: 'Update store settings (admin)', ...adminAuth, responses: { 200: { description: 'Updated' } } }
    },
    '/admin/notifications/broadcast': {
      post: { tags: ['notifications'], summary: 'Broadcast a notification (admin)', ...adminAuth, responses: { 200: { description: 'Broadcast sent' } } }
    },
    '/admin/staff': {
      get: { tags: ['users'], summary: 'List staff (admin)', ...adminAuth, responses: { 200: { description: 'Staff' } } },
      post: { tags: ['users'], summary: 'Create staff member (admin)', ...adminAuth, responses: { 201: { description: 'Created' } } }
    },
    '/admin/staff/{id}': {
      put: { tags: ['users'], summary: 'Update staff member (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['users'], summary: 'Remove staff member (admin)', parameters: [idParam], ...adminAuth, responses: { 200: { description: 'Removed' } } }
    },
    '/admin/staff/roles': {
      get: { tags: ['users'], summary: 'List staff roles (admin)', ...adminAuth, responses: { 200: { description: 'Roles' } } }
    },

    // ============ Misc ============
    '/coupons/validate': {
      post: {
        tags: ['coupons'],
        summary: 'Validate a coupon code',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: { code: { type: 'string' }, subtotal: { type: 'number' } }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Coupon result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean' },
                    code: { type: 'string' },
                    discountAmount: { type: 'number' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/tax-rules/default': {
      get: { tags: ['settings'], summary: 'Get the default tax rate', responses: { 200: { description: 'Tax rate', content: { 'application/json': { schema: { type: 'object', properties: { rate: { type: 'number' }, country: { type: 'string' } } } } } } } }
    },
    '/returns': {
      post: {
        tags: ['returns'],
        summary: 'Submit a return request',
        ...bearerAuth,
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'reason'],
                properties: { orderId: { type: 'string' }, reason: { type: 'string' }, items: { type: 'array', items: { type: 'object' } } }
              }
            }
          }
        },
        responses: { 201: { description: 'Return created' } }
      }
    },
    '/contact': {
      post: {
        tags: ['contact'],
        summary: 'Send a contact message',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'message'],
                properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, subject: { type: 'string' }, message: { type: 'string' } }
              }
            }
          }
        },
        responses: { 201: { description: 'Message sent' } }
      }
    },
    '/notifications': {
      get: { tags: ['notifications'], summary: 'List the current user notifications', ...bearerAuth, responses: { 200: { description: 'Notifications' } } }
    },
    '/notifications/unread-count': {
      get: { tags: ['notifications'], summary: 'Unread notification count', ...bearerAuth, responses: { 200: { description: 'Count', content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' } } } } } } } }
    },
    '/notifications/read-all': {
      post: { tags: ['notifications'], summary: 'Mark all notifications as read', ...bearerAuth, responses: { 200: { description: 'Marked' } } }
    },
    '/notifications/{id}/read': {
      post: { tags: ['notifications'], summary: 'Mark a notification as read', parameters: [idParam], ...bearerAuth, responses: { 200: { description: 'Marked' } } }
    },
    '/settings': {
      get: { tags: ['settings'], summary: 'Get public store settings', responses: { 200: { description: 'Public settings' } } }
    },
    '/health': {
      get: { tags: ['health'], summary: 'Health check', responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, uptime: { type: 'number' } } } } } } } }
    }
  }
} as const;
