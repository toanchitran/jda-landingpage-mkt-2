# Design Requirements Documentation
## JDA Landing Page - Fundraising Flywheel

---

## 🎨 **Color System & Variables**

### Primary Color Palette
```css
--black: #000000
--deep-blue: #03032e          /* Primary background */
--lighter-deep-blue: #09093e  /* Secondary background */
--gold: #fabf01               /* Primary accent/buttons */
--copper: #c0a876             /* Secondary accent */
--white: #ffffff
```

### Theme Colors
```css
--primary-bg: #03032e         /* Main background */
--secondary-bg: #09093e       /* Secondary sections */
--primary-text: #ffffff       /* Main text color */
--secondary-text-80: #818197  /* Secondary text */
--secondary-text-60: rgba(129, 129, 151, 0.6)
--medium-grey: #C3C3C3        /* Medium contrast text */
--light-grey: #E2E2E2         /* Light text */
--deep-grey: #7F7F7F          /* Dark secondary text */
```

### UI Component Colors
```css
--card-elevated: #09093e66         /* Semi-transparent cards */
--card-accent-1: #fabf0133         /* Gold accent cards */
--card-accent-2: #c0a87640         /* Copper accent cards */
--button-primary: #fabf01          /* Primary buttons */
--button-secondary: #c0a876        /* Secondary buttons */
--accent-elements: #fabf01         /* Accent elements */
--dividers-borders: #c0a87680      /* Borders and dividers */
--hover-states: #fabf01cc          /* Hover effects */
```

### Custom Card Background Colors
```css
--kavecon: #d2c29f
--maco: #f2ede3
--custom-village: #e2cfb9
--digicon: #c1ab93
```

---

## 📏 **Spacing System**

### Global Padding System
The site uses a responsive `padding-global` class with the following breakpoints:

```css
/* Mobile (default) */
.padding-global {
  padding-left: 1rem;   /* 16px */
  padding-right: 1rem;  /* 16px */
}

/* Small screens (640px+) */
@media (min-width: 640px) {
  .padding-global {
    padding-left: 2rem;   /* 32px */
    padding-right: 2rem;  /* 32px */
  }
}

/* Medium screens (768px+) */
@media (min-width: 768px) {
  .padding-global {
    padding-left: 3rem;   /* 48px */
    padding-right: 3rem;  /* 48px */
  }
}

/* Large screens (1024px+) */
@media (min-width: 1024px) {
  .padding-global {
    padding-left: 5vw;    /* 5% of viewport width */
    padding-right: 5vw;   /* 5% of viewport width */
  }
}
```

### Section Spacing
- **Vertical section padding**: `py-16 sm:py-20` (64px mobile, 80px desktop)
- **Container max-width**: `max-w-6xl` (1152px)
- **Content max-width**: `max-w-4xl` (896px) for text content
- **Modal max-width**: `max-w-3xl` (768px) for modals

### Component Spacing Patterns
- **Heading margins**: `mb-4` (16px) standard, `mb-6` (24px) for larger gaps
- **Paragraph margins**: `mb-6` (24px) standard, `mb-8` (32px) for sections
- **Grid gaps**: `gap-6` (24px) mobile, `gap-12` (48px) desktop
- **Card padding**: `p-6` (24px) mobile, `p-10` (40px) desktop
- **Button spacing**: `space-x-2` (8px) mobile, `space-x-4` (16px) desktop

---

## 🔤 **Typography System**

### Font Family
```css
font-family: Arial, Helvetica, sans-serif
```

### Heading Hierarchy

#### H1 - Main Headlines
```css
/* Base styles */
h1 {
  font-size: 38px;
  line-height: 44px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

/* Hero heading */
h1.is-hero {
  font-size: 4rem;        /* 64px */
  line-height: 1.15;
  letter-spacing: -0.045em;
}
```

**Responsive H1 Classes:**
- `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`
  - Mobile: 30px
  - Small: 36px
  - Medium: 48px
  - Large: 60px
  - XL: 72px

#### H2 - Section Headers
```css
h2 {
  font-size: 32px;
  line-height: 36px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}
```

**Responsive H2 Classes:**
- `text-2xl sm:text-3xl md:text-4xl`
  - Mobile: 24px
  - Small: 30px
  - Medium: 36px

#### H3 - Subsection Headers
```css
h3 {
  font-size: 24px;
  line-height: 30px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}
```

**Responsive H3 Classes:**
- `text-2xl sm:text-3xl md:text-4xl`

#### H4 - Component Headers
```css
h4 {
  font-size: 18px;
  line-height: 24px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: 500;
}
```

**Classes:**
- `text-xl font-bold` (20px)
- `text-2xl font-bold` (24px)

### Body Text Hierarchy

#### Primary Body Text
- `text-lg sm:text-xl md:text-2xl` - Hero descriptions
  - Mobile: 18px
  - Small: 20px
  - Medium: 24px

#### Secondary Body Text
- `text-sm sm:text-base` - Standard content
  - Mobile: 14px
  - Small: 16px

#### Small Text
- `text-sm` - Captions, labels (14px)
- `text-xs` - Fine print (12px)

### Navigation Typography
- Logo/Brand: `text-xl font-bold` (20px)
- Navigation links: `font-semibold`

---

## 📱 **Responsive Breakpoints**

### Tailwind CSS Breakpoints
```css
/* Small devices (640px and up) */
sm: 640px

/* Medium devices (768px and up) */
md: 768px

/* Large devices (1024px and up) */
lg: 1024px

/* Extra large devices (1280px and up) */
xl: 1280px

/* 2X Extra large devices (1536px and up) */
2xl: 1536px
```

### Mobile-First Design Patterns

#### Layout Changes
- **Grid layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Hidden/Show elements**: `hidden md:block` or `md:hidden`
- **Flex direction**: `flex-col sm:flex-row`
- **Text alignment**: `text-center md:text-left`

#### Component Sizing
- **Navigation height**: `h-8 sm:h-12` (32px mobile, 48px desktop)
- **Button spacing**: `space-x-2 sm:space-x-4`
- **Carousel indicators**: `w-2.5 h-2.5 sm:w-3 sm:h-3`

#### Content Width Adjustments
- **Carousel cards**: `w-full sm:w-11/12 md:w-96 lg:w-[500px] xl:w-[500px]`
- **Aspect ratios**: `aspect-[4/3]` for cards, `aspect-video` for media

---

## 📱 **Mobile Device Optimizations**

### Touch-Friendly Design
- **Minimum touch targets**: 44px (following iOS guidelines)
- **Button padding**: `py-3 px-6` (12px vertical, 24px horizontal)
- **Hover states**: Converted to active states on mobile
- **Scroll behavior**: Smooth scrolling enabled

### Mobile-Specific Classes
- **Mobile padding**: Reduced padding on small screens
- **Mobile typography**: Smaller font sizes with good readability
- **Mobile navigation**: Simplified navigation bar
- **Mobile carousel**: Full-width cards with touch scrolling

### Performance Optimizations
- **Image optimization**: `unoptimized={true}` for specific cases
- **Lazy loading**: Images load as needed
- **Reduced animations**: Respect user's motion preferences

---

## 📱 **iPhone-Specific Requirements**

### Video Autoplay Optimization
All videos must include these attributes for iPhone compatibility:

```jsx
<video
  autoPlay
  muted
  loop
  playsInline
  webkit-playsinline="true"
  preload="metadata"
  className="w-full h-full object-cover"
>
  <source src="/video.mp4" type="video/mp4" />
</video>
```

#### Critical iPhone Video Attributes
1. **`autoPlay`** - Enables automatic playback
2. **`muted`** - Required for autoplay on iOS
3. **`playsInline`** - Prevents fullscreen on iOS
4. **`webkit-playsinline="true"`** - Legacy iOS support
5. **`preload="metadata"`** - Optimizes loading
6. **Proper attribute order** - iOS is sensitive to order

### iPhone Autoplay Fallback
Implemented JavaScript fallback for autoplay failures:

```javascript
// Fallback mechanism for iOS autoplay restrictions
useEffect(() => {
  if (mounted) {
    const videos = document.querySelectorAll('video[autoplay]');
    
    const handleUserInteraction = () => {
      videos.forEach((video) => {
        const videoElement = video as HTMLVideoElement;
        if (videoElement.paused) {
          videoElement.play().catch(() => {
            // Silently handle autoplay failures
          });
        }
      });
      
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction, { passive: true });
  }
}, [mounted]);
```

### iPhone-Specific Considerations
1. **Low Power Mode**: Videos won't autoplay when enabled
2. **Reduce Motion**: May prevent video autoplay
3. **Audio tracks**: Remove audio tracks entirely for background videos
4. **File format**: Use H.264 codec for best compatibility
5. **File size**: Optimize for mobile networks
6. **Touch events**: Use `touchstart` for immediate response

### Safari-Specific Optimizations
- **Backdrop blur**: `backdrop-blur-md` for iOS Safari
- **Transform optimizations**: `will-change: transform` for smooth animations
- **Viewport meta**: Proper viewport configuration for iOS
- **Safe areas**: Consider iPhone notch and home indicator

---

## 🎯 **Component-Specific Requirements**

### Button System
```css
.button {
  padding: 0.5rem 1.5rem;     /* 8px 24px */
  font-size: 1rem;            /* 16px */
  border-radius: 9999px;      /* Fully rounded */
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;               /* 8px gap for icons */
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### Card System
- **Border radius**: `rounded-2xl` (16px) for cards
- **Elevation**: Semi-transparent backgrounds with blur effects
- **Padding**: `p-6` mobile, `p-10` desktop
- **Hover effects**: `hover:scale-105` with transitions

### Navigation System
- **Fixed positioning**: `fixed top-0 left-0 right-0 z-50`
- **Backdrop blur**: Dynamic based on scroll position
- **Responsive padding**: Uses `padding-global` system
- **Logo sizing**: `h-8 sm:h-12 w-auto`

### Carousel System
- **Card width**: Responsive `w-full sm:w-11/12 md:w-96 lg:w-[500px]`
- **Transform animations**: `duration-700 ease-in-out`
- **Hover pause**: Auto-advance pauses on hover
- **Touch-friendly**: Mobile swipe support

---

## 🔧 **Animation & Interaction Guidelines**

### Transition Standards
- **Standard duration**: `duration-300` (300ms)
- **Long transitions**: `duration-700` (700ms) for major state changes
- **Easing**: `ease-in-out` for most animations
- **Hover delays**: Immediate response with smooth transitions

### Marquee Animations
```css
@keyframes marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes marquee-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.animate-marquee-left {
  animation: marquee-left 30s linear infinite;
}

.animate-marquee-right {
  animation: marquee-right 30s linear infinite;
}
```

### Performance Optimizations
- **Will-change**: Applied to animating elements
- **Transform3d**: Hardware acceleration for smooth animations
- **Backface visibility**: Hidden to prevent flickering

---

## 📋 **Implementation Checklist**

### ✅ Spacing Requirements
- [ ] Use `padding-global` class for consistent horizontal spacing
- [ ] Apply `py-16 sm:py-20` for section vertical spacing
- [ ] Use `max-w-6xl` for main containers
- [ ] Apply `max-w-4xl` for text content containers

### ✅ Typography Requirements
- [ ] Use responsive text classes: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`
- [ ] Apply `is-hero` class for hero headings
- [ ] Use `font-bold` for important headings
- [ ] Apply `leading-relaxed` for body text

### ✅ Mobile Requirements
- [ ] Implement mobile-first responsive design
- [ ] Use `hidden md:block` and `md:hidden` for responsive visibility
- [ ] Apply touch-friendly button sizes (minimum 44px)
- [ ] Test on various mobile screen sizes

### ✅ iPhone Requirements
- [ ] Include all required video attributes: `autoPlay muted loop playsInline webkit-playsinline="true" preload="metadata"`
- [ ] Implement autoplay fallback JavaScript
- [ ] Test video autoplay on actual iPhone devices
- [ ] Optimize video files (remove audio tracks, use H.264)
- [ ] Consider Low Power Mode and Reduce Motion settings

### ✅ Hero Section Requirements
- [ ] Use `.hero-container` class for perfect vertical centering
- [ ] Use `.hero-content` class for content wrapper
- [ ] Ensure content fits without scrolling on all screen heights
- [ ] Test on devices with heights from 500px to 1000px+
- [ ] Verify iOS Safari address bar handling
- [ ] Maintain original text sizes (DO NOT change font sizes)

### ✅ Performance Requirements
- [ ] Use `unoptimized={true}` only when necessary
- [ ] Implement lazy loading for images
- [ ] Use CSS variables for consistent theming
- [ ] Optimize animations for 60fps performance

---

## 🎨 **Design Token Summary**

```css
/* Spacing Scale */
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */
--space-3xl: 4rem;      /* 64px */
--space-4xl: 5rem;      /* 80px */

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-full: 9999px;  /* Fully rounded */

/* Typography Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
```

---

*This document serves as the comprehensive design system reference for the Fundraising Flywheel Landing Page. All implementations should follow these specifications for consistency and optimal user experience across all devices, with special attention to iPhone compatibility.*
