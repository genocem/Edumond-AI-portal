"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  Users,
  Star,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssistantAvatar } from "@/components/avatars/AssistantAvatar";

const features = [
  {
    icon: GraduationCap,
    title: "Study Abroad",
    description:
      "Access top universities in Germany, Italy, Spain, Belgium, and Turkey with tailored guidance.",
  },
  {
    icon: Briefcase,
    title: "Career Opportunities",
    description:
      "Find Ausbildung programs and recruitment opportunities across Europe.",
  },
  {
    icon: BookOpen,
    title: "Language Training",
    description:
      "Comprehensive language courses from A1 to C2 with certified instructors.",
  },
  {
    icon: Globe,
    title: "5 Countries",
    description:
      "Programs available in Germany, Italy, Spain, Belgium, and Turkey.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description:
      "Personalized recommendations powered by our AI matching system.",
  },
  {
    icon: Star,
    title: "Proven Results",
    description:
      "Hundreds of students successfully placed in international programs.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    country: "🇩🇪 Germany",
    text: "EduBud helped me find the perfect Master's program in Berlin. The questionnaire matched me with programs I hadn't even considered!",
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
    <div className="overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 selection:bg-accent/30">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="inline-flex items-center rounded-full border  bg-green-500/5 px-3 py-1 text-sm font-medium text-green-500 backdrop-blur-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                All EduBud services are working
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                Your Gateway to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/70">
                  International
                </span>{" "}
                Education
              </h1>
              <p className="mt-8 text-xl text-muted-foreground max-w-lg leading-relaxed">
                Discover the perfect study program, career opportunity, or
                professional training across Europe. Our AI-powered platform
                matches you with programs tailored to your goals.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/questionnaire">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base rounded-full shadow-xl shadow-accent/20 hover:shadow-accent/30 transition-all hover:scale-105"
                  >
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base rounded-full border-2 hover:bg-accent/5"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 flex gap-12 border-t border-border pt-8">
                <div>
                  <div className="text-4xl font-bold text-foreground">5</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    Countries
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground">20+</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    Programs
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground">500+</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    Students
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center relative lg:justify-end"
            >
              <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                {/* Background decorative blob */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />

                {/* Orbital Rings - Decorative */}
                <div className="absolute inset-0 border border-accent/10 rounded-full scale-[0.8] animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 border border-dashed border-accent/10 rounded-full scale-[1.2] animate-[spin_15s_linear_infinite_reverse]" />

                <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                  <AssistantAvatar
                    country="default"
                    size="lg"
                    className=" w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 shadow-2xl rounded-full border-4 border-background/50 backdrop-blur-sm"
                  />

                  {/* AI Matcher Card - Centered relative to avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-card/90 border border-border/50 backdrop-blur-xl p-4 rounded-2xl shadow-xl w-[260px] md:w-[280px] z-20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                          AI Matcher
                          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                          Found{" "}
                          <span className="font-semibold text-foreground">
                            3 new programs
                          </span>{" "}
                          matching your profile in Germany.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating country flags - Improved positioning */}
                {["🇩🇪", "🇮🇹", "🇪🇸", "🇧🇪", "🇹🇷"].map((flag, i) => {
                  return (
                    <motion.div
                      key={i}
                      className="absolute text-4xl drop-shadow-md hidden sm:block bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-accent/10"
                      style={{
                        zIndex: 15,
                        top: `${50 + Math.sin(i * 1.25 + 1) * 45}%`,
                        left: `${50 + Math.cos(i * 1.25 + 1) * 45}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        delay: i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {flag}
                    </motion.div>
                  );
                })}
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
              {
                step: "01",
                title: "Take the Quiz",
                desc: "Answer a few questions about your goals and preferences",
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Our AI analyzes your profile and finds the best programs",
              },
              {
                step: "03",
                title: "Book a Meeting",
                desc: "Schedule a consultation with our orientation experts",
              },
              {
                step: "04",
                title: "Start Your Journey",
                desc: "Enroll in your chosen program and begin your adventure",
              },
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
