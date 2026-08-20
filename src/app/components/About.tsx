import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { 
  Award, 
  Briefcase, 
  GraduationCap, 
  Video, 
  Sparkles, 
  Zap,
  Layers,
  Music
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function About() {
  const skills = [
    { name: "Adobe Premiere Pro", level: 95 },
    { name: "DaVinci Resolve", level: 90 },
    { name: "After Effects", level: 85 },
    { name: "Final Cut Pro", level: 80 },
    { name: "Color Grading", level: 90 },
    { name: "Motion Graphics", level: 85 },
    { name: "Sound Design", level: 75 },
    { name: "Storytelling", level: 95 },
  ];

  const experience = [
    {
      title: "Senior Video Editor",
      company: "Creative Studio Inc.",
      period: "2023 - Present",
      description: "Lead editor for commercial and corporate video projects.",
    },
    {
      title: "Freelance Video Editor",
      company: "Self-Employed",
      period: "2021 - Present",
      description: "Working with diverse clients on various video projects.",
    },
    {
      title: "Video Editor",
      company: "Media Productions",
      period: "2020 - 2023",
      description: "Edited documentaries, music videos, and promotional content.",
    },
  ];

  const awards = [
    {
      icon: Award,
      title: "Best Commercial Edit",
      organization: "National Video Awards",
      year: "2025",
    },
    {
      icon: Award,
      title: "Excellence in Documentary",
      organization: "Film Festival",
      year: "2024",
    },
    {
      icon: Award,
      title: "Emerging Talent",
      organization: "Editors Guild",
      year: "2023",
    },
  ];

  const expertise = [
    {
      icon: Video,
      title: "Professional Editing",
      description: "Turning raw footage into polished, engaging videos with clean cuts, smooth pacing, and seamless storytelling.",
    },
    {
      icon: Sparkles,
      title: "Visual Effects",
      description: "Enhancing videos with creative effects, dynamic motion graphics, and visual elements that bring ideas to life.",
    },
    {
      icon: Zap,
      title: "Fast Turnaround",
      description: "Delivering high-quality edits on schedule through an efficient and well-organized editing workflow.",
    },
    {
      icon: Layers,
      title: "Color Grading",
      description: "Enhancing the mood and visual style of every scene with balanced color correction and cinematic grading.",
    },
    {
      icon: Music,
      title: "Audio Mixing",
      description: "Creating clear, balanced sound through precise audio editing, mixing, and thoughtful sound design.",
    },
    {
      icon: Briefcase,
      title: "Project Management",
      description: "Keeping every project organized from start to finish, with clear communication and attention to deadlines.",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge className="mb-4">About Me</Badge>
              <h1 className="mb-6">Bringing Stories to Life Through Expert Editing</h1>
              <p className="text-lg text-muted-foreground mb-6">
                I'm a dedicated video editor with over 5 years of experience turning raw footage into engaging and impactful visual stories.
                My expertise covers a wide range of projects, including commercials, documentaries, music videos, and corporate productions.
              </p>
              <p className="text-muted-foreground mb-8">
                I bring creativity, precision, and a strong sense of visual storytelling to every project. 
                I work closely with clients to understand their ideas and transform their vision into engaging, polished content. 
                Every cut, transition, and frame is thoughtfully crafted to create a compelling final result.
              </p>
              <Button asChild size="lg">
                <Link to="/contact">Let's Work Together</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758906819465-b2fde39d715d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB2aWRlb2dyYXBoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODI2NTUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Video editor at work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white max-w-xs">
                <p className="font-semibold text-2xl mb-1">5+ Years</p>
                <p className="text-white/90">Professional Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Areas of Expertise</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive video editing skills and services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {expertise.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                    <item.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Technical Skills</h2>
              <p className="text-muted-foreground">
                Proficiency in industry leading tools and techniques
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Professional Experience</h2>
              <p className="text-muted-foreground">
                My journey in video editing
              </p>
            </div>
            <div className="space-y-6">
              {experience.map((job, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{job.title}</h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant="secondary">{job.period}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center text-white">
              <h2 className="mb-4 text-white">Bring Your Vision to Life</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Have a project in mind? Let's work together to turn your ideas into engaging, professional video content that leaves a lasting impression.
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
