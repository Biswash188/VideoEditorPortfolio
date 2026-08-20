import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Play, Film, Scissors, Sparkles, Award, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Home() {
  const featuredProjects = [
    {
      id: 1,
      title: "Brand Documentary",
      category: "Corporate",
      image: "https://images.unsplash.com/photo-1612548403247-aa2873e9422d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBmaWxtJTIwcHJvZHVjdGlvbiUyMGNhbWVyYXxlbnwxfHx8fDE3ODI2NTUxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "3:45",
    },
    {
      id: 2,
      title: "Product Launch",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21tZXJjaWFsJTIwYWR2ZXJ0aXNpbmd8ZW58MXx8fHwxNzgyNjU1MTU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2:30",
    },
    {
      id: 3,
      title: "Creative Studio",
      category: "Behind the Scenes",
      image: "https://images.unsplash.com/photo-1638545818407-ac7a54b544fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHN0dWRpbyUyMGZpbG1tYWtlcnxlbnwxfHx8fDE3ODI2NTUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "5:20",
    },
  ];

  const stats = [
    { icon: Film, value: "150+", label: "Projects Completed" },
    { icon: Award, value: "25+", label: "Awards Won" },
    { icon: Users, value: "80+", label: "Happy Clients" },
    { icon: Sparkles, value: "5+", label: "Years Experience" },
  ];

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

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="size-6 text-primary" />
                </div>
                <div className="font-bold text-3xl mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="size-8 text-black ml-1" fill="black" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
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
            ))}
          </div>

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
