import React, { useMemo, useState } from 'react';

const branches = [
  {
    name: 'Freshway London Central',
    location: 'Mayfair, London',
    hours: '6:00 - 23:00',
    fulfillment: 'Same-day delivery + pickup',
  },
  {
    name: 'Freshway Manchester Hub',
    location: 'Northern Quarter, Manchester',
    hours: '6:30 - 22:30',
    fulfillment: '2-hour delivery slots',
  },
  {
    name: 'Freshway Edinburgh Market',
    location: 'New Town, Edinburgh',
    hours: '7:00 - 22:00',
    fulfillment: 'Express + scheduled delivery',
  },
];

const categories = [
  {
    title: 'Organic Produce',
    description: 'Locally sourced fruit & vegetables delivered daily.',
    tag: 'Farm partners',
  },
  {
    title: 'Butchery & Seafood',
    description: 'Premium cuts, line-caught fish, and chef selections.',
    tag: 'Chef curated',
  },
  {
    title: 'Bakery Atelier',
    description: 'Freshly baked sourdough, pastries, and artisan treats.',
    tag: 'Baked hourly',
  },
  {
    title: 'Pantry Essentials',
    description: 'International staples, spices, and gourmet ingredients.',
    tag: 'Global aisle',
  },
];

const products = [
  {
    id: 'organic-harvest-box',
    name: 'Organic Harvest Box',
    details: 'Seasonal fruit + veg box (12 items)',
    price: 34,
    badge: 'Best seller',
  },
  {
    id: 'prime-steak-selection',
    name: 'Prime Steak Selection',
    details: 'Dry-aged sirloin, 4x 220g',
    price: 42,
    badge: 'Butcher pick',
  },
  {
    id: 'coastal-seafood-pack',
    name: 'Coastal Seafood Pack',
    details: 'Salmon, prawns, mussels, lemon herb butter',
    price: 48,
    badge: 'Limited',
  },
  {
    id: 'artisan-bakery-crate',
    name: 'Artisan Bakery Crate',
    details: 'Sourdough, focaccia, croissant duo',
    price: 26,
    badge: 'Fresh daily',
  },
  {
    id: 'family-freezer-bundle',
    name: 'Family Freezer Bundle',
    details: 'Ready-to-cook meals for 4 nights',
    price: 58,
    badge: 'New',
  },
  {
    id: 'wellness-pantry-box',
    name: 'Wellness Pantry Box',
    details: 'Organic grains, nut butters, superfood blends',
    price: 39,
    badge: 'Nutritionist approved',
  },
];

const testimonials = [
  {
    quote:
      'Freshway has the breadth of a global marketplace with the care of a local grocer. The curated boxes are immaculate.',
    name: 'Priya Shah',
    role: 'Private chef, London',
  },
  {
    quote:
      'The logistics are incredible. I can schedule weekly staples, then top up the same day for dinner parties.',
    name: 'Harrison Clarke',
    role: 'Hospitality director, Manchester',
  },
  {
    quote:
      'From pantry to premium cuts, every delivery feels boutique. Customer support remembers our preferences.',
    name: 'Eilidh McKenzie',
    role: 'Founder, Edinburgh',
  },
];

const formatCurrency = (value) => `£${value.toFixed(2)}`;

export default function App() {
  const [cartItems, setCartItems] = useState([]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery = subtotal > 0 ? 4.5 : 0;
    const concierge = subtotal > 120 ? 0 : subtotal > 0 ? 6.5 : 0;
    const total = subtotal + delivery + concierge;

    return { subtotal, delivery, concierge, total };
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div className="market-app">
      <header className="market-header">
        <div className="brand">
          <span className="brand-mark">F</span>
          <div>
            <p className="brand-name">Freshway Market</p>
            <p className="brand-tagline">Luxury grocery, delivered like a flagship marketplace.</p>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#branches">Branches</a>
          <a href="#catalogue">Catalogue</a>
          <a href="#members">Membership</a>
          <a href="#account">Account</a>
        </nav>
        <button className="primary-button">Launch concierge chat</button>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Enterprise-grade grocery experience</p>
            <h1>Your private grocery marketplace, built for premium households and businesses.</h1>
            <p className="hero-copy">
              Freshway combines the scale of a global retailer with white-glove service. Choose from
              thousands of gourmet items, schedule multi-branch fulfilment, and manage household
              preferences in one secure portal.
            </p>
            <div className="hero-actions">
              <button className="primary-button">Start membership</button>
              <button className="ghost-button">Request a sourcing call</button>
            </div>
            <div className="hero-metrics">
              <div>
                <h3>120K+</h3>
                <p>Premium SKUs across 4 continents</p>
              </div>
              <div>
                <h3>30 min</h3>
                <p>Express pickup for priority members</p>
              </div>
              <div>
                <h3>98%</h3>
                <p>On-time delivery SLA</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <h2>Today’s concierge plan</h2>
            <ul>
              <li>Curated produce based on pantry scan.</li>
              <li>Chef-ready protein selection delivered at 5pm.</li>
              <li>Sommelier add-ons to pair with dinner.</li>
            </ul>
            <div className="hero-card-footer">
              <span>Next delivery slot</span>
              <strong>18:30 - 19:00</strong>
            </div>
          </div>
        </section>

        <section id="branches" className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Multi-branch operations</p>
              <h2>Flagship branches with unified inventory</h2>
            </div>
            <p className="section-copy">
              Manage inventory and fulfilment across luxury city hubs. Each branch is synchronised
              for same-day fulfillment, click & collect, and VIP lounge access.
            </p>
          </div>
          <div className="branch-grid">
            {branches.map((branch) => (
              <article key={branch.name} className="branch-card">
                <div>
                  <h3>{branch.name}</h3>
                  <p>{branch.location}</p>
                </div>
                <div>
                  <span className="chip">{branch.hours}</span>
                  <span className="chip chip-outline">{branch.fulfillment}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section dark">
          <div className="section-header">
            <div>
              <p className="eyebrow">Marketplace categories</p>
              <h2>Curated departments, stocked hourly</h2>
            </div>
            <p className="section-copy">
              Explore specialty categories with direct partnerships from farms, fisheries, and
              artisan studios.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article key={category.title} className="category-card">
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
                <span className="chip">{category.tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="catalogue" className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Featured concierge bundles</p>
              <h2>Premium assortments ready for immediate dispatch</h2>
            </div>
            <p className="section-copy">
              Add items to your cart, configure household preferences, and submit curated delivery
              instructions.
            </p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <div>
                  <span className="badge">{product.badge}</span>
                  <h3>{product.name}</h3>
                  <p>{product.details}</p>
                </div>
                <div className="product-footer">
                  <strong>{formatCurrency(product.price)}</strong>
                  <button className="primary-button" onClick={() => handleAddToCart(product)}>
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section split" id="members">
          <div className="split-card">
            <p className="eyebrow">Membership tiers</p>
            <h2>Amazon-scale assortment, concierge-level care.</h2>
            <p>
              Choose from private household memberships or enterprise plans with multi-branch
              procurement, approval workflows, and dedicated sourcing teams.
            </p>
            <ul className="list">
              <li>Unified invoice management and monthly spending insights.</li>
              <li>24/7 concierge access and priority customer support.</li>
              <li>Personalised recommendations with dietary and allergy profiles.</li>
            </ul>
            <button className="ghost-button">Compare plans</button>
          </div>
          <div className="split-card light">
            <h3>Live cart summary</h3>
            {cartItems.length === 0 ? (
              <p className="muted">No items yet. Add concierge bundles to build your order.</p>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <h4>{item.name}</h4>
                      <p>{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="cart-actions">
                      <button
                        className="icon-button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        aria-label={`Remove one ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="icon-button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        aria-label={`Add one ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(cartSummary.subtotal)}</strong>
              </div>
              <div>
                <span>Express delivery</span>
                <strong>{formatCurrency(cartSummary.delivery)}</strong>
              </div>
              <div>
                <span>Concierge packaging</span>
                <strong>{formatCurrency(cartSummary.concierge)}</strong>
              </div>
              <div className="total">
                <span>Total due</span>
                <strong>{formatCurrency(cartSummary.total)}</strong>
              </div>
            </div>
            <button className="primary-button">Proceed to secure checkout</button>
          </div>
        </section>

        <section className="section" id="account">
          <div className="section-header">
            <div>
              <p className="eyebrow">Customer data vault</p>
              <h2>Securely manage credentials, delivery profiles, and preferences</h2>
            </div>
            <p className="section-copy">
              Store customer credentials, addresses, and household preferences with encryption and
              role-based access controls. Built for enterprise compliance.
            </p>
          </div>
          <div className="account-grid">
            <div className="account-card">
              <h3>Login credentials</h3>
              <div className="form-grid">
                <label>
                  Corporate email
                  <input type="email" placeholder="you@freshway.com" />
                </label>
                <label>
                  Password
                  <input type="password" placeholder="••••••••" />
                </label>
                <label>
                  Multi-factor preference
                  <select>
                    <option>Email OTP</option>
                    <option>Authenticator app</option>
                    <option>SMS for branch managers</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="account-card">
              <h3>Personal data</h3>
              <div className="form-grid">
                <label>
                  Full name
                  <input type="text" placeholder="Alex Morgan" />
                </label>
                <label>
                  Primary delivery address
                  <input type="text" placeholder="14 Berkeley Square, London" />
                </label>
                <label>
                  Dietary preferences
                  <textarea rows="3" placeholder="Organic only, no shellfish, low sodium" />
                </label>
              </div>
            </div>
            <div className="account-card highlight">
              <h3>Household & business profiles</h3>
              <p>
                Assign multiple delivery profiles for households, teams, or executive suites. Keep
                payment methods, budgets, and approval chains separate per branch.
              </p>
              <ul className="list">
                <li>Branch-specific inventory allocations</li>
                <li>Spend caps and automatic replenishments</li>
                <li>Private notes for concierge staff</li>
              </ul>
              <button className="ghost-button">Configure profiles</button>
            </div>
          </div>
        </section>

        <section className="section testimonials">
          <div className="section-header">
            <div>
              <p className="eyebrow">Client testimonials</p>
              <h2>Trusted by boutique hotels, private households, and luxury venues</h2>
            </div>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card">
                <p>“{testimonial.quote}”</p>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="market-footer">
        <div>
          <h3>Freshway Market</h3>
          <p>Enterprise grocery experience with the care of a private concierge.</p>
        </div>
        <div>
          <h4>Operations</h4>
          <p>London · Manchester · Edinburgh · Coming soon: Dubai</p>
        </div>
        <div>
          <h4>Support</h4>
          <p>concierge@freshway.market · +44 (0)20 7946 0958</p>
        </div>
      </footer>
    </div>
  );
}
