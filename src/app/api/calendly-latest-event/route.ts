import {  NextResponse } from 'next/server';

interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string;
  end_time: string;
  status: string;
  location: {
    join_url: string;
  };
  [key: string]: unknown;
}

interface CalendlyResponse {
  collection: CalendlyEvent[];
  pagination?: unknown;
  [key: string]: unknown;
}

export async function GET() {
  try {
    

    const token = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ"
    const userUri ="https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96"

    if (!token || !userUri) {
      return NextResponse.json(
        { error: 'Missing Calendly credentials. Set CALENDLY_PERSONAL_ACCESS_TOKEN and CALENDLY_USER_URI env vars.' },
        { status: 500 }
      );
    }

    const url = `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(
      userUri
    )}&sort=${encodeURIComponent('start_time:desc')}&count=1`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Calendly requires HTTPS; using Node fetch server-side avoids CORS
    });

    const text = await resp.text();
    let data: CalendlyResponse | { raw: string };
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      return NextResponse.json({ error: 'Calendly API error', status: resp.status, data }, { status: resp.status });
    }

    const first = 'collection' in data ? data.collection?.[0] : null;
    const startTime: string | undefined = first?.start_time;
    const join_link: string | undefined = first?.location?.join_url;

    return NextResponse.json({ start_time: startTime, event: first ?? null, join_link: join_link, raw: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Calendly latest event', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}


