import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";

type VideoItem = {
  title: string;
  url: string;
  embedUrl: string;
};

function toEmbedUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // if it's already an embed link
      if (u.pathname.startsWith("/embed/")) return rawUrl;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    // fall through
  }
  return rawUrl;
}

async function loadVideos(): Promise<VideoItem[]> {
  const csvPath = path.join(process.cwd(), "my_video_data.csv");
  if (!fs.existsSync(csvPath)) return [];
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  // Expect header: video_title;video_url
  const dataLines = lines[0].toLowerCase().includes("video_title") ? lines.slice(1) : lines;
  const items: VideoItem[] = [];
  for (const line of dataLines) {
    const [titlePart, urlPart] = line.split(";");
    const title = (titlePart || "").trim();
    const url = (urlPart || "").trim();
    if (!url) continue;
    items.push({ title, url, embedUrl: toEmbedUrl(url) });
  }
  return items;
}

export default async function CallConfirmedPage() {
  const videos = await loadVideos();
  const heroVideo = videos.length > 0 ? videos[0] : null;

  return (
    <div className="font-sans text-primary-text">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <Image
              src="/jda-logo-horizontal.png"
              alt="JD Alchemy"
              width={180}
              height={60}
              className="h-8 sm:h-12 w-auto"
            />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section
        className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
        style={{backgroundColor: 'var(--primary-bg)'}}
      >
        <div className="relative max-w-4xl mx-auto pt-36 pb-20 z-10">
          <div className=" backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-elements)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#000"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z"/></svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">Your Call Is Confirmed</h1>
            <div className="w-24 h-0.5 mx-auto mb-5" style={{ backgroundColor: 'var(--accent-elements)' }}></div>
            <p className="text-lg sm:text-xl text-secondary-text-80 max-w-2xl mx-auto">
              We sent a calendar invite and confirmation email. Please add it to your calendar to avoid missing the session.
            </p>
            <div className="mt-6">
              <Link href="/" className="button hover:!bg-yellow-400 hover:!text-black transition-colors text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 inline-block">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Before Your Call Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-black">Before Your Call</h2>
              <p className="text-black opacity-70">A few quick steps to make the most of our time together.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left: Video */}
              <div className="w-full">
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                  {heroVideo ? (
                    <iframe
                      className="w-full h-full"
                      src={heroVideo.embedUrl}
                      title={heroVideo.title || 'Before Your Call'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/70">No video available</div>
                  )}
                </div>
              </div>

              {/* Right: 3 Steps */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: 'var(--accent-elements)' }}>1</div>
                  <div>
                    <div className="text-black font-semibold mb-1">Add to Calendar</div>
                    <p className="text-black opacity-70 text-sm">Ensure the invite is in your calendar with notifications enabled.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: 'var(--accent-elements)' }}>2</div>
                  <div>
                    <div className="text-black font-semibold mb-1">Prepare Context</div>
                    <p className="text-black opacity-70 text-sm">Have your latest progress, goals, and questions ready to share.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: 'var(--accent-elements)' }}>3</div>
                  <div>
                    <div className="text-black font-semibold mb-1">Join On Time</div>
                    <p className="text-black opacity-70 text-sm">Join a few minutes early to test audio/video and avoid delays.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Pre-Call Training Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-black">Additional Pre-Call Training</h2>
              <p className="text-black opacity-70">Watch these brief videos to prepare and make the most of our time together.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.length === 0 ? (
                <div className="text-center text-black opacity-70">No training videos available.</div>
              ) : (
                videos.map((v, idx) => (
                  <div key={`${v.url}-${idx}`} className="space-y-3">
                    {v.title && (
                      <h3 className="text-lg font-semibold text-black">{v.title}</h3>
                    )}
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        className="w-full h-full"
                        src={v.embedUrl}
                        title={v.title || `Training Video ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


