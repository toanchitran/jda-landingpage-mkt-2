# Google Analytics 4 Custom Metrics Setup for Video Tracking

This guide explains how to set up custom metrics in Google Analytics 4 to track video play time and engagement on the book-a-call page, based on the implementation from [Analytics Mania's guide](https://www.analyticsmania.com/post/custom-metrics-in-google-analytics-4/).

## Overview

The enhanced video tracking implementation sends the following custom metrics to GA4:

1. **video_view** - Counts each video view (increments by 1)
2. **video_play_time** - Tracks cumulative play time in seconds
3. **session_id_custom** - Tracks individual user sessions for detailed analysis
4. **audio_duration_metric** - Tracks audio/video duration in seconds

## Custom Metrics to Register in GA4

### 1. Video Views Metric

**Metric Name:** Video Views  
**Scope:** Event  
**Event Parameter:** `video_view`  
**Unit of Measurement:** Standard  
**Description:** Counts the number of times videos are viewed

### 2. Video Play Time Metric

**Metric Name:** Video Play Time  
**Scope:** Event  
**Event Parameter:** `video_play_time`  
**Unit of Measurement:** Standard  
**Description:** Tracks cumulative video play time in seconds

### 3. Session ID Custom Dimension

**Dimension Name:** Session ID Custom  
**Scope:** Event  
**Event Parameter:** `session_id_custom`  
**Description:** Tracks individual user sessions for detailed journey analysis

### 4. Audio Duration Metric

**Metric Name:** Audio Duration  
**Scope:** Event  
**Event Parameter:** `audio_duration_metric`  
**Unit of Measurement:** Standard  
**Description:** Tracks audio/video duration in seconds

## Setup Steps in Google Analytics 4

### Step 1: Access Custom Definitions

1. Go to your GA4 property
2. Navigate to **Admin** → **Custom Definitions** → **Custom Metrics**
3. Click **Create Custom Metric**

### Step 2: Create Video Views Metric

1. **Metric name:** `Video Views`
2. **Scope:** `Event`
3. **Event parameter:** `video_view`
4. **Unit of measurement:** `Standard`
5. **Description:** `Counts video view events`
6. Click **Save**

### Step 3: Create Video Play Time Metric

1. **Metric name:** `Video Play Time`
2. **Scope:** `Event`
3. **Event parameter:** `video_play_time`
4. **Unit of measurement:** `Standard`
5. **Description:** `Cumulative video play time in seconds`
6. Click **Save**

### Step 4: Create Session ID Custom Dimension

1. Go to **Admin** → **Custom Definitions** → **Custom Dimensions**
2. Click **Create Custom Dimension**
3. **Dimension name:** `Session ID Custom`
4. **Scope:** `Event`
5. **Event parameter:** `session_id_custom` (type this exactly, even if not in suggestions)
6. **Description:** `Individual user session identifier`
7. Click **Save**

### Step 5: Create Audio Duration Metric

1. **Metric name:** `Audio Duration`
2. **Scope:** `Event`
3. **Event parameter:** `audio_duration_metric`
4. **Unit of measurement:** `Standard`
5. **Description:** `Audio/video duration in seconds`
6. Click **Save**

> **Important:** The dropdown only suggests parameters GA4 has already observed. It's fine to type `session_id_custom` manually. If the UI complains, it's usually because the name is reserved or you've hit your property's custom-dimension limit.

## Session ID Tracking Implementation

### How It Works

The session ID tracking implementation:

1. **Captures GA Session ID**: Uses `gtag('get', 'G-16WV2WNMXF', 'session_id', callback)` to retrieve the current session ID
2. **Stores Globally**: Makes the session ID available via `window.GA_SESSION_ID`
3. **Attaches to Events**: Automatically includes `session_id_custom` parameter in all tracking events
4. **Sends Explicit Page Views**: Sends page_view events with session ID included
5. **Enables Journey Analysis**: Allows you to track individual user sessions through the Data API

### Implementation Details

#### Session ID Script (Added to layout.tsx)

```javascript
// Wait for gtag to be available and capture session ID
function initializeSessionTracking() {
  if (typeof gtag !== 'undefined') {
    // Get the session ID and store it
    gtag('get', 'G-16WV2WNMXF', 'session_id', function(sid) {
      if (sid) {
        window.GA_SESSION_ID = String(sid);
        console.log('Session ID captured:', window.GA_SESSION_ID);
        
        // Send initial page view with session ID
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          session_id_custom: window.GA_SESSION_ID,
          debug_mode: true
        });
      }
    });
    return true;
  }
  return false;
}

// Retry until gtag is ready
const id = setInterval(() => { 
  if (initializeSessionTracking()) clearInterval(id); 
}, 200);
```

#### Enhanced Tracking Functions

All tracking functions now automatically include the session ID:

```javascript
const trackEvent = useCallback((eventName: string, parameters: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Add session ID to all events if available
    const sessionId = getSessionId();
    if (sessionId) {
      parameters.session_id_custom = sessionId;
    }
    
    window.gtag('event', eventName, parameters);
  }
}, [getSessionId]);
```

#### Explicit Page View Tracking

```javascript
// Send page_view explicitly (so your custom param is on it)
const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const sessionId = getSessionId();
    
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: pagePath,
      session_id_custom: sessionId || undefined,
      debug_mode: true,
      // UTM parameters...
    });
  }
}, [getSessionId]);
```

## Events Being Tracked

The implementation tracks the following video events, all with session ID:

### 1. video_start
- **Triggered:** When video starts playing
- **Custom Metrics:**
  - `video_view: 1`
- **Parameters:**
  - `video_title`: "book_call_discovery_video"
  - `event_category`: "video_interaction"
  - `session_id_custom`: [session_id]

### 2. video_progress
- **Triggered:** During video playback (onTimeUpdate)
- **Custom Metrics:**
  - `video_play_time`: current time in seconds
- **Parameters:**
  - `video_current_time`: current playback position
  - `video_duration`: total video duration
  - `progress_percentage`: percentage watched
  - `session_id_custom`: [session_id]

### 3. video_pause
- **Triggered:** When video is paused
- **Custom Metrics:**
  - `video_play_time`: current time in seconds
- **Parameters:**
  - `video_current_time`: position when paused
  - `video_duration`: total video duration
  - `progress_percentage`: percentage watched
  - `session_id_custom`: [session_id]

### 4. video_end
- **Triggered:** When video completes
- **Custom Metrics:**
  - `video_play_time`: total duration in seconds
- **Parameters:**
  - `video_duration`: total video duration
  - `completion_percentage`: 100
  - `session_id_custom`: [session_id]

### 5. video_milestone
- **Triggered:** At 25%, 50%, 75%, and 90% completion
- **Custom Metrics:**
  - `video_play_time`: current time in seconds
- **Parameters:**
  - `milestone_percentage`: milestone reached (25, 50, 75, 90)
  - `video_current_time`: position at milestone
  - `video_duration`: total video duration
  - `session_id_custom`: [session_id]

### 6. audio_play
- **Triggered:** When audio/video starts playing
- **Custom Metrics:**
  - `audio_duration_metric`: 0 (duration not yet available)
- **Parameters:**
  - `audio_src`: "/Jay-David-Podcast.mp4"
  - `audio_current_time`: current playback position
  - `audio_duration`: 0
  - `session_id_custom`: [session_id]

### 7. audio_pause
- **Triggered:** When audio/video is paused
- **Custom Metrics:**
  - `audio_duration_metric`: total duration in seconds
- **Parameters:**
  - `audio_src`: "/Jay-David-Podcast.mp4"
  - `audio_current_time`: position when paused
  - `audio_duration`: total duration
  - `completion_percentage`: percentage watched
  - `session_id_custom`: [session_id]

### 8. audio_complete
- **Triggered:** When audio/video completes
- **Custom Metrics:**
  - `audio_duration_metric`: total duration in seconds
- **Parameters:**
  - `audio_src`: "/Jay-David-Podcast.mp4"
  - `audio_duration`: total duration
  - `completion_percentage`: 100
  - `session_id_custom`: [session_id]

## Creating Reports in GA4

### Exploration Report Setup

1. Go to **Explore** → **Create new exploration**
2. Add dimensions:
   - **Event name**
   - **Video title** (custom dimension)
   - **Session ID Custom** (custom dimension)
3. Add metrics:
   - **Video Views** (custom metric)
   - **Video Play Time** (custom metric)
   - **Event count**

### Sample Report Configuration

**Dimensions:**
- Event name
- Video title
- Session ID Custom

**Metrics:**
- Video Views
- Video Play Time (seconds)
- Event count

**Filters:**
- Event name contains "video"

## Using GA4 Data API for Session Analysis

### List All Sessions

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [{"name": "customEvent:session_id_custom"}],
  "metrics": [{"name": "eventCount"}],
  "limit": 250000
}
```

### Per-Session Detail Analysis

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [
    {"name": "eventName"},
    {"name": "dateHourMinute"},
    {"name": "pagePathPlusQueryString"}
  ],
  "metrics": [{"name": "eventCount"}],
  "dimensionFilter": {
    "filter": {
      "fieldName": "customEvent:session_id_custom",
      "stringFilter": {"matchType": "EXACT", "value": "{{session_id_custom}}"}
    }
  },
  "orderBys": [{"dimension": {"dimensionName": "dateHourMinute"}}],
  "limit": 10000
}
```

### Video Engagement by Session

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [
    {"name": "customEvent:session_id_custom"},
    {"name": "eventName"}
  ],
  "metrics": [
    {"name": "customEvent:video_play_time"},
    {"name": "customEvent:video_view"}
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "inListFilter": {
        "values": ["video_start", "video_progress", "video_pause", "video_end", "video_milestone"]
      }
    }
  },
  "limit": 10000
}
```

## Testing the Implementation

### 1. Enable Debug Mode

1. In GA4, go to **Configure** → **DebugView**
2. Add your device to debug mode
3. Visit the book-a-call page and interact with the video

### 2. Verify Events

Check that the following events appear in DebugView:
- `page_view` (with session_id_custom)
- `video_start`
- `video_progress`
- `video_pause`
- `video_milestone`
- `video_end`

### 3. Verify Custom Metrics and Session ID

In each event, verify that the custom parameters are present:
- `video_view: 1` (in video_start events)
- `video_play_time: [number]` (in progress/pause/end events)
- `session_id_custom: [session_id]` (in all events)

### 4. Test Session ID Consistency

1. Refresh the page and verify a new session ID is generated
2. Interact with the video and verify all events have the same session ID
3. Check that the session ID persists throughout the user's session

### 5. Quick Test Event

If you don't see `session_id_custom` in events, send a quick test:

```javascript
gtag('event', 'sid_test', { 
  session_id_custom: window.GA_SESSION_ID, 
  debug_mode: true 
});
```

## Important Notes

### GA4 Limits
- You can register up to **50 event-scoped custom metrics** per property
- You can register up to **50 event-scoped custom dimensions** per property
- Plan strategically to track the most valuable metrics

### Data Processing Time
- Custom metrics and dimensions may take up to 24-48 hours to appear in reports
- DebugView shows data immediately for testing
- Session ID tracking starts from the moment you implement it

### Best Practices
1. **Consistent naming:** Use consistent parameter names across all events
2. **Avoid over-tracking:** Only track meaningful milestones and interactions
3. **Test thoroughly:** Use DebugView to verify implementation before going live
4. **Monitor limits:** Keep track of your custom metric and dimension usage
5. **Session analysis:** Use the Data API for detailed session journey analysis

## Troubleshooting

### Custom Metrics/Dimensions Not Appearing
1. Verify the event parameter name matches exactly in GA4
2. Check that events are firing in DebugView
3. Wait 24-48 hours for data processing
4. Ensure the metric/dimension is registered with the correct scope (Event)

### Session ID Not Available
1. Check that the session ID script loads after the GA4 configuration
2. Verify `gtag` is available when the session tracking initializes
3. Check browser console for any JavaScript errors
4. Ensure the measurement ID matches your GA4 property
5. Check browser console for "Session ID captured:" log message

### Duplicate Tracking
- The implementation includes milestone tracking prevention to avoid duplicate milestone events
- Each milestone (25%, 50%, 75%, 90%) is only tracked once per video session
- Session ID ensures proper attribution across all events

### Performance Considerations
- `onTimeUpdate` events fire frequently (typically every 250ms)
- Consider throttling progress tracking if performance becomes an issue
- The current implementation tracks progress on every time update for accurate play time measurement
- Session ID is retrieved once per page load and cached globally

## References

- [Custom Metrics in Google Analytics 4 - Analytics Mania](https://www.analyticsmania.com/post/custom-metrics-in-google-analytics-4/)
- [GA4 Custom Definitions Documentation](https://support.google.com/analytics/answer/10075209)
- [GA4 Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GA4 Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1) 