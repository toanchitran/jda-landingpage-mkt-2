# Google Analytics Setup for JD Alchemy Landing Page

## Overview
This document outlines the Google Analytics tracking implementation for the JD Alchemy landing page. The setup uses Google Analytics 4 (GA4) with the measurement ID `G-16WV2WNMXF`.

## Implementation Details

### 1. Google Analytics 4 Setup
- **Measurement ID**: `G-16WV2WNMXF`
- **Location**: Added to `src/app/layout.tsx` for site-wide tracking
- **Script Strategy**: Uses Next.js `Script` component with `afterInteractive` strategy
- **Implementation**: Direct GA4 gtag.js implementation

### 2. Custom Tracking Hook
Created `src/hooks/useGoogleAnalytics.ts` with the following tracking functions:

#### Core Tracking Functions
- `trackEvent(eventName, parameters)` - Generic event tracking
- `trackPageView(pageTitle, pagePath)` - Page view tracking

#### Specific Event Tracking
- `trackBookCallClick(location)` - Tracks "Book a call" button clicks
- `trackSiteDeckClick()` - Tracks clicks to deckanalysis.fundraisingflywheel.io
- `trackContactFormStart()` - Tracks when contact form is opened
- `trackContactFormComplete()` - Tracks when contact form is successfully submitted
- `trackCalendlyStart()` - Tracks when Calendly booking interface is shown
- `trackFormFieldInteraction(fieldName, action)` - Tracks form field interactions

### 3. Tracked User Interactions

#### Book a Call Button Clicks
- **Event**: `book_call_click`
- **Category**: `engagement`
- **Locations Tracked**:
  - Hero section (`hero_section`)
  - Workflow section (`workflow_section`)
  - Carousel section (`carousel_section`)
  - Consider section (`consider_section`)
  - Bottom CTA section (`bottom_cta_section`)

#### Site Deck Button Clicks
- **Event**: `site_deck_click`
- **Category**: `engagement`
- **Label**: `deckanalysis.fundraisingflywheel.io`
- **Locations**: Navigation bar and lead magnet section

#### Contact Form Interactions
- **Form Start**: `contact_form_start` (triggered when form modal opens)
- **Form Complete**: `contact_form_complete` (triggered on successful submission)
- **Field Interactions**: `form_field_interaction` with field name and action (focus/blur/change)

#### Calendly Integration
- **Event**: `calendly_start`
- **Category**: `booking`
- **Trigger**: When Calendly iframe is displayed after form submission

### 4. Implementation Files

#### Modified Files
1. **`src/app/layout.tsx`**
   - Added GTM script tags
   - Added noscript fallback

2. **`src/app/page.tsx`**
   - Integrated tracking hook
   - Added tracking to all "Book a call" buttons
   - Added tracking to site deck buttons
   - Added page view tracking

3. **`src/components/ContactForm.tsx`**
   - Added form interaction tracking
   - Added field-level tracking (focus, blur, change)
   - Added form completion tracking
   - Added Calendly start tracking

#### New Files
1. **`src/hooks/useGoogleAnalytics.ts`**
   - Custom hook for all tracking functions
   - TypeScript support with proper type definitions

### 5. Google Analytics 4 Configuration

The implementation uses direct GA4 event tracking. All events are automatically sent to your GA4 property with the measurement ID `G-16WV2WNMXF`.

#### Events Automatically Tracked
1. **Book Call Click** - `book_call_click`
2. **Site Deck Click** - `site_deck_click`
3. **Contact Form Start** - `contact_form_start`
4. **Contact Form Complete** - `contact_form_complete`
5. **Calendly Start** - `calendly_start`
6. **Form Field Interaction** - `form_field_interaction`
7. **Page Views** - Automatic page view tracking

#### Custom Parameters
Each event includes custom parameters for better analysis:
- `event_category` - Event category (engagement, form_interaction, booking)
- `event_label` - Specific event label
- `custom_parameter` - Additional context for the event
- `value` - Event value (1 for all events)

### 6. Testing

To verify the tracking is working:

1. Open browser developer tools
2. Check the Console tab for any errors
3. Check the Network tab for requests to Google Analytics
4. Use Google Analytics Real-Time reports to verify events
5. Check the GA4 DebugView for detailed event information

### 7. GA4 Event Structure

The implementation sends events directly to GA4 with the following structure:

```javascript
// Book a call click
gtag('event', 'book_call_click', {
  event_category: 'engagement',
  event_label: 'hero_section',
  value: 1,
  custom_parameter: 'hero_section'
});

// Form field interaction
gtag('event', 'form_field_interaction', {
  event_category: 'form_interaction',
  event_label: 'fullName_focus',
  field_name: 'fullName',
  action: 'focus',
  value: 1,
  custom_parameter: 'fullName_focus'
});
```

### 8. Privacy Considerations

- All tracking is client-side only
- No personally identifiable information is sent to Google Analytics
- Form field tracking only tracks interaction patterns, not actual content
- Users can opt out using browser privacy settings or ad blockers

## Next Steps

1. Verify your GA4 property is properly configured with measurement ID `G-16WV2WNMXF`
2. Test the tracking using GA4 Real-Time reports
3. Create custom reports in GA4 to analyze the tracked events
4. Set up conversion goals based on the tracked events
5. Monitor and optimize based on the collected data 