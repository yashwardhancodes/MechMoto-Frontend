import React from 'react'
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="bg-[#050B20] text-white py-16">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div>
            <h3 className="text-xl font-semibold mb-2">Sign up for news and resources</h3>
            <p className="text-gray-400">Unsubscribe at any time.</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <input
              type="email"
              placeholder="email@detail.co"
              className="bg-[rgba(206,201,211,0.15)] px-4 py-2 rounded-full w-64 focus:outline-none"
            />
            <button className="       bg-gradient-to-r from-[#9AE144] to-[#1F5B05] text-white px-5 py-1 rounded-full hover:opacity-90 transition-all">
              Sign Up
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div>
            <h4 className="font-semibold mb-4">Detail</h4>
            <ul className="space-y-2">
              <li><Link href="/download" className="text-gray-400 hover:text-white transition-colors">Download</Link></li>
              <li><Link href="/discord" className="text-gray-400 hover:text-white transition-colors">Join Discord</Link></li>
              <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/affiliate" className="text-gray-400 hover:text-white transition-colors">Become an Affiliate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Use Cases</h4>
            <ul className="space-y-2">
              <li><Link href="/video-podcasts" className="text-gray-400 hover:text-white transition-colors">Video Podcasts</Link></li>
              <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Video Tutorials</Link></li>
              <li><Link href="/mobile-video" className="text-gray-400 hover:text-white transition-colors">Mobile Video</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/scene-packs" className="text-gray-400 hover:text-white transition-colors">Scene Packs</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Get Help</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/youtube" className="text-gray-400 hover:text-white transition-colors">YouTube Videos</Link></li>
              <li><Link href="/getting-started" className="text-gray-400 hover:text-white transition-colors">Getting Started</Link></li>
              <li><Link href="/shortcuts" className="text-gray-400 hover:text-white transition-colors">Shortcuts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Social</h4>
            <ul className="space-y-2">
              <li><Link href="/youtube" className="text-gray-400 hover:text-white transition-colors">YouTube</Link></li>
              <li><Link href="/instagram" className="text-gray-400 hover:text-white transition-colors">Instagram</Link></li>
              <li><Link href="/twitter" className="text-gray-400 hover:text-white transition-colors">Twitter</Link></li>
              <li><Link href="/linkedin" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link></li>
              <li><Link href="/tiktok" className="text-gray-400 hover:text-white transition-colors">TikTok</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm">&copy; 2023 Detail Technologies B.V. All rights reserved</p>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Powered by</span>
            <Link href="https://framer.com" className="text-gray-400 hover:text-white ml-2">
              <img src="/framer-logo.svg" alt="Framer" className="h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}