# Section View Time Tracking Setup Guide

This guide explains how to implement section view time tracking to identify which sections users spend the most time viewing on your landing page.

## Overview

The section view tracking system provides detailed analytics on:
- **Section View Time**: How long users spend viewing each section
- **Section Engagement**: Which sections are most engaging
- **Scroll Depth**: How far users scroll within each section
- **Session-based Analysis**: Individual user journey tracking

## Custom Metrics to Register in GA4

### 1. Section View Time Metric

**Metric Name:** Section View Time  
**Scope:** Event  
**Event Parameter:** `section_view_time`  
**Unit of Measurement:** Standard  
**Description:** Tracks cumulative time spent viewing sections in seconds

### 2. Section Scroll Depth Metric

**Metric Name:** Section Scroll Depth  
**Scope:** Event  
**Event Parameter:** `scroll_percentage`  
**Unit of Measurement:** Standard  
**Description:** Tracks scroll depth percentage within sections

## Setup Steps in Google Analytics 4

### Step 1: Access Custom Definitions

1. Go to your GA4 property
2. Navigate to **Admin** → **Custom Definitions** → **Custom Metrics**
3. Click **Create Custom Metric**

### Step 2: Create Section View Time Metric

1. **Metric name:** `Section View Time`
2. **Scope:** `Event`
3. **Event parameter:** `section_view_time`
4. **Unit of measurement:** `Standard`
5. **Description:** `Cumulative time spent viewing sections in seconds`
6. Click **Save**

### Step 3: Create Section Scroll Depth Metric

1. **Metric name:** `Section Scroll Depth`
2. **Scope:** `Event`
3. **Event parameter:** `scroll_percentage`
4. **Unit of measurement:** `Standard`
5. **Description:** `Scroll depth percentage within sections`
6. Click **Save**

## Implementation Details

### 1. Section View Tracking Hook

The `useSectionViewTracking` hook automatically:
- Uses Intersection Observer to detect when sections are visible
- Tracks view time for each section
- Monitors scroll depth within sections
- Sends analytics events with session ID

### 2. Section Configuration

Add data attributes to your sections:

```jsx
<section 
  className="your-section-class"
  data-section-name="hero_section"
  data-section-id="hero"
>
  {/* Section content */}
</section>
```

### 3. Tracked Sections

The implementation tracks these sections:

| Section Name | Section ID | Description |
|--------------|------------|-------------|
| `hero_section` | `hero` | Hero section with main value proposition |
| `podcast_section` | `podcast` | Podcast/audio content section |
| `team_section` | `team` | Team member introductions |
| `funded_future_section` | `funded_future` | Future outcomes section |
| `carousel_section` | `carousel` | Interactive carousel section |
| `lead_magnet_section` | `lead_magnet` | Lead magnet/CTA section |
| `testimonials_section` | `testimonials` | Client testimonials |
| `bottom_cta_section` | `bottom_cta` | Final call-to-action |

## Events Being Tracked

### 1. section_view_start
- **Triggered:** When section becomes visible (50% threshold)
- **Parameters:**
  - `section_name`: Section identifier
  - `section_id`: Unique section ID
  - `session_id_custom`: User session ID

### 2. section_view_time
- **Triggered:** Every 5 seconds while section is visible
- **Custom Metrics:**
  - `section_view_time`: Cumulative view time in seconds
- **Parameters:**
  - `section_name`: Section identifier
  - `section_id`: Unique section ID
  - `session_id_custom`: User session ID

### 3. section_view_end
- **Triggered:** When section is no longer visible
- **Custom Metrics:**
  - `section_view_time`: Total view time in seconds
- **Parameters:**
  - `section_name`: Section identifier
  - `section_id`: Unique section ID
  - `session_id_custom`: User session ID

### 4. section_scroll_depth
- **Triggered:** At 25%, 50%, 75%, and 90% scroll depth
- **Custom Metrics:**
  - `scroll_percentage`: Scroll depth percentage
- **Parameters:**
  - `section_name`: Section identifier
  - `section_id`: Unique section ID
  - `milestone_percentage`: Scroll milestone reached
  - `session_id_custom`: User session ID

## Creating Reports in GA4

### Exploration Report Setup

1. Go to **Explore** → **Create new exploration**
2. Add dimensions:
   - **Event name**
   - **Section name** (custom dimension)
   - **Session ID Custom** (custom dimension)
3. Add metrics:
   - **Section View Time** (custom metric)
   - **Section Scroll Depth** (custom metric)
   - **Event count**

### Sample Report Configuration

**Dimensions:**
- Event name
- Section name
- Session ID Custom

**Metrics:**
- Section View Time (seconds)
- Section Scroll Depth (percentage)
- Event count

**Filters:**
- Event name contains "section"

## Using GA4 Data API for Section Analysis

### Section Engagement by Session

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [
    {"name": "customEvent:session_id_custom"},
    {"name": "customEvent:section_name"}
  ],
  "metrics": [
    {"name": "customEvent:section_view_time"},
    {"name": "eventCount"}
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "inListFilter": {
        "values": ["section_view_end"]
      }
    }
  },
  "limit": 10000
}
```

### Most Engaging Sections

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [
    {"name": "customEvent:section_name"}
  ],
  "metrics": [
    {"name": "customEvent:section_view_time"},
    {"name": "eventCount"},
    {"name": "averageSessionDuration"}
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "inListFilter": {
        "values": ["section_view_end"]
      }
    }
  },
  "orderBys": [
    {
      "metric": {"metricName": "customEvent:section_view_time"},
      "desc": true
    }
  ],
  "limit": 50
}
```

### Section Scroll Depth Analysis

```json
{
  "dateRanges": [{"startDate": "2025-01-21", "endDate": "2025-01-22"}],
  "dimensions": [
    {"name": "customEvent:section_name"},
    {"name": "customEvent:milestone_percentage"}
  ],
  "metrics": [
    {"name": "eventCount"}
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "stringFilter": {"value": "section_scroll_depth"}
    }
  },
  "orderBys": [
    {
      "dimension": {"dimensionName": "customEvent:section_name"}
    },
    {
      "dimension": {"dimensionName": "customEvent:milestone_percentage"}
    }
  ],
  "limit": 1000
}
```

## Testing the Implementation

### 1. Enable Debug Mode

1. In GA4, go to **Configure** → **DebugView**
2. Add your device to debug mode
3. Visit the landing page and scroll through sections

### 2. Verify Events

Check that the following events appear in DebugView:
- `section_view_start`
- `section_view_time`
- `section_view_end`
- `section_scroll_depth`

### 3. Verify Custom Metrics

In each event, verify that the custom parameters are present:
- `section_view_time: [number]` (in view time events)
- `scroll_percentage: [number]` (in scroll depth events)
- `section_name: [section_name]` (in all events)
- `session_id_custom: [session_id]` (in all events)

### 4. Test Section Visibility

1. Scroll to different sections and verify start/end events
2. Stay on a section for 5+ seconds to see view time tracking
3. Scroll within sections to see scroll depth tracking

## Configuration Options

### useSectionViewTracking Options

```javascript
useSectionViewTracking({
  threshold: 0.5, // 50% of section must be visible
  minViewTime: 2, // Minimum 2 seconds before tracking
  trackScrollDepth: true,
  scrollDepthThresholds: [25, 50, 75, 90]
});
```

**Options:**
- `threshold`: Percentage of section that must be visible (0-1)
- `minViewTime`: Minimum time in seconds before tracking view
- `trackScrollDepth`: Whether to track scroll depth within sections
- `scrollDepthThresholds`: Scroll depth percentages to track

## Performance Considerations

### Optimization Features

1. **Intersection Observer**: Efficient visibility detection
2. **Throttled Tracking**: View time tracked every 5 seconds
3. **Duplicate Prevention**: Scroll depth milestones tracked only once
4. **Memory Management**: Automatic cleanup on component unmount

### Best Practices

1. **Reasonable Thresholds**: Use 50% visibility threshold for accurate tracking
2. **Minimum View Time**: Set 2+ seconds to avoid tracking brief scrolls
3. **Scroll Depth Limits**: Track meaningful milestones (25%, 50%, 75%, 90%)
4. **Session Context**: All events include session ID for journey analysis

## Troubleshooting

### Events Not Firing

1. Check that sections have `data-section-name` attributes
2. Verify Intersection Observer is supported in browser
3. Check browser console for JavaScript errors
4. Ensure GA4 tracking is properly initialized

### Custom Metrics Not Appearing

1. Verify metric names match exactly in GA4
2. Check that events are firing in DebugView
3. Wait 24-48 hours for data processing
4. Ensure metrics are registered with correct scope (Event)

### Performance Issues

1. Reduce tracking frequency if needed
2. Limit scroll depth thresholds
3. Increase minimum view time threshold
4. Monitor browser performance in developer tools

## Analytics Insights

### Key Metrics to Monitor

1. **Average Section View Time**: Which sections hold attention longest
2. **Section Completion Rate**: How many users reach the end of each section
3. **Scroll Depth Distribution**: Engagement patterns within sections
4. **Section Drop-off Points**: Where users lose interest

### Optimization Opportunities

1. **High Engagement Sections**: Expand content in popular sections
2. **Low Engagement Sections**: Revise or remove underperforming content
3. **Scroll Depth Patterns**: Optimize content length and structure
4. **Session Flow**: Improve navigation between sections

## References

- [GA4 Custom Definitions Documentation](https://support.google.com/analytics/answer/10075209)
- [GA4 Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
