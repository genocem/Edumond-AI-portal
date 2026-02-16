"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Globe, Users, Star, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssistantAvatar } from "@/components/avatars/AssistantAvatar";

const features = [
  {
    icon: GraduationCap,
    title: "Study Abroad",
    description: "Access top universities in Germany, Italy, Spain, Belgium, and Turkey with tailored guidance.",
  },
  {
    icon: Briefcase,
    title: "Career Opportunities",
    description: "Find Ausbildung programs and recruitment opportunities across Europe.",
  },
  {
    icon: BookOpen,
    title: "Language Training",
    description: "Comprehensive language courses from A1 to C2 with certified instructors.",
  },
  {
    icon: Globe,
    title: "5 Countries",
    description: "Programs available in Germany, Italy, Spain, Belgium, and Turkey.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Personalized recommendations powered by our AI matching system.",
  },
  {
    icon: Star,
    title: "Proven Results",
    description: "Hundreds of students successfully placed in international programs.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    country: "🇩🇪 Germany",
    text: "Digital Minds helped me find the perfect Master's program in Berlin. The questionnaire matched me with programs I hadn't even considered!",
    rating: 5,
  },
  {
    name: "Ahmed K.",
    country: "🇹🇷 Turkey",
    text: "The Ausbildung program recommendation was exactly what I needed. I'm now training in IT in Istanbul with a great salary.",
    rating: 5,
  },
  {
    name: "Maria L.",
    country: "🇮🇹 Italy",
    text: "From language courses to university enrollment, the entire process was smooth and well-guided. Highly recommend!",
    rating: 5,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPageClient() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-background" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Gateway to{" "}
                <span className="text-accent">International</span>{" "}
                Education
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                Discover the perfect study program, career opportunity, or
                professional training across Europe. Our AI-powered platform
                matches you with programs tailored to your goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/questionnaire">
                  <Button size="lg" className="text-base">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg" className="text-base">
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-accent">5</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">20+</div>
                  <div className="text-sm text-muted-foreground">Programs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <AssistantAvatar country="default" size="lg" />
                <div className="mt-6 text-center">
                  <div className="inline-block bg-card border border-border rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm">
                    <p className="text-sm text-foreground">
                      👋 Hi! I&apos;m your orientation assistant. <br />
                      Let me help you find the perfect program!
                    </p>
                  </div>
                </div>

                {/* Floating country flags */}
                {["🇩🇪", "🇮🇹", "🇪🇸", "🇧🇪", "🇹🇷"].map((flag, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: i % 2 === 0 ? "-20%" : "110%",
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                    }}
                  >
                    {flag}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need to{" "}
              <span className="text-accent">Succeed</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From language courses to university placement, we provide
              comprehensive support for your international journey.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How It <span className="text-accent">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Take the Quiz", desc: "Answer a few questions about your goals and preferences" },
              { step: "02", title: "Get Matched", desc: "Our AI analyzes your profile and finds the best programs" },
              { step: "03", title: "Book a Meeting", desc: "Schedule a consultation with our orientation experts" },
              { step: "04", title: "Start Your Journey", desc: "Enroll in your chosen program and begin your adventure" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-accent">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What Our <span className="text-accent">Students</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      &quot;{t.text}&quot;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-accent">
                          {t.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.country}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your <span className="text-accent">Journey</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take our quick questionnaire and get personalized program
              recommendations in minutes.
            </p>
            <Link href="/questionnaire">
              <Button size="lg" className="text-base">
                Begin Questionnaire
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
