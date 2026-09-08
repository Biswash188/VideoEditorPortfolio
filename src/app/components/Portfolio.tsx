import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback.js";
import { portfolioCategories } from "../../shared/portfolio.js";

type PortfolioVideoPlayerProps = {
  title: string;
  videoUrl?: string | null;
  videoEmbedUrl?: string | null;
  poster?: string | null;
};

function PortfolioVideoPlayer({ title, videoUrl, videoEmbedUrl, poster }: PortfolioVideoPlayerProps) {
  const [useDrivePreview, setUseDrivePreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useDrivePreview) return;

    const syncState = () => {
      setIsPlaying(!video.paused);
      setIsMuted(video.muted);
      setCurrentTime(video.currentTime);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    const events: Array<keyof HTMLMediaElementEventMap> = ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended", "volumechange"];
    events.forEach((event) => video.addEventListener(event, syncState));
    syncState();
    return () => events.forEach((event) => video.removeEventListener(event, syncState));
  }, [useDrivePreview, videoUrl]);

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => undefined);
    else video.pause();
  };

  if (videoUrl && !useDrivePreview) {
    return <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster ?? undefined}
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        onError={() => videoEmbedUrl && setUseDrivePreview(true)}
      />

      {!isPlaying && <button
        type="button"
        onClick={() => void togglePlayback()}
        aria-label={`Play ${title}`}
        className="absolute left-1/2 top-1/2 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Play className="ml-0.5 size-5" fill="currentColor" />
      </button>}

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-2 pb-2 pt-7 text-white sm:px-3">
        <button type="button" onClick={() => void togglePlayback()} aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`} className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {isPlaying ? <Pause className="size-4" fill="currentColor" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}
        </button>
        <input
          type="range"
          aria-label={`Seek ${title}`}
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const video = videoRef.current;
            const nextTime = Number(event.target.value);
            if (!video) return;
            video.currentTime = nextTime;
            setCurrentTime(nextTime);
          }}
          className="min-w-0 flex-1 accent-primary"
        />
        <span className="shrink-0 text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <button type="button" onClick={() => { const video = videoRef.current; if (video) video.muted = !video.muted; }} aria-label={isMuted ? "Unmute video" : "Mute video"} className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <button type="button" onClick={() => void videoRef.current?.requestFullscreen?.()} aria-label="View video fullscreen" className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <Maximize2 className="size-4" />
        </button>
      </div>
    </div>;
  }

  if (videoEmbedUrl) {
    return (
      <iframe
        src={videoEmbedUrl}
        title={`${title} video player`}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return null;
}

export function Portfolio() {
  const categories = ["All", ...portfolioCategories];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [databaseProjects, setDatabaseProjects] = useState<Array<{ id: string; title: string; category: string; image?: string | null; videoUrl?: string | null; videoEmbedUrl?: string | null; duration: string; client: string; year: string }>>([]);

  useEffect(() => {
    fetch("/api/videos")
      .then(async (response) => response.ok ? response.json() : [])
      .then((videos: Array<{ id: string; title: string; category: string; thumbnailUrl: string | null; videoUrl: string | null; videoEmbedUrl: string | null; durationSeconds: number | null; createdAt: string }>) => {
        setDatabaseProjects(videos.map((video) => ({
          id: video.id,
          title: video.title,
          category: video.category,
          image: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          videoEmbedUrl: video.videoEmbedUrl,
          duration: video.durationSeconds ? `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, "0")}` : "Video",
          client: "Portfolio project",
          year: String(new Date(video.createdAt).getFullYear()),
        })));
      }).catch(() => setDatabaseProjects([]));
  }, []);

  /* The portfolio intentionally renders only videos published through admin. */
  const projects: Array<{ id: number; title: string; category: string; image: string; duration: string; client: string; year: string; videoUrl?: string; videoEmbedUrl?: string }> = [];
  /*
    {
      id: 1,
      title: "Tech Startup Launch",
      category: "Commercials",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG1vZGVybiUyMG9mZmljZXxlbnwxfHx8fDE3ODI2NTUxOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "4:20",
      client: "TechCorp",
      year: "2026",
    },
    {
      id: 2,
      title: "Brand Documentary",
      category: "Documentary",
      image: "https://images.unsplash.com/photo-1612548403247-aa2873e9422d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBmaWxtJTIwcHJvZHVjdGlvbiUyMGNhbWVyYXxlbnwxfHx8fDE3ODI2NTUxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "12:45",
      client: "Heritage Co.",
      year: "2025",
    },
    {
      id: 3,
      title: "Product Commercial",
      category: "Commercials",
      image: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21tZXJjaWFsJTIwYWR2ZXJ0aXNpbmd8ZW58MXx8fHwxNzgyNjU1MTU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2:30",
      client: "Brand X",
      year: "2026",
    },
    {
      id: 4,
      title: "Live Concert Film",
      category: "Explainer Videos",
      image: "https://images.unsplash.com/photo-1565035010268-a3816f98589a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHZpZGVvJTIwY29uY2VydCUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc4MjY1NTE5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "5:15",
      client: "Indie Artist",
      year: "2026",
    },
    {
      id: 5,
      title: "Elegant Wedding Film",
      category: "Real Estate",
      image: "https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdmlkZW9ncmFwaHklMjByb21hbnRpY3xlbnwxfHx8fDE3ODI2NTUxOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "8:30",
      client: "Private Client",
      year: "2025",
    },
    {
      id: 6,
      title: "Fashion Week Highlight",
      category: "Commercials",
      image: "https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbW9kZWx8ZW58MXx8fHwxNzgyNjU1MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "3:45",
      client: "Fashion House",
      year: "2026",
    },
    {
      id: 7,
      title: "Sports Documentary",
      category: "Documentary",
      image: "https://images.unsplash.com/photo-1470468969717-61d5d54fd036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhY3Rpb24lMjBhdGhsZXRlfGVufDF8fHx8MTc4MjY1NTE5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "15:20",
      client: "Sports Network",
      year: "2025",
    },
    {
      id: 8,
      title: "Wildlife Conservation",
      category: "Documentary",
      image: "https://images.unsplash.com/photo-1504173010664-32509aeebb62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBkb2N1bWVudGFyeSUyMHdpbGRsaWZlfGVufDF8fHx8MTc4MjU1MDk0OHww&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "22:10",
      client: "Conservation Org",
      year: "2025",
    },
    {
      id: 9,
      title: "Behind the Scenes",
      category: "Real Estate",
      image: "https://images.unsplash.com/photo-1638545818407-ac7a54b544fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHN0dWRpbyUyMGZpbG1tYWtlcnxlbnwxfHx8fDE3ODI2NTUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "6:50",
      client: "Studio",
      year: "2026",
    },
  */

  const filteredProjects = [...projects, ...databaseProjects].filter(
    (project) =>
      selectedCategory === "All" || project.category === selectedCategory,
  );

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-4">My Portfolio</h1>
            <p className="text-lg text-muted-foreground">
              A collection of my finest video editing work across various genres and
              styles
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b sticky top-[73px] bg-background/80 backdrop-blur-md z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const isDocumentary = project.category === "Documentary";

              return (
                <Card
                  key={project.id}
                  className="group overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                >
                <div
                  className={`relative mx-auto w-full overflow-hidden ${
                    isDocumentary ? "aspect-video" : "aspect-[9/16] max-w-[20rem]"
                  }`}
                >
                  {project.videoUrl || project.videoEmbedUrl ? (
                    <PortfolioVideoPlayer
                      title={project.title}
                      videoUrl={project.videoUrl}
                      videoEmbedUrl={project.videoEmbedUrl}
                      poster={project.image}
                    />
                  ) : (
                    <ImageWithFallback src={project.image!} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="size-20 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="size-10 text-black ml-1" fill="black" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute top-4 right-4">
                    <Badge variant="secondary">{project.duration}</Badge>
                  </div>
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-white text-sm">
                      {project.client} • {project.year}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">
                    {project.category}
                  </Badge>
                  <h3 className="font-semibold mb-2">{project.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {project.client} • {project.year}
                  </div>
                </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No projects found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Interested in Working Together?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how I can help bring your vision to life through expert
            video editing.
          </p>
          <Button size="lg">Contact Me</Button>
        </div>
      </section>
    </div>
  );
}
