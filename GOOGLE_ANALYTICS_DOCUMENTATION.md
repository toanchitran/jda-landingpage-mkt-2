# Google Analytics 4 (GA4) Implementation Documentation

## Overview
This document outlines the comprehensive Google Analytics 4 tracking implementation for the Fundraising Flywheel landing page. The setup includes advanced UTM parameter tracking, custom session management, and detailed event tracking for user interactions.

## 🎯 Current Implementation Status

### ✅ **Implemented Features**

#### 1. **Core GA4 Setup** (`src/app/layout.tsx`)
- **GA4 Property ID**: `G-16WV2WNMXF`
- **Loading Strategy**: `afterInteractive` for optimal performance
- **Custom Configuration**: Manual page view control for UTM attribution

#### 2. **UTM Parameter Tracking**
- **Automatic Detection**: Captures all 5 UTM parameters from URL
- **Parameters Tracked**:
  - `utm_source` → `campaign_source`
  - `utm_medium` → `campaign_medium` 
  - `utm_campaign` → `campaign_name`
  - `utm_term` → `campaign_term`
  - `utm_content` → `campaign_content`
- **Attribution Control**: Prevents GA4 from overriding UTM data
- **Manual Page Views**: Ensures proper attribution for UTM traffic

#### 3. **Custom Session Management**
- **Custom Session ID**: Generated format `cs_{timestamp}_{random}`
- **Storage**: `sessionStorage` for session persistence
- **Global Access**: Available via `window.CUSTOM_SESSION_ID`
- **Event Integration**: Attached to all tracked events

#### 4. **Event Tracking System** (`src/hooks/useGoogleAnalytics.ts`)

##### **User Engagement Events**
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `book_call_click` | CTA button clicks | `location`, `event_category`, `value` |
| `site_deck_click` | Deck analysis link clicks | `event_category`, `custom_parameter` |
| `logo_click` | Logo/navigation clicks | `event_category`, `event_label` |

##### **Form Interaction Events**
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `contact_form_start` | Form interaction begins | `event_category`, `custom_parameter` |
| `contact_form_complete` | Form submission success | `event_category`, `value` |
| `form_field_interaction` | Field focus/blur/change | `field_name`, `action` |
| `lead_qualification_show` | Qualification section display | `event_category`, `value` |

##### **Booking & Calendar Events**
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `calendly_start` | Calendar widget opens | `event_category`, `value` |
| `calendly_complete` | Booking completed | `event_type`, `event_date`, `event_time` |

##### **Media Interaction Events**
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `video_start` | Video playback begins | `video_title`, `video_view` |
| `video_progress` | Video progress milestones | `progress_percentage`, `video_play_time` |
| `video_pause` | Video paused | `video_current_time`, `progress_percentage` |
| `video_end` | Video completed | `video_duration`, `completion_percentage` |
| `video_milestone` | 25%, 50%, 75%, 90% markers | `milestone_percentage`, `video_play_time` |
| `audio_play` | Audio playback starts | `audio_src`, `audio_current_time` |
| `audio_pause` | Audio paused | `audio_duration`, `completion_percentage` |
| `audio_complete` | Audio finished | `audio_duration`, `completion_percentage` |

##### **File Upload Events**
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `pitch_deck_upload` | Pitch deck file uploaded | `file_name`, `file_size` |

#### 5. **Additional Tracking Scripts**
- **REB2B**: B2B visitor identification (`LNKLDHPVZ2OJ`)
- **Hotjar**: User behavior analytics (`hjid: 6500450`)

## 🔧 **What Needs to be Done**

### 1. **GA4 Property Configuration**
```yaml
Required GA4 Settings:
  ✅ Property Created: G-16WV2WNMXF
  ⚠️  Enhanced Ecommerce: Configure if tracking conversions
  ⚠️  Custom Dimensions: Set up for custom parameters
  ⚠️  Custom Metrics: Define for video engagement
  ⚠️  Conversion Events: Mark important events as conversions
```

### 2. **Custom Dimensions Setup in GA4**
Navigate to: **Admin → Property → Custom Definitions → Custom Dimensions**

| Dimension Name | Parameter Name | Scope | Description |
|----------------|---------------|-------|-------------|
| Session ID Custom | `session_id_custom` | Event | Custom session tracking |
| CTA Location | `custom_parameter` | Event | Button/CTA location identifier |
| Video Title | `video_title` | Event | Video content identifier |
| Form Field Name | `field_name` | Event | Form interaction tracking |
| Audio Source | `audio_src` | Event | Audio content source |

### 3. **Custom Metrics Setup in GA4**
Navigate to: **Admin → Property → Custom Definitions → Custom Metrics**

| Metric Name | Parameter Name | Unit | Description |
|-------------|---------------|------|-------------|
| Video Views | `video_view` | Standard | Video start count |
| Video Play Time | `video_play_time` | Time | Cumulative video watch time |
| Form Interactions | `form_interaction_count` | Standard | Form engagement count |

### 4. **Conversion Events Configuration**
Navigate to: **Admin → Property → Events → Mark as Conversion**

**Recommended Conversion Events:**
- `calendly_complete` - Primary conversion (booking)
- `contact_form_complete` - Secondary conversion (lead)
- `pitch_deck_upload` - Engagement conversion
- `video_milestone` (90%) - Content engagement

### 5. **Enhanced Attribution Setup**
Navigate to: **Admin → Property → Attribution Settings**
- **Attribution Model**: Data-driven (recommended)
- **Reporting Attribution**: Last non-direct click
- **Lookback Window**: 90 days (click), 1 day (view)

### 6. **Audience Configuration**
Navigate to: **Audience → New Audience**

**Recommended Audiences:**
```yaml
High Intent Visitors:
  - Conditions: calendly_start OR pitch_deck_upload
  - Duration: 30 days

Video Engaged Users:
  - Conditions: video_milestone >= 50%
  - Duration: 30 days

UTM Campaign Traffic:
  - Conditions: utm_source exists
  - Duration: 30 days

Returning Qualified Leads:
  - Conditions: contact_form_complete AND session_count > 1
  - Duration: 90 days
```

## 📊 **Monitoring & Validation**

### 1. **Real-Time Validation**
- Use **Real-Time Reports** to verify events are firing
- Check **DebugView** for detailed event parameters
- Monitor console logs for UTM parameter detection

### 2. **Key Reports to Monitor**
- **Acquisition → Traffic Acquisition**: UTM campaign performance
- **Engagement → Events**: Custom event performance
- **Engagement → Conversions**: Conversion funnel analysis
- **User → Demographics**: Audience insights

### 3. **Data Quality Checks**
```javascript
// Console commands for testing (run in browser dev tools)
// Test custom session ID
console.log('Session ID:', window.CUSTOM_SESSION_ID);

// Test GTM data layer
console.log('Data Layer:', window.dataLayer);

// Test UTM parameters
const params = new URLSearchParams(window.location.search);
console.log('UTM Source:', params.get('utm_source'));
```

## 🚀 **Optimization Opportunities**

### 1. **Enhanced Video Tracking**
- Implement YouTube API for embedded videos
- Add video quality and playback speed tracking
- Track video drop-off points for content optimization

### 2. **Advanced Form Analytics**
- Field completion time tracking
- Form abandonment point analysis
- Progressive profiling implementation

### 3. **Cross-Domain Tracking**
- Configure for `deckanalysis.fundraisingflywheel.io`
- Implement unified user journey tracking

### 4. **Server-Side Tracking**
- Implement GA4 Measurement Protocol for server events
- Add conversion API for better attribution

## 🔒 **Privacy & Compliance**

### Current Implementation:
- ✅ No automatic page views (manual control)
- ✅ Custom session management (not relying on GA4 cookies alone)
- ✅ Console logging for transparency
- ⚠️  Consider GDPR compliance for EU traffic
- ⚠️  Add privacy policy links
- ⚠️  Implement consent management if required

## 📝 **Implementation Checklist**

### Immediate Actions:
- [ ] Set up custom dimensions in GA4
- [ ] Set up custom metrics in GA4
- [ ] Mark conversion events
- [ ] Create recommended audiences
- [ ] Configure attribution settings
- [ ] Test all tracking events
- [ ] Validate UTM parameter flow

### Future Enhancements:
- [ ] Add server-side tracking
- [ ] Implement consent management
- [ ] Add cross-domain tracking
- [ ] Enhanced video analytics
- [ ] A/B testing integration

## 🛠️ **Testing Commands**

```javascript
// Test tracking functions (run in browser console)
// Book call tracking
window.gtag('event', 'book_call_click', { event_category: 'test', custom_parameter: 'test_location' });

// Video tracking
window.gtag('event', 'video_start', { video_title: 'test_video', video_view: 1 });

// UTM tracking
window.gtag('event', 'page_view', { 
  campaign_source: 'test_source',
  campaign_medium: 'test_medium',
  campaign_name: 'test_campaign'
});
```

---

**Last Updated**: December 2024  
**GA4 Property**: G-16WV2WNMXF  
**Implementation Status**: Core tracking active, GA4 configuration pending
