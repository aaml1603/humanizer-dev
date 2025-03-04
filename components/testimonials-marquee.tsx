"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimationControls, useInView } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Content Manager",
    company: "TechVision Media",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
    text: "HumanizeAI has completely transformed our content strategy. Our AI-written articles now pass all detection tests and have the authentic voice we were missing.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "SEO Specialist",
    company: "GrowthHackers",
    avatar: "/avatars/michael.jpg",
    rating: 5,
    text: "I was skeptical at first, but the results speak for themselves. Our content ranks better and engages more readers since we started using HumanizeAI.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Director",
    company: "Innovate Solutions",
    avatar: "/avatars/emily.jpg",
    rating: 4,
    text: "The time we save with AI writing plus HumanizeAI's processing is incredible. What used to take days now takes hours, with better quality.",
  },
  {
    id: 4,
    name: "David Okafor",
    role: "Academic Researcher",
    company: "University of Technology",
    avatar: "/avatars/david.jpg",
    rating: 5,
    text: "As a researcher, I need to ensure my AI-assisted writing doesn't trigger plagiarism detectors. HumanizeAI has been a game-changer for my workflow.",
  },
  {
    id: 5,
    name: "Jessica Liu",
    role: "Freelance Writer",
    company: "Self-employed",
    avatar: "/avatars/jessica.jpg",
    rating: 5,
    text: "I can now use AI to help with my client work without worrying about detection. The humanized text maintains my voice while saving me hours of work.",
  },
  {
    id: 6,
    name: "Robert Keller",
    role: "Chief Content Officer",
    company: "Digital Frontiers",
    avatar: "/avatars/robert.jpg",
    rating: 4,
    text: "Our enterprise team processes thousands of articles monthly. HumanizeAI ensures consistency and quality while keeping our content undetectably human.",
  },
  {
    id: 7,
    name: "Aisha Patel",
    role: "Student",
    company: "Graduate School",
    avatar: "/avatars/aisha.jpg",
    rating: 5,
    text: "HumanizeAI helps me refine my AI-assisted research summaries. My professors can't tell the difference, and I can focus on deeper analysis.",
  },
  {
    id: 8,
    name: "Thomas Wright",
    role: "Content Creator",
    company: "Creative Minds",
    avatar: "/avatars/thomas.jpg",
    rating: 5,
    text: "The speed and accuracy of HumanizeAI is unmatched. I've tried other tools, but nothing preserves the original meaning while making text truly human-like.",
  },
]

export function TestimonialsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.2 })
  const controls = useAnimationControls()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Duplicate testimonials to create seamless loop
  const allTestimonials = [...testimonials, ...testimonials]

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden py-10 bg-gradient-to-r from-background via-green-50/20 to-background"
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8 } },
        }}
        className="mb-10 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary mb-4"
        >
          Testimonials
        </motion.div>
        <h2 className="text-3xl font-medium tracking-tight text-gradient-primary md:text-4xl mb-2">
          Loved by users worldwide
        </h2>
        <p className="max-w-[600px] mx-auto text-muted-foreground">
          See what our customers are saying about their experience with HumanizeAI
        </p>
      </motion.div>

      <div className="relative">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            x: {
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          className="flex gap-6 w-max"
        >
          {allTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="w-[350px] p-6 flex flex-col gap-4 bg-card/80 backdrop-blur-sm border-green-500/10 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>
              {testimonial.name.charAt(0)}
              {testimonial.name.split(" ")[1]?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-foreground">{testimonial.name}</h4>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted"
              }`}
            />
          ))}
        </div>
      </div>
      <blockquote className="text-sm text-muted-foreground italic">"{testimonial.text}"</blockquote>
    </Card>
  )
}

