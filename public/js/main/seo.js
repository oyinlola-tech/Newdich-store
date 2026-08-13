(function () {
    const pageNames = {
      '/': 'Home',
      '/products': 'Products',
      '/product-detail': 'Product',
      '/cart': 'Cart',
      '/checkout': 'Checkout',
      '/account': 'Account',
      '/wishlist': 'Wishlist',
      '/returns': 'Returns',
      '/contact': 'Contact',
      '/login': 'Login',
      '/register': 'Register',
      '/forgot-password': 'Forgot Password',
      '/reset-password': 'Reset Password',
      '/otp': 'Verify OTP',
      '/track': 'Track Order',
      '/about': 'Our Story',
      '/terms': 'Terms of Service',
      '/privacy': 'Privacy Policy',
      '/cookies': 'Cookie Settings',
      '/faqs': 'FAQs'
    };

    const descriptions = {
      '/': 'Discover curated essentials at Telente Store. Good things, everyday.',
      '/products': 'Browse our full collection of curated products. Filter by category, price, and more.',
      '/cart': 'Review your cart and proceed to checkout.',
      '/account': 'Manage your account settings and preferences.',
      '/contact': 'Get in touch with our support team.',
      '/faqs': 'Find answers to common questions about shopping, delivery, returns, and payments.'
    };

    const path = window.location.pathname;
    const pageName = pageNames[path] || 'Telente Store';
    const description = descriptions[path] || 'Shop curated essentials at Telente Store.';

    document.title = `${pageName} | Telente Store`;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + path;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const ogTitleTag = document.createElement('meta');
      ogTitleTag.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleTag);
    }
    document.querySelector('meta[property="og:title"]').setAttribute('content', pageName);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      const ogDescTag = document.createElement('meta');
      ogDescTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescTag);
    }
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      const ogUrlTag = document.createElement('meta');
      ogUrlTag.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlTag);
    }
    document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      const twitterTitleTag = document.createElement('meta');
      twitterTitleTag.name = 'twitter:title';
      document.head.appendChild(twitterTitleTag);
    }
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', pageName);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      const twitterDescTag = document.createElement('meta');
      twitterDescTag.name = 'twitter:description';
      document.head.appendChild(twitterDescTag);
    }
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
  })();
