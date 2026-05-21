'use client'

import { useEffect, useState, memo } from 'react'
import Particles from '@tsparticles/react'
import { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'


function ParticlesBackground() {
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
    <Particles
      id="tsparticles"
      className="absolute top-0 left-0 w-full h-full z-0"
options={{
  fullScreen: {
    enable: false,
  },

  background: {
    color: {
      value: 'transparent',
    },
  },

  fpsLimit: 120,

  particles: {
    number: {
      value: 45,
      density: {
        enable: true,
      },
    },

    color: {
      value: ['#1E3A8A', '#2563EB', '#D4A017'],
    },

    shape: {
      type: 'circle',
    },

    opacity: {
      value: 0.15,
    },

    size: {
      value: { min: 2, max: 8 },
    },

    blur: {
      enable: true,
      value: 6,
    },

    move: {
      enable: true,
      speed: 0.4,
      direction: 'none',
      random: false,
      straight: false,
      outModes: {
        default: 'out',
      },
    },

    links: {
      enable: true,
      distance: 180,
      color: '#2563EB',
      opacity: 0.12,
      width: 1,
      triangles: {
        enable: true,
        opacity: 0.03,
      },
    },
  },

  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab',
      },

      resize: {
        enable: true,
      },
    },

    modes: {
      grab: {
        distance: 200,
        links: {
          opacity: 0.25,
        },
      },
    },
  },

  detectRetina: true,
}}
    />
  )
}

export default memo(ParticlesBackground)