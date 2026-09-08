import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button.js";
import { Card, CardContent } from "./ui/card.js";
import { Badge } from "./ui/badge.js";
import { Maximize2, Pause, Play, Film, Scissors, Sparkles, Award, Users, Volume2, VolumeX } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback.js";

type FeaturedVideoPlayerProps = {
  title: string;
  videoUrl: string | null;
  videoEmbedUrl: string | null;
  poster: string | null;
};

function FeaturedVideoPlayer({ title, videoUrl, videoEmbedUrl, poster }: FeaturedVideoPlayerProps) {
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
    return `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}`;
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => undefined);
    else video.pause();
  };

  if (videoUrl && !useDrivePreview) {
    return <div className="relative h-full w-full bg-black">
      <video ref={videoRef} src={videoUrl} poster={poster ?? undefined} preload="metadata" playsInline className="h-full w-full object-contain" onError={() => videoEmbedUrl && setUseDrivePreview(true)} />
      {!isPlaying && <button type="button" onClick={() => void togglePlayback()} aria-label={`Play ${title}`} className="absolute left-1/2 top-1/2 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Play className="ml-0.5 size-5" fill="currentColor" /></button>}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-2 pb-2 pt-7 text-white sm:px-3">
        <button type="button" onClick={() => void togglePlayback()} aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`} className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{isPlaying ? <Pause className="size-4" fill="currentColor" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}</button>
        <input type="range" aria-label={`Seek ${title}`} min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => { const video = videoRef.current; const nextTime = Number(event.target.value); if (!video) return; video.currentTime = nextTime; setCurrentTime(nextTime); }} className="min-w-0 flex-1 accent-primary" />
        <span className="shrink-0 text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <button type="button" onClick={() => { const video = videoRef.current; if (video) video.muted = !video.muted; }} aria-label={isMuted ? "Unmute video" : "Mute video"} className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button>
        <button type="button" onClick={() => void videoRef.current?.requestFullscreen?.()} aria-label="View video fullscreen" className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Maximize2 className="size-4" /></button>
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

  return poster ? <ImageWithFallback src={poster} alt={title} className="h-full w-full object-cover" /> : null;
}

export function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Array<{
    id: string;
    title: string;
    category: string;
    image: string | null;
    videoUrl: string | null;
    videoEmbedUrl: string | null;
    duration: string;
  }>>([]);

  useEffect(() => {
    fetch("/api/videos")
      .then(async (response) => response.ok ? response.json() : [])
      .then((videos: Array<{
        id: string;
        title: string;
        category: string;
        thumbnailUrl: string | null;
        videoUrl: string | null;
        videoEmbedUrl: string | null;
        durationSeconds: number | null;
        isFeatured: boolean;
      }>) => {
        setFeaturedProjects(videos
          .filter((video) => video.isFeatured)
          .map((video) => ({
            id: video.id,
            title: video.title,
            category: video.category,
            image: video.thumbnailUrl,
            videoUrl: video.videoUrl,
            videoEmbedUrl: video.videoEmbedUrl,
            duration: video.durationSeconds
              ? `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, "0")}`
              : "Video",
          })));
      })
      .catch(() => setFeaturedProjects([]));
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1528109966604-5a6a4a964e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmclMjB3b3Jrc3BhY2UlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzgyNDkzNjAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Video editing workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Professional Video Editor
            </Badge>
            <h1 className="mb-6">
              Bringing Ideas to Life Through Video
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Creating polished, engaging videos through creative editing and strong visual storytelling. 
              Specializing in commercials, documentaries, and brand content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/portfolio">
                  <Play className="mr-2 size-4" />
                  View My Work
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

  

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of my recent work showcasing different styles and
              techniques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => {
              const isDocumentary = project.category === "Documentary";

              return (
              <Card
                key={project.id}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className={`relative mx-auto w-full overflow-hidden ${isDocumentary ? "aspect-video" : "aspect-[9/16] max-w-[20rem]"}`}>
                  <FeaturedVideoPlayer
                    title={project.title}
                    videoUrl={project.videoUrl}
                    videoEmbedUrl={project.videoEmbedUrl}
                    poster={project.image}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="size-8 text-black ml-1" fill="black" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute top-4 right-4">
                    <Badge variant="secondary">{project.duration}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    {project.category}
                  </div>
                  <h3 className="font-semibold">{project.title}</h3>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {featuredProjects.length === 0 && (
            <p className="text-center text-muted-foreground">Featured projects will appear here soon.</p>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/portfolio">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">What I Do</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional video editing services tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-6">
                  <Film className="size-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-3">Commercial Editing</h3>
                <p className="text-sm text-muted-foreground">
                  High-impact video content for brands, products, and marketing
                  campaigns that drive results.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-pink-100 dark:bg-pink-900/20 mb-6">
                  <Scissors className="size-8 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-3">Documentary Editing</h3>
                <p className="text-sm text-muted-foreground">
                  Compelling storytelling through careful editing that brings
                  narratives to life.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
                  <Sparkles className="size-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-3">Motion Graphics</h3>
                <p className="text-sm text-muted-foreground">
                  Dynamic animations and visual effects that enhance your video
                  content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
            <CardContent className="p-12 text-center text-white">
              <h2 className="mb-4 text-white">Have a Project in Mind?</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Let's bring your ideas to life with creative, professional video editing. Get in touch to discuss your project.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to="/contact">Contact Me</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
