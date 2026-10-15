"use client"

import React, { useRef } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react"
import { sectionType, storyChapterTitleSize } from "@/lib/section-typography"
import Image from "next/image"
import { TornPaperEdge } from "./TornPaperEdge"
import { TintedDeco } from "@/components/tinted-deco"
import { WatercolorBackdrop } from "@/components/loader/WatercolorBackdrop"

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  // Letters only: digits + punctuation fall through to Playfair ("Seasons Numerals", app/globals.css)
  declarations: [{ prop: "unicode-range", value: "U+0020, U+0041-005A, U+0061-007A, U+00C0-00D6, U+00D8-00F6, U+00F8-00FF, U+0152-0153" }],
  fallback: ["'Seasons Numerals'", "serif"],
  adjustFontFallback: false,
  display: "swap",
  variable: "--font-the-seasons",
})

const lightBg = "var(--color-welcome-bg)"
const darkBg = "var(--color-welcome-green)"
const revealEase = [0.22, 1, 0.36, 1] as const

// Plain cards: flat palette colors — teal text on light cards, light text on teal cards
const TEAL = "var(--color-welcome-navy)"
const ON_TEAL = "var(--color-motif-soft)"

export type LoveStoryEucalyptusDecos = {
  topLeft: string
  bottomRight: string
  timelineTop: string
  sectionBottom: string
}

interface StorySectionProps {
  imageSrc?: string
  title?: string
  text: React.ReactNode
  layout: "image-left" | "image-right"
  theme: "dark" | "light"
  isFirst?: boolean
  isLast?: boolean
  plain?: boolean
  chapterIndex?: number
  eucalyptusDecos?: LoveStoryEucalyptusDecos
  // Word before the number on plain cards, e.g. "Chapter" → "Chapter 01"
  chapterLabelText?: string
}

function PlainEucalyptusDecos({ decos }: { decos: LoveStoryEucalyptusDecos }) {
  return (
    <>
      <TintedDeco src={decos.timelineTop} className="story-plain-card__euc story-plain-card__euc--center" />
      <TintedDeco src={decos.topLeft} className="story-plain-card__euc story-plain-card__euc--left" />
      <TintedDeco src={decos.bottomRight} className="story-plain-card__euc story-plain-card__euc--right" />
    </>
  )
}

// Card contents appear one after another once the card has landed
const plainItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: revealEase } },
}

// Rules draw outward from the center
const plainRuleVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: revealEase } },
}

function PlainChapterDivider({ dark }: { dark: boolean }) {
  const line = dark
    ? "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)"
    : "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)"
  return (
    <motion.div className="mb-4 flex items-center justify-center gap-1.5 sm:mb-5" variants={plainItemVariants}>
      <motion.span className="h-px w-8 origin-right sm:w-12" style={{ background: line }} variants={plainRuleVariants} />
      <motion.span
        className="h-1 w-1 rotate-45"
        style={{ background: dark ? "var(--color-motif-blush)" : "var(--color-romantic-coral)" }}
        variants={{ hidden: { scale: 0, rotate: 45 }, show: { scale: 1, rotate: 225, transition: { duration: 0.8, ease: revealEase } } }}
        aria-hidden
      />
      <motion.span className="h-px w-8 origin-left sm:w-12" style={{ background: line }} variants={plainRuleVariants} />
    </motion.div>
  )
}

export const StorySection: React.FC<StorySectionProps> = ({
  imageSrc,
  title,
  text,
  layout,
  theme,
  isFirst = false,
  isLast = false,
  plain = false,
  chapterIndex = 0,
  eucalyptusDecos,
  chapterLabelText = "Chapter",
}) => {
  // Plain cards are always light; the dark theme only applies to the photo layout
  const isDark = theme === "dark" && !plain
  const showImage = !plain && Boolean(imageSrc)
  const reduceMotion = useReducedMotion()
  const slideFromLeft = layout === "image-left"

  const imageFrameStyle = isDark
    ? {
        background:
          "color-mix(in srgb, var(--color-welcome-bg-soft) 12%, var(--color-welcome-bg-soft))",
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--color-motif-accent) 35%, transparent)",
      }
    : {
        background: "var(--color-welcome-bg-soft)",
        border: "1px solid color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
        boxShadow:
          "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
      }

  const rotation = layout === "image-left" ? "rotate-1 md:rotate-2" : "-rotate-1 md:-rotate-2"
  const flexDirection = layout === "image-left" ? "flex-row" : "flex-row-reverse"
  const plainAlign =
    layout === "image-left" ? "md:text-left md:items-start" : "md:text-right md:items-end"

  const chapterLabel = String(chapterIndex + 1).padStart(2, "0")
  // Ghost numeral behind each card, alternating sides chapter by chapter
  const ghostOnLeft = chapterIndex % 2 === 0
  const stagger = Math.min(chapterIndex * 0.07, 0.45)

  const imageInitial = reduceMotion
    ? { opacity: 1, scale: 1, y: 0 }
    : { opacity: 0, scale: 0.9, y: 24 }

  const textInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 16 }

  // Scroll-linked motion for plain chapters: parallax layers + the timeline thread filling in
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start end", "end start"] })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const ghostY = useTransform(smoothProgress, [0, 1], [90, -90])
  const cardGhostY = useTransform(smoothProgress, [0, 1], [24, -24])
  const washY = useTransform(smoothProgress, [0, 1], [-50, 50])
  const threadScale = useTransform(scrollYProgress, [0.15, 0.65], [0, 1])
  const parallax = !reduceMotion

  // Card lands like paper set down on a table: rises, untilts, sharpens — then its contents stagger in
  const plainCardVariants: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 0,
          x: slideFromLeft ? -28 : 28,
          y: 70,
          rotateX: 14,
          rotate: slideFromLeft ? -1.5 : 1.5,
          scale: 0.94,
          filter: "blur(6px)",
        },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      rotate: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: reduceMotion
        ? { duration: 0 }
        : {
            duration: 1.05,
            ease: revealEase,
            when: "beforeChildren",
            staggerChildren: 0.11,
            delayChildren: 0.05,
          },
    },
  }

  const sectionSurfaceClass = plain
    ? `love-story-plain-track love-story-plain-track--theme-${theme}${isFirst ? " love-story-plain-track--first" : ""}${isLast ? " love-story-plain-track--last" : ""}`
    : ""

  return (
    <div
      ref={trackRef}
      className={`${theSeasons.variable} relative z-[2] ${sectionSurfaceClass}`}
      style={plain ? undefined : { background: isDark ? darkBg : lightBg }}
    >
      {plain && (
        <>
          <motion.div className="absolute inset-0" style={parallax ? { y: washY } : undefined} aria-hidden="true">
            <WatercolorBackdrop layer mirror={chapterIndex % 2 === 1} />
          </motion.div>
          {/* Timeline thread fills in as the chapter scrolls past */}
          <motion.span
            className="story-plain-thread-progress"
            style={{ scaleY: reduceMotion ? 1 : threadScale }}
            aria-hidden="true"
          />
          <motion.span
            className={`${theSeasons.className} story-plain-ghost-number ${ghostOnLeft ? "story-plain-ghost-number--left" : "story-plain-ghost-number--right"}`}
            aria-hidden="true"
            style={parallax ? { y: ghostY } : undefined}
            initial={reduceMotion ? false : { opacity: 0, x: ghostOnLeft ? -60 : 60, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.4, ease: revealEase }}
          >
            {chapterLabel}
          </motion.span>
        </>
      )}

      {!isDark && !plain && (
        <>
          {!isFirst && (
            <div className="pointer-events-none absolute left-0 top-0 z-20 -mt-[8px] w-full md:-mt-[20px]">
              <TornPaperEdge flipped={true} color={lightBg} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 -mb-[8px] w-full md:-mb-[20px]">
            <TornPaperEdge flipped={false} color={lightBg} />
          </div>
        </>
      )}

      <div
        className={`container relative z-10 mx-auto px-2 md:px-12 ${showImage ? "py-12 md:py-32" : "py-1.5 md:py-14"} ${isFirst ? (showImage ? "pt-16 md:pt-36" : "pt-8 md:pt-16") : ""} ${isLast ? (showImage ? "pb-16 md:pb-36" : "pb-6 md:pb-16") : ""}`}
      >
        <div
          className={
            showImage
              ? `flex ${flexDirection} items-center justify-between gap-3 md:gap-16`
              : `mx-auto flex max-w-2xl flex-col items-center px-2 text-center sm:px-4 ${plainAlign}`
          }
        >
          {showImage && imageSrc && (
            <div className="flex w-[45%] shrink-0 justify-center md:w-5/12">
              <motion.div
                className={`relative w-full md:max-w-md ${rotation}`}
                initial={imageInitial}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.95, delay: stagger, ease: revealEase }}
              >
                <div className="w-full p-1.5 md:p-3" style={imageFrameStyle}>
                  <div className="group relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt="Story moment"
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 40vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      quality={90}
                      priority={chapterIndex < 2}
                    />
                    {isDark && (
                      <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-multiply" />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {plain ? (
            <motion.article
              className={`story-plain-card w-full max-w-xl px-5 pb-7 pt-10 sm:rounded-2xl sm:px-8 sm:pb-9 sm:pt-12 md:px-9 md:pb-10 md:pt-14 ${isDark ? "story-plain-card--dark" : ""}`}
              style={{ transformPerspective: 1000, transformOrigin: "50% 100%" }}
              variants={plainCardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              {eucalyptusDecos ? (
                <PlainEucalyptusDecos decos={eucalyptusDecos} />
              ) : null}
              {/* Phones: ghost numeral overlaps the card's top edge (the side numeral is hidden there) */}
              <motion.span
                className={`${theSeasons.className} story-plain-card__ghost ${ghostOnLeft ? "story-plain-card__ghost--left" : "story-plain-card__ghost--right"}`}
                aria-hidden="true"
                style={parallax ? { y: cardGhostY } : undefined}
              >
                {chapterLabel}
              </motion.span>
              <span className="story-plain-card__frost" aria-hidden />
              <span className="story-plain-card__dot" aria-hidden />
              <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
              <div className="relative z-[2]">
              <motion.p
                className={`${theSeasons.className} story-plain-chapter-label mb-2 text-[0.58rem] font-medium uppercase sm:text-[0.62rem]`}
                variants={plainItemVariants}
              >
                {chapterLabelText} {chapterLabel}
              </motion.p>
              {title ? (
                <motion.h2
                  variants={plainItemVariants}
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:tracking-[0.11em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? ON_TEAL : TEAL,
                  }}
                >
                  {title}
                </motion.h2>
              ) : null}
              <PlainChapterDivider dark={isDark} />
              <motion.div
                style={{ color: isDark ? ON_TEAL : TEAL }}
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-5 lg:leading-[1.7] ${sectionType.textRelaxed}`}
                variants={plainItemVariants}
              >
                {text}
              </motion.div>
              <motion.div
                className={`story-plain-chapter-line mt-6 sm:mt-7 ${isDark ? "story-plain-chapter-line--dark" : ""}`}
                variants={plainRuleVariants}
                aria-hidden
              />
              </div>
              {!isLast && (
                <div className="story-plain-chapter-connector" aria-hidden>
                  <span className="story-plain-chapter-connector__stem" />
                </div>
              )}
            </motion.article>
          ) : (
            <motion.div
              className={
                showImage
                  ? "w-[55%] @container/story md:w-5/12"
                  : "w-full @container/story px-2 sm:px-4"
              }
              style={{ color: isDark ? lightBg : "var(--color-welcome-text)" }}
              initial={textInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.85, delay: stagger + 0.15, ease: revealEase }}
            >
              {title && (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:mb-6 md:tracking-[0.12em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? lightBg : "var(--color-welcome-navy)",
                  }}
                >
                  {title}
                </h2>
              )}
              <div
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-6 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
