import { useState } from "react"
import reactLogo from "./assets/react.svg"
import viteLogo from "./assets/vite.svg"
import heroImg from "./assets/hero.png"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center space-y-6">

        <div className="relative flex items-center justify-center">
          <img src={heroImg} className="w-40" alt="" />
          <img
            src={reactLogo}
            className="w-20 absolute -left-16 animate-spin"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="w-20 absolute -right-16"
            alt="Vite logo"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">Get Started</h1>
          <p className="text-gray-400">
            Edit <code className="bg-gray-800 px-1 py-0.5 rounded">src/App.jsx</code> and save to test HMR
          </p>
        </div>

        <button
          className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-lg text-lg font-semibold"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

      </section>

      {/* NEXT STEPS */}
      <section className="grid md:grid-cols-2 gap-10 mt-16 w-full max-w-4xl">

        {/* DOCS */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Documentation</h2>
          <p className="text-gray-400 mb-4">Your questions, answered</p>

          <ul className="space-y-3">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex items-center gap-3 hover:text-indigo-400"
              >
                <img className="w-6" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>

            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                className="flex items-center gap-3 hover:text-indigo-400"
              >
                <img className="w-6" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Connect with us</h2>
          <p className="text-gray-400 mb-4">Join the Vite community</p>

          <ul className="space-y-3">

            <li>
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                className="hover:text-indigo-400"
              >
                GitHub
              </a>
            </li>

            <li>
              <a
                href="https://chat.vite.dev/"
                target="_blank"
                className="hover:text-indigo-400"
              >
                Discord
              </a>
            </li>

            <li>
              <a
                href="https://x.com/vite_js"
                target="_blank"
                className="hover:text-indigo-400"
              >
                X.com
              </a>
            </li>

            <li>
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                className="hover:text-indigo-400"
              >
                Bluesky
              </a>
            </li>

          </ul>
        </div>

      </section>

    </div>
  )
}

export default App