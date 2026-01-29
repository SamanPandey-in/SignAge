/**
 * Landing Page - SignAge
 * Inclusive Sign Language Learning Platform
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import Button from '@components/common/Button';
import {
  IoBook,
  IoCamera,
  IoTrophy,
  IoArrowForward,
  IoHardwareChipOutline,
  IoPeopleOutline,
  IoPulseOutline
} from 'react-icons/io5';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: IoCamera,
      title: 'AI Gesture Recognition',
      description: 'Powered by MediaPipe technology to validate your signs in real-time with high precision.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: IoPulseOutline,
      title: 'Tactile Feedback',
      description: 'Optional ESP32 hardware provides vibration alerts, helping children learn through touch.',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      icon: IoPeopleOutline,
      title: 'Inclusive Design',
      description: 'Bridging the communication gap between special children and their peers through shared learning.',
      color: 'bg-cyan-100 text-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-24 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full">
              Empowering Inclusive Communication
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
              Signs that <span className="text-blue-600">Connect</span> Every Child.
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
              SignAge uses AI-powered gesture recognition and tactile feedback to help special children and their peers learn sign language together, breaking social barriers one sign at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="large"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-8 shadow-xl shadow-blue-200"
              >
                Start Learning Now
                <IoArrowForward className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="large"
                variant="outline"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-8 bg-white"
              >
                Explore Lessons
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            {/* Decorative element for the AI Visualizer feel */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-200 aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <IoCamera className="text-6xl text-blue-500 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-500 font-medium">AI Camera Interface Preview</p>
              </div>
              {/* Visualizing Hand Landmarks Overlay Mockup */}
              <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-dashed border-blue-400 rounded-full animate-ping opacity-20" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-10 blur-2xl" />
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-cyan-100 rounded-full -z-10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How SignAge Works</h2>
            <p className="text-slate-600">Our platform combines cutting-edge AI with physical feedback to create a multisensory learning experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                    <Icon className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hardware Integration Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-16 text-white relative shadow-2xl overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] -ml-48 -mb-48" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
                  <IoHardwareChipOutline className="text-xl" />
                  <span className="text-sm font-bold tracking-widest uppercase">Hardware Extension</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Learning You Can <span className="text-blue-400">Feel.</span>
                </h2>

                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  For children who benefit from multisensory reinforcement, SignAge offers an optional
                  <strong> ESP32-powered haptic kit</strong>. Using Bluetooth Low Energy (BLE), the app
                  sends real-time signals to a wearable vibration module.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <IoPulseOutline className="text-xl animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Haptic Reinforcement</h4>
                      <p className="text-sm text-slate-400">Tactile pulses bridge the gap between digital learning and physical sensation.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Feedback Logic Card */}
                <div className="bg-slate-800 border border-white/10 rounded-3xl p-8 shadow-inner">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Feedback Logic
                  </h3>

                  <div className="space-y-6">
                    {/* Correct Gesture */}
                    <div className="relative p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group hover:bg-emerald-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-emerald-400 font-bold tracking-wider">CORRECT GESTURE</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-1 bg-emerald-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="h-8 w-1 bg-emerald-500/40 rounded-full" />
                        <div className="h-12 w-1 bg-emerald-500 rounded-full" />
                        <div className="h-8 w-1 bg-emerald-500/40 rounded-full" />
                        <span className="ml-4 text-sm text-emerald-100/70 italic">Short, encouraging pulse</span>
                      </div>
                    </div>

                    {/* Incorrect Gesture */}
                    <div className="relative p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 group hover:bg-rose-500/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-rose-400 font-bold tracking-wider">NEEDS ADJUSTMENT</span>
                        <div className="flex gap-1">
                          <div className="w-8 h-1 bg-rose-400 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="h-4 w-1 bg-rose-500/40 rounded-full" />
                        <div className="h-4 w-1 bg-rose-500 rounded-full" />
                        <div className="h-4 w-1 bg-rose-500 rounded-full" />
                        <div className="h-4 w-1 bg-rose-500 rounded-full" />
                        <div className="h-4 w-1 bg-rose-500/40 rounded-full" />
                        <span className="ml-4 text-sm text-rose-100/70 italic">Long, steady vibration</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase font-mono tracking-widest">ESP32 Status: Connected</span>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold text-blue-600 mb-2">Real-time</div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Feedback</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-blue-600 mb-2">26+</div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Alphabet Signs</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-blue-600 mb-2">BLE</div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Hardware Sync</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-blue-600 mb-2">∞</div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Inclusive Joy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 mb-4">SignAge – Bridging Gaps with AI and Empathy</p>
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">GitHub Credits: Monzer Dev</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;