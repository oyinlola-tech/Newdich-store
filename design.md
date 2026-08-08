# E-commerce Design System

## 1. Purpose

This document defines the visual and interaction system for the
e-commerce platform.

The design direction combines:

-   Strong editorial composition
-   Bold typography
-   Large visual statements
-   Flexible image and product layouts
-   Confident use of whitespace
-   Modular content blocks
-   Expressive marketing sections
-   Clear, conversion-focused shopping interfaces

The system is inspired by the design philosophy of modern global fintech
and consumer brands, particularly the use of bold typography, modular
compositions, photography, color blocking, and distinctive visual
storytelling.

**This is not a Wise clone.**

The existing brand color system is the source of truth and must remain
unchanged.

------------------------------------------------------------------------

# 2. Core Design Principle

> Keep the existing brand identity. Change how the identity is
> expressed.

The redesign must not replace, recolor, or redefine the existing brand
palette.

The new system introduces:

-   Editorial layouts
-   Strong typography
-   Asymmetrical compositions
-   Large type
-   Image-led storytelling
-   Modular sections
-   Controlled visual contrast
-   More expressive product presentation
-   More intentional motion

The result should feel like an evolution of the existing brand rather
than a rebrand.

------------------------------------------------------------------------

# 3. Non-Negotiable Brand Rule

## Existing Colors Must Be Preserved

The existing color system must remain the single source of truth.

Do not:

-   Replace the primary brand color
-   Introduce Wise green
-   Copy Wise's color palette
-   Replace existing secondary colors
-   Randomly introduce decorative colors
-   Change brand colors to match references
-   Create unrelated gradients
-   Use color purely for decoration when it reduces accessibility

New visual richness must come from:

-   Typography
-   Composition
-   Photography
-   Scale
-   Whitespace
-   Shape
-   Layout
-   Contrast
-   Motion
-   Cropping
-   Product presentation

### Existing Color Tokens

Replace the values below with the project's current tokens. The values
must come from the existing design system.

``` css
:root {
  --color-primary: <EXISTING_PRIMARY>;
  --color-primary-hover: <EXISTING_PRIMARY_HOVER>;
  --color-primary-active: <EXISTING_PRIMARY_ACTIVE>;

  --color-secondary: <EXISTING_SECONDARY>;
  --color-secondary-hover: <EXISTING_SECONDARY_HOVER>;

  --color-accent: <EXISTING_ACCENT>;

  --color-background: <EXISTING_BACKGROUND>;
  --color-surface: <EXISTING_SURFACE>;
  --color-surface-muted: <EXISTING_SURFACE_MUTED>;

  --color-text: <EXISTING_TEXT>;
  --color-text-secondary: <EXISTING_TEXT_SECONDARY>;
  --color-text-muted: <EXISTING_TEXT_MUTED>;

  --color-border: <EXISTING_BORDER>;

  --color-success: <EXISTING_SUCCESS>;
  --color-warning: <EXISTING_WARNING>;
  --color-error: <EXISTING_ERROR>;
  --color-info: <EXISTING_INFO>;
}
```

Do not invent replacement values for these tokens.

------------------------------------------------------------------------

# 4. Design Personality

The brand should feel:

-   Confident
-   Modern
-   Human
-   Expressive
-   Useful
-   Premium
-   Approachable
-   Distinctive
-   Energetic
-   Clear

It should not feel:

-   Generic
-   Corporate
-   Overly minimal
-   Template-driven
-   Visually noisy
-   Childish
-   Luxury-exclusive
-   Like a Wise clone
-   Like a generic marketplace

------------------------------------------------------------------------

# 5. Visual Philosophy

## 5.1 Typography Is a Visual Element

Typography should not only communicate information.

It should also create composition.

Large headings may become the main visual element of a section.

Example:

``` text
EVERYDAY
THINGS.

MADE
BETTER.
```

Large display typography should be used selectively.

Do not make every heading oversized.

------------------------------------------------------------------------

## 5.2 Product Photography Is Part of the Layout

Product images should not always be trapped inside identical cards.

Use:

-   Full-bleed product images
-   Cropped product images
-   Floating product images
-   Editorial product compositions
-   Product cutouts
-   Lifestyle photography
-   Overlapping imagery
-   Image grids

Photography should support the story of the product.

------------------------------------------------------------------------

## 5.3 Composition Over Decoration

Avoid adding decorative elements simply because empty space exists.

Use composition intentionally.

A section can feel expressive through:

-   Scale
-   Alignment
-   Cropping
-   Contrast
-   Typography
-   Negative space
-   Image placement

------------------------------------------------------------------------

# 6. Layout System

The platform uses two complementary layout modes.

## 6.1 Commerce Layout

Used for:

-   Product listing
-   Search
-   Filters
-   Cart
-   Checkout
-   Orders
-   Account pages

Characteristics:

-   Predictable
-   Dense enough for browsing
-   Easy to scan
-   Consistent alignment
-   Clear hierarchy

## 6.2 Editorial Layout

Used for:

-   Homepage
-   Campaigns
-   Brand stories
-   Collections
-   Seasonal promotions
-   Featured products
-   Category introductions

Characteristics:

-   Asymmetrical
-   Large typography
-   Variable image sizes
-   Strong visual rhythm
-   Intentional whitespace
-   More expressive composition

------------------------------------------------------------------------

# 7. Grid System

Use a responsive grid.

### Desktop

``` text
12 columns
24px column gap
32px to 64px page padding
```

### Tablet

``` text
8 columns
16px to 24px gap
24px page padding
```

### Mobile

``` text
4 columns
12px to 16px gap
16px page padding
```

These values may be adjusted according to the existing application's
spacing tokens.

------------------------------------------------------------------------

# 8. Asymmetrical Layouts

Editorial sections should not always use equal columns.

Preferred patterns include:

``` text
┌────────────────────┬──────────────┐
│                    │              │
│                    │    IMAGE     │
│     BIG TYPE       │              │
│                    │              │
└────────────────────┴──────────────┘
```

``` text
┌──────────────┬────────────────────┐
│              │                    │
│    IMAGE     │     BIG TYPE       │
│              │                    │
├──────────────┴──────────────┬─────┤
│                             │     │
│          PRODUCT            │TEXT │
│                             │     │
└─────────────────────────────┴─────┘
```

``` text
┌───────────────────────────────────┐
│                                   │
│        LARGE STATEMENT             │
│                                   │
├────────────────┬──────────────────┤
│                │                  │
│    PRODUCT     │      IMAGE       │
│                │                  │
└────────────────┴──────────────────┘
```

Asymmetry should feel intentional, not random.

------------------------------------------------------------------------

# 9. Spacing

Use a consistent spacing scale.

Recommended base scale:

``` text
4
8
12
16
20
24
32
40
48
64
80
96
120
160
```

Large editorial sections may use larger spacing.

Commerce interfaces should use tighter spacing.

------------------------------------------------------------------------

# 10. Border Radius

Keep the existing brand radius system if one already exists.

Recommended semantic tokens:

``` css
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-full
```

Avoid excessive rounded cards.

Not every component needs to be a floating rounded rectangle.

Use radius according to component purpose.

------------------------------------------------------------------------

# 11. Surfaces

The interface should distinguish hierarchy using:

-   Background
-   Surface
-   Muted surface
-   Border
-   Elevation
-   Typography
-   Brand color

Do not rely on shadows for every card.

Prefer:

``` text
Spacing
+
Contrast
+
Border
+
Typography
```

before adding strong shadows.

------------------------------------------------------------------------

# 12. Shadows

Shadows should be subtle.

Use them primarily for:

-   Dropdowns
-   Menus
-   Modals
-   Floating navigation
-   Sticky elements
-   Elevated commerce components

Product cards should not automatically have heavy shadows.

------------------------------------------------------------------------

# 13. Color Usage

The existing brand palette remains unchanged.

The new design system should create variety through **color
composition**, not new colors.

Examples:

``` text
PRIMARY + BACKGROUND
PRIMARY + SURFACE
DARK TEXT + PRIMARY
PRIMARY + EXISTING ACCENT
EXISTING SECONDARY + BACKGROUND
```

Use large areas of brand color only when the existing palette supports
it.

Do not force the primary color into every section.

### Color hierarchy

``` text
Brand color
    ↓
Primary actions
    ↓
Important highlights
    ↓
Campaign moments
    ↓
Supporting visual accents
```

The majority of the shopping interface should remain calm enough to
browse.

------------------------------------------------------------------------

# 14. Typography System

The project should use a strong modern sans-serif typeface.

Define semantic roles:

``` text
Display
Display Large
Heading 1
Heading 2
Heading 3
Heading 4
Body Large
Body
Body Small
Label
Caption
Price
Numerical
```

### Display Typography

Used for:

-   Hero statements
-   Campaign headlines
-   Category introductions
-   Major brand messages

Characteristics:

-   Large
-   Heavy
-   Tight line-height
-   Strong visual presence

### Commerce Typography

Used for:

-   Product names
-   Prices
-   Filters
-   Product information
-   Checkout
-   Account pages

Characteristics:

-   Clear
-   Compact
-   Highly readable
-   Predictable

------------------------------------------------------------------------

# 15. Display Type Rules

Display headings may use:

``` css
font-size: clamp(3rem, 8vw, 9rem);
line-height: 0.88;
letter-spacing: -0.05em;
font-weight: 800;
```

These values are starting points, not absolute requirements.

Typography must remain responsive and accessible.

------------------------------------------------------------------------

# 16. Product Cards

Product cards should have a consistent information architecture while
allowing visual variation.

Required information:

``` text
Image
Brand or category where applicable
Product name
Price
Previous price where applicable
Discount where applicable
Rating where applicable
Availability where applicable
```

Optional:

``` text
Wishlist
Quick add
Quick view
Color variants
Size availability
Badges
```

### Card Principle

The content structure should remain consistent.

The visual composition can vary.

------------------------------------------------------------------------

# 17. Product Image Containers

Avoid forcing every image into the exact same visual treatment.

Supported treatments:

``` text
Square
Portrait
Landscape
Full bleed
Contained
Cropped
Lifestyle
Editorial
```

The image ratio should depend on the product category.

------------------------------------------------------------------------

# 18. Homepage

The homepage should feel like a brand experience first and a product
catalog second.

Recommended structure:

``` text
Announcement
↓
Header
↓
Hero
↓
Featured Collection
↓
Editorial Story
↓
Product Showcase
↓
Category Exploration
↓
Promotion
↓
Popular Products
↓
Brand / Trust Section
↓
Newsletter
↓
Footer
```

Not every homepage needs every section.

------------------------------------------------------------------------

# 19. Hero Section

The hero should communicate one strong idea.

Avoid:

``` text
Title
Subtitle
Three buttons
Five badges
Seven products
Multiple competing messages
```

Prefer:

``` text
ONE STRONG MESSAGE

Supporting copy

ONE PRIMARY ACTION

Strong visual
```

Example:

``` text
THE
EVERYDAY
EDIT.

Products worth
bringing home.

[Shop collection]
```

------------------------------------------------------------------------

# 20. Editorial Sections

Editorial sections can combine:

-   Large typography
-   Photography
-   Products
-   Short copy
-   Brand color blocks
-   Numbers
-   Shapes

Example:

``` text
01

MADE FOR
EVERYDAY.

[Large lifestyle image]

Explore the collection →
```

------------------------------------------------------------------------

# 21. Category Design

Categories should feel like destinations.

Instead of only:

``` text
Electronics
Fashion
Beauty
Home
```

use:

``` text
FOR YOUR
EVERYDAY.

Electronics
Fashion
Beauty
Home
```

Category cards may use:

-   Product photography
-   Lifestyle photography
-   Typography
-   Existing brand color backgrounds
-   Image cropping
-   Large category numbers

------------------------------------------------------------------------

# 22. Promotional Design

Promotions should be visually strong without becoming aggressive.

Examples:

``` text
UP TO
30% OFF
```

or:

``` text
THE
WEEKEND
EDIT.
```

Use the existing brand palette.

Promotional sections should have one obvious action.

------------------------------------------------------------------------

# 23. Navigation

Desktop navigation should prioritize:

1.  Brand
2.  Search
3.  Categories
4.  Account
5.  Wishlist
6.  Cart

Do not overload the header.

Mobile navigation should prioritize:

``` text
Home
Search
Categories
Orders
Account
```

The exact navigation can follow the existing product requirements.

------------------------------------------------------------------------

# 24. Search

Search should be one of the most accessible functions in the
application.

Include:

-   Prominent search input
-   Recent searches
-   Popular searches
-   Product suggestions
-   Category suggestions
-   Search history where appropriate

Search results should prioritize clarity over visual experimentation.

------------------------------------------------------------------------

# 25. Product Detail Page

Recommended hierarchy:

``` text
Breadcrumb
↓
Product gallery
↓
Product information
↓
Price
↓
Rating
↓
Variants
↓
Quantity
↓
Primary purchase action
↓
Delivery information
↓
Product description
↓
Specifications
↓
Reviews
↓
Related products
```

The purchase action must remain visually dominant.

------------------------------------------------------------------------

# 26. Cart

The cart should be simple and focused.

Prioritize:

-   Product
-   Quantity
-   Price
-   Remove
-   Subtotal
-   Delivery
-   Discounts
-   Total
-   Checkout

Do not use excessive editorial layouts in the checkout flow.

------------------------------------------------------------------------

# 27. Checkout

Checkout should be intentionally calm.

Use:

-   Clear sections
-   Strong form hierarchy
-   Visible order summary
-   Clear validation
-   Minimal distractions
-   Strong primary action

Avoid promotional experiments that can distract from payment completion.

------------------------------------------------------------------------

# 28. Buttons

Buttons should follow the existing brand color system.

Semantic variants:

``` text
Primary
Secondary
Tertiary
Ghost
Destructive
```

Primary actions should be visually obvious.

Avoid having multiple equally dominant buttons in one section.

------------------------------------------------------------------------

# 29. Badges

Use badges sparingly.

Examples:

``` text
NEW
SALE
BESTSELLER
LIMITED
LOW STOCK
EXCLUSIVE
```

Badges should communicate information rather than decoration.

------------------------------------------------------------------------

# 30. Icons

Icons should use one consistent visual language.

Preferred characteristics:

-   Simple
-   Clear
-   Geometric
-   Consistent stroke
-   Accessible
-   Familiar

Do not mix unrelated icon families.

Icons should support text, not replace important text.

------------------------------------------------------------------------

# 31. Photography Direction

Photography should feel:

-   Human
-   Natural
-   Modern
-   Product-focused
-   Contextual
-   Confident

Avoid excessive use of:

-   Generic corporate stock photos
-   Artificial smiles
-   Unrelated lifestyle images
-   Overly staged scenes

Where appropriate, combine product photography with lifestyle imagery.

------------------------------------------------------------------------

# 32. Decorative Language

The visual system may use:

-   Circles
-   Arrows
-   Large numbers
-   Frames
-   Cropped shapes
-   Image masks
-   Lines
-   Organic forms
-   Brand-colored blocks

Decorative elements must remain subordinate to the content.

------------------------------------------------------------------------

# 33. Motion

Motion should feel intentional.

Recommended:

``` text
150ms
200ms
250ms
300ms
400ms
```

Use motion for:

-   Hover
-   Navigation
-   Product image transitions
-   Cart feedback
-   Modal transitions
-   Page transitions
-   Scroll reveals

Avoid:

-   Excessive bouncing
-   Long animations
-   Animation on every element
-   Motion that delays shopping actions

Respect reduced-motion preferences.

------------------------------------------------------------------------

# 34. Responsive Design

The design must be mobile-first.

### Mobile

Prioritize:

-   Product discovery
-   Search
-   Purchase actions
-   Navigation
-   Readability

### Tablet

Increase:

-   Grid density
-   Image size
-   Content width

### Desktop

Allow:

-   Larger editorial compositions
-   Asymmetrical grids
-   Larger display typography
-   Richer photography
-   Multi-column product layouts

------------------------------------------------------------------------

# 35. Accessibility

Minimum requirements:

-   WCAG-conscious color contrast
-   Keyboard navigation
-   Visible focus states
-   Semantic HTML
-   Accessible form labels
-   Alternative text for meaningful images
-   Reduced-motion support
-   Touch targets of approximately 44px or larger
-   No information conveyed by color alone

Existing brand colors must be tested for contrast before being used for
text.

------------------------------------------------------------------------

# 36. Design Tokens

The implementation should expose semantic tokens rather than hard-coded
values.

Example:

``` css
:root {
  /* Color */
  --color-primary: var(--brand-primary);
  --color-background: var(--brand-background);
  --color-surface: var(--brand-surface);
  --color-text: var(--brand-text);

  /* Typography */
  --font-display: var(--font-brand);
  --font-body: var(--font-brand);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;
}
```

The actual brand values must remain connected to the existing project's
tokens.

------------------------------------------------------------------------

# 37. Tailwind Integration

If Tailwind CSS is used, map the existing design tokens into Tailwind
rather than creating a second independent color system.

Example:

``` ts
theme: {
  extend: {
    colors: {
      brand: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
      },
    },
  },
}
```

Usage:

``` tsx
<button className="bg-brand-primary text-brand-background">
  Add to cart
</button>
```

Do not hard-code brand colors inside individual components.

------------------------------------------------------------------------

# 38. Component Architecture

Components should be reusable and composable.

Recommended categories:

``` text
components/
├── navigation/
├── buttons/
├── typography/
├── cards/
├── product/
├── category/
├── pricing/
├── badges/
├── forms/
├── search/
├── cart/
├── checkout/
├── editorial/
├── marketing/
├── media/
├── feedback/
└── layout/
```

Editorial components should not be tightly coupled to specific pages.

------------------------------------------------------------------------

# 39. Component Philosophy

Components should separate:

``` text
Content
Structure
Visual treatment
Behavior
```

For example:

``` tsx
<EditorialSection
  title="Everyday essentials"
  description="..."
  image="..."
  variant="split"
/>
```

The component controls layout.

The content controls meaning.

Variants control composition.

------------------------------------------------------------------------

# 40. Visual Variants

Components may expose controlled variants.

Example:

``` ts
type EditorialVariant =
  | "split"
  | "full-bleed"
  | "asymmetric"
  | "stacked"
  | "bento";
```

Avoid creating dozens of one-off components.

Prefer a small number of flexible components.

------------------------------------------------------------------------

# 41. Commerce vs Editorial Rule

This is one of the most important rules in the system.

### Editorial experience

Can be:

-   Bold
-   Asymmetrical
-   Experimental
-   Image-heavy
-   Typographic

### Commerce experience

Must be:

-   Clear
-   Fast
-   Predictable
-   Accessible
-   Conversion-focused

The design language connects both experiences, but they should not have
identical layouts.

------------------------------------------------------------------------

# 42. Brand Consistency

Every page should share:

-   Typography
-   Color system
-   Spacing
-   Iconography
-   Button behavior
-   Interaction patterns
-   Motion principles

Pages may differ in composition without feeling like separate products.

------------------------------------------------------------------------

# 43. Do

Do:

-   Preserve the existing brand colors
-   Use typography as a visual element
-   Use large editorial moments
-   Create varied compositions
-   Use real product imagery
-   Maintain strong hierarchy
-   Use whitespace intentionally
-   Keep shopping flows simple
-   Build reusable components
-   Use semantic design tokens
-   Test accessibility

------------------------------------------------------------------------

# 44. Don't

Don't:

-   Copy Wise's visual identity
-   Use Wise's green as a replacement brand color
-   Copy Wise logos, illustrations, or campaign artwork
-   Add random colors
-   Turn every component into a rounded card
-   Overuse oversized typography
-   Sacrifice usability for aesthetics
-   Make checkout experimental
-   Hard-code colors
-   Create one-off designs for every page

------------------------------------------------------------------------

# 45. Design Quality Checklist

Before shipping a page, verify:

### Brand

-   [ ] Existing brand colors are unchanged
-   [ ] No unrelated colors were introduced
-   [ ] Typography matches the system
-   [ ] Brand identity remains recognizable

### Layout

-   [ ] Grid is consistent
-   [ ] Spacing is intentional
-   [ ] Visual hierarchy is clear
-   [ ] Editorial layouts feel deliberate

### Commerce

-   [ ] Products are easy to scan
-   [ ] Prices are obvious
-   [ ] Purchase actions are clear
-   [ ] Search is accessible
-   [ ] Checkout is distraction-free

### Accessibility

-   [ ] Contrast is sufficient
-   [ ] Focus states are visible
-   [ ] Keyboard navigation works
-   [ ] Touch targets are large enough
-   [ ] Images have appropriate alt text
-   [ ] Reduced motion is respected

### Responsive

-   [ ] Mobile layout works
-   [ ] Tablet layout works
-   [ ] Desktop layout works
-   [ ] Typography scales correctly
-   [ ] Images do not break the layout

------------------------------------------------------------------------

# 46. Final Design Direction

The final product should feel like:

> **The existing brand, expressed with a much stronger visual voice.**

The goal is not to make the store look like Wise.

The goal is to borrow the useful design principles behind modern
expressive brand systems:

``` text
Existing Brand
      +
Bold Typography
      +
Editorial Composition
      +
Strong Photography
      +
Modular Layouts
      +
Controlled Color
      +
Excellent Commerce UX
      =
Distinctive E-commerce Experience
```

The existing color system remains the foundation.

The new design language becomes the expression.
