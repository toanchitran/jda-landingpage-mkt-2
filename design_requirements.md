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

### Detailed Spacing Values Used in Page

#### **Padding Values**
- **Section Padding**:
  - Vertical: `py-16` (4rem) mobile, `py-20` (5rem) desktop
  - Navigation: `py-2` (0.5rem) mobile, `sm:py-4` (1rem) desktop
  - Cards: `p-6` (1.5rem) mobile, `md:p-10` (2.5rem) desktop
  - Testimonial cards: `p-6` (1.5rem)
  - CTA section: `py-12` (3rem)
  - Rounded sections: `p-4` (1rem)

#### **Margin Values**
- **Heading Margins**:
  - Small headings: `mb-3` (0.75rem)
  - Main headings: `mb-4` (1rem)
  - Section descriptions: `mb-6` (1.5rem)
  - Large sections: `mb-8` (2rem)
  - Major section breaks: `mb-12` (3rem)
  - Workflow features: `mb-12` (3rem)

- **Content Margins**:
  - Video containers: `mb-8` (2rem)
  - Button containers: `mb-6` to `mb-8` (1.5-2rem)
  - Feature items: `mb-2` (0.5rem)
  - Carousel navigation: `mt-6 sm:mt-8` (1.5rem mobile, 2rem desktop)

#### **Gap Values**
- **Grid Gaps**:
  - Mobile: `gap-6` (1.5rem)
  - Large screens: `lg:gap-12` (3rem)
  - Testimonials: `gap-6` (1.5rem)
  - Button groups: `gap-3` (0.75rem)

- **Flex Gaps**:
  - Navigation: `space-x-2` (0.5rem) mobile, `sm:space-x-4` (1rem) desktop
  - Carousel: `gap-1.5` (0.375rem)
  - Marquee tags: `gap-2` (0.5rem)
  - Carousel indicators: `space-x-2` (0.5rem)

#### **Special Spacing**
- **Hero Content**:
  - Mobile: `padding-top: 5rem`, `padding-bottom: 2rem`
  - Small screens: `padding-top: 4rem`, `padding-bottom: 1.5rem`
  - Very small: `padding-top: 3.5rem`, `padding-bottom: 1rem`
  - Landscape mobile: `padding-top: 3rem`, `padding-bottom: 0.75rem`

- **iOS Safe Area**:
  - Carousel section: `padding-bottom: 5rem` desktop, `4rem` mobile
  - Hero content includes `env(safe-area-inset-bottom)`

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
  font-size: 2.56rem;     /* 41px mobile */
  line-height: 1.15;
  letter-spacing: -0.045em;
}
```

**Hero Heading Responsive Sizes (.is-hero):**
- Mobile: `2.56rem` (41px)
- sm (640px+): `3.5rem` (56px)
- md (768px+): `4rem` (64px)
- lg (1024px+): `5.5rem` (88px)
- xl (1280px+): `6rem` (96px)

**Main Section Headings Responsive Classes:**
- `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`
  - Mobile: `1.875rem` (30px)
  - Small: `2.25rem` (36px)
  - Medium: `3rem` (48px)
  - Large: `3.75rem` (60px)

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
  - Mobile: `1.5rem` (24px)
  - Small: `1.875rem` (30px)
  - Medium: `2.25rem` (36px)

#### H3 - Subsection Headers (Team Names)
```css
h3 {
  font-size: 24px;
  line-height: 30px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}
```

**Classes Used:**
- `text-2xl font-bold` - Team member names (24px)

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

**Classes Used:**
- `text-xl font-bold` - Feature titles (20px)

### Body Text Hierarchy

#### Primary Body Text (Hero Descriptions)
- `text-lg md:text-2xl` - Hero section descriptions
  - Mobile: `1.125rem` (18px)
  - Medium: `1.5rem` (24px)

#### Secondary Body Text (Section Descriptions)
- `text-sm sm:text-base` - Carousel section descriptions
  - Mobile: `0.875rem` (14px)
  - Small: `1rem` (16px)

#### Standard Body Text
- `text-base` - Standard content (16px)
- Card descriptions: `text-base` (16px)
- Lead magnet description: Standard paragraph text

#### Small Text
- `text-sm` - Captions, labels, overlay tags (14px)
- Podcast caption: `text-sm` (14px)
- Overlay tags: `text-sm font-medium` (14px)

#### Navigation Typography
- Logo/Brand: `text-xl font-bold` (20px)
- Navigation links: Standard button styling

#### Button Typography
- All buttons: `1rem` (16px) - from globals.css
- Font weight: Standard button styling

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

### Detailed Responsive Patterns Used

#### **Layout Grid Changes**
- **Team section**: `grid md:grid-cols-2 gap-12`
- **Testimonials**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6`
- **Workflow**: `grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12`
- **CTA section**: `grid md:grid-cols-2 gap-12`

#### **Visibility Changes**
- **Desktop only**: `hidden md:block` (workflow desktop layout)
- **Mobile only**: `md:hidden` (workflow mobile layout)
- **Navigation**: `hidden sm:block` (About Us button)
- **Carousel navigation**: `hidden md:flex` (desktop indicators)

#### **Flex Direction Changes**
- **Button groups**: `flex flex-col sm:flex-row gap-3`
- **Content alignment**: `flex md:justify-center` (team member positioning)

#### **Spacing Responsive Patterns**
- **Section spacing**: `py-16 sm:py-20` (consistent across sections)
- **Text spacing**: `mb-6 sm:mb-8` (hero text margins)
- **Grid gaps**: `gap-6 lg:gap-12` (workflow section)
- **Navigation spacing**: `space-x-2 sm:space-x-4` (button groups)

#### **Width and Size Adjustments**
- **Modal sizing**: `max-w-3xl md:min-w-[700px]` (lead magnet)
- **Container sizing**: `md:min-w-[1000px]` (CTA section)
- **Carousel cards**: Progressive sizing across breakpoints

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

### **Complete Spacing Scale Used**
```css
/* Tailwind Spacing Values Used in Page */
--space-0.5: 0.125rem;  /* 2px - h-0.5 divider */
--space-1: 0.25rem;     /* 4px - h-1 accent bars */
--space-1.5: 0.375rem;  /* 6px - gap-1.5 carousel */
--space-2: 0.5rem;      /* 8px - gap-2, py-2, space-x-2 */
--space-3: 0.75rem;     /* 12px - mb-3, gap-3, py-3 */
--space-4: 1rem;        /* 16px - p-4, mb-4, py-4 */
--space-6: 1.5rem;      /* 24px - p-6, mb-6, gap-6 */
--space-8: 2rem;        /* 32px - mb-8, mt-8 */
--space-10: 2.5rem;     /* 40px - p-10 desktop cards */
--space-12: 3rem;       /* 48px - mb-12, py-12, gap-12 */
--space-16: 4rem;       /* 64px - py-16 mobile sections */
--space-20: 5rem;       /* 80px - py-20 desktop sections */
```

### **Typography Scale Used**
```css
/* Font Sizes Actually Used in Page */
--text-sm: 0.875rem;    /* 14px - captions, small text, overlay tags */
--text-base: 1rem;      /* 16px - card descriptions, buttons, standard text */
--text-lg: 1.125rem;    /* 18px - hero description mobile */
--text-xl: 1.25rem;     /* 20px - feature titles, navigation logo */
--text-2xl: 1.5rem;     /* 24px - team names, hero description desktop */
--text-3xl: 1.875rem;   /* 30px - section headings mobile */
--text-4xl: 2.25rem;    /* 36px - section headings small screens */
--text-5xl: 3rem;       /* 48px - section headings medium screens */
--text-6xl: 3.75rem;    /* 60px - section headings large screens */

/* Hero Heading Special Sizes */
--hero-mobile: 2.56rem;  /* 41px - hero title mobile */
--hero-sm: 3.5rem;      /* 56px - hero title small */
--hero-md: 4rem;        /* 64px - hero title medium */
--hero-lg: 5.5rem;      /* 88px - hero title large */
--hero-xl: 6rem;        /* 96px - hero title extra large */
```

### **Border Radius Used**
```css
--radius-lg: 0.5rem;    /* 8px - rounded-lg */
--radius-xl: 0.75rem;   /* 12px - rounded-xl */
--radius-2xl: 1rem;     /* 16px - rounded-2xl cards */
--radius-3xl: 1.5rem;   /* 24px - rounded-3xl modals */
--radius-full: 9999px;  /* Fully rounded buttons, indicators */
```

### **Grid & Layout Values**
```css
/* Grid Columns */
--grid-1: 1;            /* grid-cols-1 mobile */
--grid-2: 2;            /* md:grid-cols-2 */
--grid-3: 3;            /* md:grid-cols-3 workflow */
--grid-8: 8;            /* lg:grid-cols-8 testimonials */

/* Max Widths */
--max-w-3xl: 48rem;     /* 768px - modals */
--max-w-4xl: 56rem;     /* 896px - text content */
--max-w-6xl: 72rem;     /* 1152px - main containers */

/* Specific Widths */
--w-96: 24rem;          /* 384px - carousel cards medium */
--w-500: 31.25rem;      /* 500px - carousel cards large */
--min-w-700: 43.75rem;  /* 700px - modal minimum */
--min-w-1000: 62.5rem;  /* 1000px - CTA section */
```

### **Animation Values**
```css
/* Transition Durations */
--duration-200: 200ms;   /* button hover transitions */
--duration-300: 300ms;   /* standard transitions */
--duration-700: 700ms;   /* carousel transitions */

/* Animation Durations */
--marquee-duration: 30s; /* marquee animations */

/* Transform Values */
--scale-95: 0.95;       /* inactive carousel cards */
--scale-105: 1.05;      /* hover effects */
--translate-y-1: -0.25rem; /* -4px button hover */
```

---

*This document serves as the comprehensive design system reference for the Fundraising Flywheel Landing Page. All implementations should follow these specifications for consistency and optimal user experience across all devices, with special attention to iPhone compatibility.*
