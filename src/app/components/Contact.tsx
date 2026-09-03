import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          projectType: formData.projectType,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? "Unable to send your message. Please try again.");
      }

      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        message: "",
      });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "bn660568@gmail.com",
      link: "mailto:hello@bipinstudios.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+977 9803928281",
      link: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Kathmandu, Nepal",
      link: null,
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Mon-Fri, 9AM-6PM NPT",
      link: null,
    },
  ];

  const projectTypes = [
    "Commercial",
    "Documentary",
    "Music Video",
    "Wedding",
    "Corporate",
    "Other",
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">Get in Touch</Badge>
            <h1 className="mb-4">Let's Discuss Your Project</h1>
            <p className="text-lg text-muted-foreground">
              Have a video project in mind? I'd love to hear about it. Fill out the
              form below or reach out directly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 shrink-0">
                      <info.icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Social Media</h3>
                  <div className="space-y-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Instagram: @bipinstudios
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      YouTube: My Portfolio
                    </a>
                    <a
                      href="https://vimeo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Vimeo: bipinstudios
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      LinkedIn: Video Editor
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="mb-6">Send Me a Message</h2>
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                        <Send className="size-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. I'll get back to you soon.
                      </p>
                      <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="projectType">Project Type *</Label>
                          <select
                            id="projectType"
                            name="projectType"
                            value={formData.projectType}
                            onChange={(e) =>
                              setFormData({ ...formData, projectType: e.target.value })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          >
                            <option value="">Select a project type</option>
                            {projectTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Project Details *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell me about your project, timeline, budget, and any specific requirements..."
                          className="min-h-[150px]"
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                        <Send className="mr-2 size-4" />
                        {submitting ? "Sending…" : "Send Message"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    What is your typical turnaround time?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Turnaround time varies based on project complexity. Simple edits
                    can be completed in 3-5 days, while more complex projects may take
                    2-3 weeks. Rush services are available for an additional fee.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What are your rates?</h3>
                  <p className="text-sm text-muted-foreground">
                    Rates depend on project scope, length, and complexity. I offer both
                    hourly rates and project-based pricing. Contact me for a custom
                    quote based on your specific needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    Do you offer revisions?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! I include 2-3 rounds of revisions in my standard packages to
                    ensure you're completely satisfied with the final product.
                    Additional revisions can be accommodated for an additional fee.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    What file formats do you work with?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    I work with all standard video formats including MOV, MP4, AVI,
                    ProRes, and more. I can deliver final videos in any format you
                    need, optimized for your intended platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
