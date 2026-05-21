'use client'

import { useEffect, useState, memo } from 'react'
import Particles from '@tsparticles/react'
import { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { motion } from 'framer-motion'

function DashboardBackground() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  if (!init) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Partículas */}
      <Particles
        id="dashboardParticles"
        className="absolute inset-0"
        options={{
          fullScreen: {
            enable: false,
          },

          background: {
            color: 'transparent',
          },

          fpsLimit: 120,

          particles: {
            number: {
              value: 35,
              density: {
                enable: true,
              },
            },

            color: {
              value: ['#2563EB', '#3B82F6', '#D4A017'],
            },

            shape: {
              type: 'circle',
            },

            opacity: {
              value: { min: 0.08, max: 0.25 },
            },

            size: {
              value: { min: 2, max: 7 },
            },

            blur: {
              enable: true,
              value: 8,
            },

            move: {
              enable: true,
              speed: 0.4,
              direction: 'none',
              random: true,
              straight: false,
              outModes: {
                default: 'out',
              },
            },

            links: {
              enable: true,
              distance: 180,
              color: '#2563EB',
              opacity: 0.08,
              width: 1,
            },
          },

          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: 'grab',
              },
            },

            modes: {
              grab: {
                distance: 180,
                links: {
                  opacity: 0.2,
                },
              },
            },
          },

          detectRetina: true,
        }}
      />

      {/* Glow azul */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-150px] left-[-120px] w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl"
      />

      {/* Glow dorado */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-160px] right-[-100px] w-[380px] h-[380px] rounded-full bg-amber-400/10 blur-3xl"
      />

      {/* Glow central */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-cyan-400/5 blur-3xl"
      />

      {/* Grid futurista */}
      <div
        className="
          absolute inset-0
          opacity-[0.03]
          bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]
          bg-[size:60px_60px]
        "
      />
    </div>
  )
}

export default memo(DashboardBackground)