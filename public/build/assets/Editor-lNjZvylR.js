import{r as a,j as t,H as m,L as x,a as w}from"./app-CAOO6Xkc.js";import{_ as k,g as h,a as f}from"./index-CaidLfZE.js";/* empty css            */function M({page:o}){const{prefixedRoute:l}=useRoutePrefix(),d=a.useRef(null),[n,b]=a.useState(null),[p,c]=a.useState(!1),[g,v]=a.useState(null),s=a.useCallback(async()=>{if(n){c(!0);try{const i=n.getHtml(),e=n.getCss(),r=n.getProjectData();await fetch(l("pages.save-content",o.id),{method:"PATCH",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")||"",Accept:"application/json"},body:JSON.stringify({html:i,css:e,gjs_data:r})}),v(new Date)}catch(i){console.error("Failed to save:",i)}finally{c(!1)}}},[n,o.id]);a.useEffect(()=>{if(!d.current)return;const i=k.init({container:d.current,height:"100%",width:"auto",storageManager:!1,plugins:[h,f],pluginsOpts:{[h]:{blocks:["column1","column2","column3","column3-7","text","link","image","video","map"],flexGrid:!0},[f]:{blocksBasicOpts:!0,navbarOpts:!0,countdownOpts:!0,formsOpts:!0}},canvas:{styles:["https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"],scripts:[],frameStyle:`
                    html, body {
                        background-color: #fff;
                        margin: 0;
                        padding: 0;
                        min-height: 100%;
                        height: auto !important;
                    }
                    * { box-sizing: border-box; }
                    body > * { margin: 0; }
                `},deviceManager:{devices:[{name:"Desktop",width:""},{name:"Tablet",width:"768px",widthMedia:"992px"},{name:"Mobile",width:"320px",widthMedia:"480px"}]},panels:{defaults:[{id:"panel-devices",el:".panel__devices",buttons:[{id:"device-desktop",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/></svg>',command:"set-device-desktop",active:!0,togglable:!1},{id:"device-tablet",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"/></svg>',command:"set-device-tablet",togglable:!1},{id:"device-mobile",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/></svg>',command:"set-device-mobile",togglable:!1}]}]}});i.Commands.add("set-device-desktop",{run:r=>r.setDevice("Desktop")}),i.Commands.add("set-device-tablet",{run:r=>r.setDevice("Tablet")}),i.Commands.add("set-device-mobile",{run:r=>r.setDevice("Mobile")}),o.gjs_data?i.loadProjectData(o.gjs_data):o.html&&(i.setComponents(o.html),o.css&&i.setStyle(o.css));const e=i.BlockManager;return e.add("navbar-section",{label:"Navbar",category:"Sections",content:`
                <header class="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center h-20">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary text-4xl font-bold">explore</span>
                                <span class="text-2xl font-black tracking-tight text-slate-900 font-display">GPSTrack</span>
                            </div>
                            
                            <nav class="hidden md:flex space-x-10">
                                <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#features">Features</a>
                                <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#pricing">Pricing</a>
                                <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#">Resources</a>
                            </nav>
                            
                            <div class="flex items-center gap-4 sm:gap-6">
                                <a class="hidden sm:block text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#">Login</a>
                                <button class="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-all vibrant-glow whitespace-nowrap">
                                    Join Today
                                </button>
                                <button class="md:hidden p-2 text-slate-600" data-toggle="mobile-menu">
                                    <span class="material-symbols-outlined">menu</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile Menu -->
                    <div class="hidden md:hidden bg-white border-b border-slate-100 p-4 space-y-4" data-mobile-menu>
                        <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#features">Features</a>
                        <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#pricing">Pricing</a>
                        <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#">Resources</a>
                        <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#">Login</a>
                    </div>
                </header>
            `}),e.add("navbar-modern-gray",{label:"Navbar Modern Gray",category:"Sections",content:`
                <header class="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 shadow-sm" style="position: fixed; top: 0; left: 0; right: 0; z-index: 50;">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center h-16 lg:h-20">
                            <!-- Logo -->
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg" style="width: 40px; height: 40px; background: linear-gradient(to bottom right, #374151, #111827); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <svg class="w-6 h-6 text-white" style="width: 24px; height: 24px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <span class="text-xl lg:text-2xl font-bold" style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(to right, #1f2937, #4b5563); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BrandName</span>
                            </div>
                            
                            <!-- Desktop Navigation -->
                            <nav class="hidden lg:flex items-center gap-1" style="display: flex; align-items: center; gap: 4px;">
                                <a class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; border-radius: 8px; text-decoration: none;" href="#home">Home</a>
                                <a class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; border-radius: 8px; text-decoration: none;" href="#features">Features</a>
                                <a class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; border-radius: 8px; text-decoration: none;" href="#pricing">Pricing</a>
                                <a class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; border-radius: 8px; text-decoration: none;" href="#about">About</a>
                                <a class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; border-radius: 8px; text-decoration: none;" href="#contact">Contact</a>
                            </nav>
                            
                            <!-- CTA Buttons -->
                            <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 12px;">
                                <a class="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors" style="padding: 8px 16px; font-size: 14px; font-weight: 500; color: #374151; text-decoration: none;" href="#login">Sign In</a>
                                <a class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-all duration-300" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(to right, #1f2937, #374151); color: white; font-size: 14px; font-weight: 600; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(156, 163, 175, 0.3);" href="#signup">
                                    Get Started
                                    <svg class="w-4 h-4" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                </a>
                                
                                <!-- Mobile Menu Button -->
                                <button class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors" style="padding: 8px; color: #4b5563; border-radius: 8px; background: transparent; border: none; cursor: pointer;" data-toggle="mobile-menu-gray">
                                    <svg class="w-6 h-6" style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile Menu -->
                    <div class="hidden lg:hidden bg-white border-t border-gray-200" style="display: none; background: rgba(255,255,255,0.95); border-top: 1px solid #e5e7eb;" data-mobile-menu-gray>
                        <div class="max-w-7xl mx-auto px-4 py-4 space-y-1" style="max-width: 80rem; margin: 0 auto; padding: 16px;">
                            <a class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" style="display: block; padding: 12px 16px; font-size: 16px; font-weight: 500; color: #374151; border-radius: 12px; text-decoration: none;" href="#home">Home</a>
                            <a class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" style="display: block; padding: 12px 16px; font-size: 16px; font-weight: 500; color: #374151; border-radius: 12px; text-decoration: none;" href="#features">Features</a>
                            <a class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" style="display: block; padding: 12px 16px; font-size: 16px; font-weight: 500; color: #374151; border-radius: 12px; text-decoration: none;" href="#pricing">Pricing</a>
                            <a class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" style="display: block; padding: 12px 16px; font-size: 16px; font-weight: 500; color: #374151; border-radius: 12px; text-decoration: none;" href="#about">About</a>
                            <a class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" style="display: block; padding: 12px 16px; font-size: 16px; font-weight: 500; color: #374151; border-radius: 12px; text-decoration: none;" href="#contact">Contact</a>
                            <div class="pt-4 border-t border-gray-200 mt-4" style="padding-top: 16px; border-top: 1px solid #e5e7eb; margin-top: 16px;">
                                <a class="block w-full text-center px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white font-semibold rounded-xl transition-all" style="display: block; width: 100%; text-align: center; padding: 12px 16px; background: linear-gradient(to right, #1f2937, #374151); color: white; font-weight: 600; border-radius: 12px; text-decoration: none;" href="#signup">Get Started</a>
                            </div>
                        </div>
                    </div>
                </header>
                <!-- Spacer for fixed navbar -->
                <div style="height: 80px;"></div>
            `}),e.add("hero-section",{label:"Hero Section",category:"Sections",content:`
                <section class="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div class="z-10">
                      <div class="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold bg-orange-500/10 text-orange-500 ring-1 ring-inset ring-orange-500/20 mb-8">
                        ✨ New: Tracking Joy V3 is Live!
                      </div>
                      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1] font-display">
                        Track with Joy, <span class="text-green-500">Live with Peace</span>
                      </h1>
                      <p class="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                        Keep what you love close. Experience real-time freedom with the world's most vibrant and reliable GPS tracking community.
                      </p>
                      <div class="flex flex-col sm:flex-row gap-5">
                        <button class="bg-orange-500 text-white px-10 py-5 rounded-full font-extrabold text-xl hover:scale-105 transition-all">
                          Unlock Your Freedom
                        </button>
                        <button class="border-2 border-slate-200 bg-white text-slate-700 px-10 py-5 rounded-full font-extrabold text-xl hover:bg-slate-50 transition-all">
                          See the Magic
                        </button>
                      </div>
                    </div>
                    <div class="relative lg:h-[600px] flex items-center justify-center">
                      <img src="https://picsum.photos/seed/map/800/800" class="rounded-3xl shadow-2xl rotate-2 border-8 border-white" alt="Map" />
                    </div>
                  </div>
                </div>
              </section>
            `}),e.add("hero-gps-tracking-indonesia",{label:"Hero GPS Tracking ID",category:"Sections",content:`
                <section style="position: relative; min-height: 100vh; overflow: hidden; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);">
                    <!-- Animated Background Elements -->
                    <div style="position: absolute; inset: 0; overflow: hidden;">
                        <!-- Grid Pattern -->
                        <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px); background-size: 60px 60px;"></div>
                        
                        <!-- Floating Orbs -->
                        <div style="position: absolute; top: 80px; left: 40px; width: 288px; height: 288px; background: rgba(59,130,246,0.2); border-radius: 50%; filter: blur(100px);"></div>
                        <div style="position: absolute; bottom: 80px; right: 40px; width: 384px; height: 384px; background: rgba(34,211,238,0.2); border-radius: 50%; filter: blur(120px);"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: rgba(99,102,241,0.1); border-radius: 50%; filter: blur(150px);"></div>
                        
                        <!-- Animated Lines -->
                        <div style="position: absolute; top: 0; left: 25%; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.2), transparent);"></div>
                        <div style="position: absolute; top: 0; right: 25%; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(34,211,238,0.2), transparent);"></div>
                    </div>

                    <div style="position: relative; max-width: 80rem; margin: 0 auto; padding: 80px 24px 60px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;">
                            <!-- Left Content -->
                            <div style="text-align: left; position: relative; z-index: 10;">
                                <!-- Badge -->
                                <div style="display: inline-flex; align-items: center; gap: 8px; border-radius: 9999px; padding: 6px 14px; font-size: 13px; font-weight: 600; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); margin-bottom: 24px; backdrop-filter: blur(4px);">
                                    <span style="position: relative; display: flex; height: 8px; width: 8px;">
                                        <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #4ade80; opacity: 0.75;"></span>
                                        <span style="position: relative; display: inline-flex; border-radius: 50%; height: 8px; width: 8px; background: #22c55e;"></span>
                                    </span>
                                    🇮🇩 Solusi GPS Tracking #1 di Indonesia
                                </div>

                                <!-- Headline -->
                                <h1 style="font-size: 3.5rem; font-weight: 800; letter-spacing: -0.025em; color: white; margin-bottom: 20px; line-height: 1.15;">
                                    Pantau Aset Anda
                                    <span style="display: block; background: linear-gradient(to right, #60a5fa, #22d3ee, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                        Kapan Saja, Dimana Saja
                                    </span>
                                </h1>

                                <!-- Description -->
                                <p style="font-size: 1.125rem; color: #94a3b8; margin-bottom: 32px; max-width: 520px; line-height: 1.7;">
                                    Lindungi kendaraan, armada, dan aset berharga Anda dengan teknologi GPS tracking real-time terdepan.
                                    <span style="color: white; font-weight: 500;"> Akurat, handal, dan terpercaya.</span>
                                </p>

                                <!-- CTA Buttons -->
                                <div style="display: flex; flex-direction: row; gap: 12px; align-items: center; margin-bottom: 40px;">
                                    <a href="#" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; box-shadow: 0 8px 30px rgba(59,130,246,0.3); transition: all 0.3s; border: none;">
                                        <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        Mulai Tracking
                                        <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </a>
                                    <a href="#" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.08); backdrop-filter: blur(4px); color: white; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; border: 1px solid rgba(255,255,255,0.15); text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 18px; height: 18px; color: #60a5fa;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                        Lihat Demo
                                    </a>
                                </div>

                                <!-- Trust Indicators -->
                                <div style="display: flex; flex-direction: row; align-items: center; gap: 24px; font-size: 14px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="display: flex;">
                                            <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; margin-right: -8px; object-fit: cover;" src="https://i.pravatar.cc/100?img=1" alt="User">
                                            <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; margin-right: -8px; object-fit: cover;" src="https://i.pravatar.cc/100?img=2" alt="User">
                                            <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; margin-right: -8px; object-fit: cover;" src="https://i.pravatar.cc/100?img=3" alt="User">
                                            <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; object-fit: cover;" src="https://i.pravatar.cc/100?img=4" alt="User">
                                        </div>
                                        <span style="color: #94a3b8;">
                                            <span style="color: white; font-weight: 600;">10,000+</span> Pengguna
                                        </span>
                                    </div>
                                    <div style="width: 1px; height: 24px; background: #334155;"></div>
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        <span style="color: #94a3b8; margin-left: 4px;">4.9/5</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Interactive Map Preview -->
                            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                                <!-- Glow Effect -->
                                <div style="position: absolute; inset: -20px; background: linear-gradient(to right, rgba(59,130,246,0.15), rgba(34,211,238,0.15)); filter: blur(60px); border-radius: 50%;"></div>
                                
                                <!-- Main Card -->
                                <div style="position: relative; width: 100%; max-width: 480px;">
                                    <!-- Map Container -->
                                    <div style="position: relative; border-radius: 20px; background: rgba(30,41,59,0.6); backdrop-filter: blur(16px); border: 1px solid rgba(51,65,85,0.5); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); aspect-ratio: 1;">
                                        <!-- Fake Map Background -->
                                        <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #1e293b, #0f172a);">
                                            <!-- Map Grid -->
                                            <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px); background-size: 30px 30px;"></div>
                                        </div>

                                        <!-- Tracking Points -->
                                        <div style="position: absolute; top: 25%; left: 25%;">
                                            <div style="position: relative;">
                                                <div style="width: 14px; height: 14px; background: #22c55e; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
                                            </div>
                                            <div style="position: absolute; top: 20px; left: 20px; background: rgba(15,23,42,0.95); backdrop-filter: blur(4px); border-radius: 8px; padding: 8px 12px; font-size: 11px; color: white; border: 1px solid #334155; white-space: nowrap;">
                                                <div style="font-weight: 600; color: #4ade80;">Truk A - B 1234 XY</div>
                                                <div style="color: #94a3b8;">Jakarta → Surabaya</div>
                                            </div>
                                        </div>

                                        <div style="position: absolute; top: 50%; right: 25%;">
                                            <div style="position: relative;">
                                                <div style="width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
                                            </div>
                                            <div style="position: absolute; top: 20px; left: -70px; background: rgba(15,23,42,0.95); backdrop-filter: blur(4px); border-radius: 8px; padding: 8px 12px; font-size: 11px; color: white; border: 1px solid #334155; white-space: nowrap;">
                                                <div style="font-weight: 600; color: #60a5fa;">Motor B - D 5678 AB</div>
                                                <div style="color: #94a3b8;">Bandung • 45 km/h</div>
                                            </div>
                                        </div>

                                        <div style="position: absolute; bottom: 35%; left: 50%;">
                                            <div style="width: 14px; height: 14px; background: #06b6d4; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
                                        </div>

                                        <!-- Status Bar -->
                                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15,23,42,0.9); backdrop-filter: blur(4px); border-top: 1px solid rgba(51,65,85,0.5); padding: 14px 16px;">
                                            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">
                                                <div style="display: flex; align-items: center; gap: 16px;">
                                                    <div style="display: flex; align-items: center; gap: 6px;">
                                                        <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                                                        <span style="color: #94a3b8;">Online: <span style="color: white; font-weight: 600;">127</span></span>
                                                    </div>
                                                    <div style="display: flex; align-items: center; gap: 6px;">
                                                        <div style="width: 8px; height: 8px; background: #eab308; border-radius: 50%;"></div>
                                                        <span style="color: #94a3b8;">Idle: <span style="color: white; font-weight: 600;">23</span></span>
                                                    </div>
                                                </div>
                                                <div style="color: #94a3b8;">
                                                    <span style="color: #22d3ee; font-family: monospace; font-size: 12px;">● Real-time</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Floating Stats Cards -->
                                    <div style="position: absolute; top: -12px; right: -12px; background: rgba(30,41,59,0.95); backdrop-filter: blur(16px); border-radius: 14px; padding: 14px; border: 1px solid rgba(51,65,85,0.5); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.4);">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #22c55e, #10b981); display: flex; align-items: center; justify-content: center;">
                                                <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <div style="font-size: 1.25rem; font-weight: 700; color: white;">99.9%</div>
                                                <div style="font-size: 11px; color: #94a3b8;">Uptime</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style="position: absolute; bottom: -12px; left: -12px; background: rgba(30,41,59,0.95); backdrop-filter: blur(16px); border-radius: 14px; padding: 14px; border: 1px solid rgba(51,65,85,0.5); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.4);">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center;">
                                                <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <div style="font-size: 1.25rem; font-weight: 700; color: white;">&lt;1 dtk</div>
                                                <div style="font-size: 11px; color: #94a3b8;">Update</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom Features Strip -->
                        <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(30,41,59,0.8);">
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg style="width: 22px; height: 22px; color: #60a5fa;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div style="color: white; font-weight: 600; font-size: 14px;">Real-time Tracking</div>
                                        <div style="font-size: 12px; color: #64748b;">Lokasi akurat 24/7</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34,211,238,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg style="width: 22px; height: 22px; color: #22d3ee;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div style="color: white; font-weight: 600; font-size: 14px;">Laporan Lengkap</div>
                                        <div style="font-size: 12px; color: #64748b;">Riwayat perjalanan</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34,197,94,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg style="width: 22px; height: 22px; color: #4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div style="color: white; font-weight: 600; font-size: 14px;">Notifikasi Instan</div>
                                        <div style="font-size: 12px; color: #64748b;">Alert SMS & App</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(168,85,247,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg style="width: 22px; height: 22px; color: #c084fc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div style="color: white; font-weight: 600; font-size: 14px;">Keamanan Terjamin</div>
                                        <div style="font-size: 12px; color: #64748b;">Enkripsi end-to-end</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Scroll Indicator -->
                    <div style="position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <span style="font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.1em;">Scroll</span>
                        <svg style="width: 18px; height: 18px; color: #475569;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </div>
                </section>
            `}),e.add("feature-cards",{label:"Feature Cards",category:"Sections",content:`
                <section class="py-16 bg-gray-50">
                    <div class="container mx-auto px-4">
                        <h2 class="text-3xl font-bold text-center mb-12">Our Features</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Fast Performance</h3>
                                <p class="text-gray-600">Lightning-fast loading times for the best user experience.</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Easy to Use</h3>
                                <p class="text-gray-600">Intuitive drag-and-drop interface for everyone.</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Responsive Design</h3>
                                <p class="text-gray-600">Looks great on all devices and screen sizes.</p>
                            </div>
                        </div>
                    </div>
                </section>
            `}),e.add("cta-section",{label:"CTA Section",category:"Sections",content:`
                <section class="bg-blue-600 py-16">
                    <div class="container mx-auto px-4 text-center">
                        <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                        <p class="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of satisfied customers who have transformed their online presence.</p>
                        <a href="#" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">Start Free Trial</a>
                    </div>
                </section>
            `}),e.add("social-proof-logo-bar",{label:"Social Proof / Logo Bar",category:"Sections",content:`
                <section style="padding: 48px 0; background: linear-gradient(to bottom, #f8fafc, #ffffff);">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <p style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">
                                Trusted by Industry Leaders
                            </p>
                            <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">
                                Join 10,000+ Companies Worldwide
                            </h2>
                        </div>
                        
                        <!-- Logo Grid -->
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 32px; align-items: center; justify-items: center;">
                            <!-- Logo 1 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <rect x="0" y="8" width="40" height="24" rx="4"/>
                                    <text x="48" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Acme</text>
                                </svg>
                            </div>
                            
                            <!-- Logo 2 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <circle cx="20" cy="20" r="16"/>
                                    <text x="44" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Globe</text>
                                </svg>
                            </div>
                            
                            <!-- Logo 3 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <polygon points="20,4 36,36 4,36"/>
                                    <text x="44" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Apex</text>
                                </svg>
                            </div>
                            
                            <!-- Logo 4 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <rect x="4" y="4" width="32" height="32" rx="8" transform="rotate(45 20 20)"/>
                                    <text x="44" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Cube</text>
                                </svg>
                            </div>
                            
                            <!-- Logo 5 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <path d="M4 20 L20 4 L36 20 L20 36 Z"/>
                                    <text x="44" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Prism</text>
                                </svg>
                            </div>
                            
                            <!-- Logo 6 -->
                            <div style="display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%);">
                                <svg style="height: 32px; width: auto;" viewBox="0 0 120 40" fill="#64748b">
                                    <ellipse cx="20" cy="20" rx="18" ry="12"/>
                                    <text x="44" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b">Orbit</text>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Stats Row -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 48px; padding-top: 40px; border-top: 1px solid #e2e8f0;">
                            <div style="text-align: center;">
                                <div style="font-size: 36px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">10K+</div>
                                <div style="font-size: 14px; color: #64748b; font-weight: 500;">Active Users</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 36px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">99.9%</div>
                                <div style="font-size: 14px; color: #64748b; font-weight: 500;">Uptime SLA</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 36px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">50M+</div>
                                <div style="font-size: 14px; color: #64748b; font-weight: 500;">Data Points</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 36px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">24/7</div>
                                <div style="font-size: 14px; color: #64748b; font-weight: 500;">Support</div>
                            </div>
                        </div>
                    </div>
                </section>
            `}),e.add("social-proof-logo-bar-dark",{label:"Logo Bar (Dark)",category:"Sections",content:`
                <section style="padding: 64px 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 48px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                                <svg style="width: 16px; height: 16px; color: #60a5fa;" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                                <span style="font-size: 13px; font-weight: 600; color: #60a5fa;">Trusted Worldwide</span>
                            </div>
                            <h2 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0;">
                                Powering the World's Best Teams
                            </h2>
                            <p style="font-size: 16px; color: #94a3b8; margin: 0;">
                                From startups to Fortune 500 companies
                            </p>
                        </div>
                        
                        <!-- Logo Carousel Container -->
                        <div style="position: relative; overflow: hidden; padding: 24px 0;">
                            <!-- Gradient Overlays -->
                            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 100px; background: linear-gradient(to right, #0f172a, transparent); z-index: 10;"></div>
                            <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 100px; background: linear-gradient(to left, #0f172a, transparent); z-index: 10;"></div>
                            
                            <!-- Logo Row -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 64px; flex-wrap: wrap;">
                                <!-- Logo 1 -->
                                <div style="display: flex; align-items: center; gap: 10px; opacity: 0.7;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 700; color: white;">TechCorp</span>
                                </div>
                                
                                <!-- Logo 2 -->
                                <div style="display: flex; align-items: center; gap: 10px; opacity: 0.7;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 700; color: white;">SecureNet</span>
                                </div>
                                
                                <!-- Logo 3 -->
                                <div style="display: flex; align-items: center; gap: 10px; opacity: 0.7;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 700; color: white;">FastFlow</span>
                                </div>
                                
                                <!-- Logo 4 -->
                                <div style="display: flex; align-items: center; gap: 10px; opacity: 0.7;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ec4899, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/>
                                            <path d="M12 6a6 6 0 106 6 6 6 0 00-6-6zm0 10a4 4 0 114-4 4 4 0 01-4 4z"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 700; color: white;">CircleAI</span>
                                </div>
                                
                                <!-- Logo 5 -->
                                <div style="display: flex; align-items: center; gap: 10px; opacity: 0.7;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 700; color: white;">CubeData</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Testimonial Quote -->
                        <div style="margin-top: 48px; text-align: center; max-width: 640px; margin-left: auto; margin-right: auto;">
                            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px;">
                                <svg style="width: 32px; height: 32px; color: #3b82f6; margin-bottom: 16px;" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                </svg>
                                <p style="font-size: 18px; color: #e2e8f0; font-style: italic; line-height: 1.7; margin: 0 0 20px 0;">
                                    "This platform has transformed how we manage our fleet. The real-time tracking and analytics have saved us countless hours and significantly reduced operational costs."
                                </p>
                                <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                                    <img src="https://i.pravatar.cc/48?img=12" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid #3b82f6;">
                                    <div style="text-align: left;">
                                        <div style="font-weight: 600; color: white;">Sarah Johnson</div>
                                        <div style="font-size: 14px; color: #94a3b8;">Operations Director, TechCorp</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `}),e.add("social-proof-minimal",{label:"Logo Bar (Minimal)",category:"Sections",content:`
                <section style="padding: 32px 0; background: #ffffff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
                            <span style="font-size: 13px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">As seen on:</span>
                            
                            <!-- Logo placeholders with company names -->
                            <div style="display: flex; align-items: center; gap: 32px; margin-left: 16px;">
                                <span style="font-size: 20px; font-weight: 700; color: #cbd5e1; letter-spacing: -0.025em;">Forbes</span>
                                <span style="font-size: 20px; font-weight: 700; color: #cbd5e1; letter-spacing: -0.025em;">TechCrunch</span>
                                <span style="font-size: 20px; font-weight: 700; color: #cbd5e1; letter-spacing: -0.025em;">Wired</span>
                                <span style="font-size: 20px; font-weight: 700; color: #cbd5e1; letter-spacing: -0.025em;">Bloomberg</span>
                                <span style="font-size: 20px; font-weight: 700; color: #cbd5e1; letter-spacing: -0.025em;">Reuters</span>
                            </div>
                        </div>
                    </div>
                </section>
            `}),e.add("benefits-features",{label:"Benefits & Features (The Why)",category:"Sections",content:`
                <section style="padding: 80px 0; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <!-- Section Header -->
                        <div style="text-align: center; margin-bottom: 64px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                                <svg style="width: 16px; height: 16px; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                                <span style="font-size: 13px; font-weight: 600; color: #3b82f6;">Why Choose Us</span>
                            </div>
                            <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.2;">
                                Everything You Need to
                                <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Succeed</span>
                            </h2>
                            <p style="font-size: 18px; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.7;">
                                Discover the powerful features and benefits that make our solution the perfect choice for your business.
                            </p>
                        </div>

                        <!-- Features Grid -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 64px;">
                            <!-- Feature 1 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Lightning Fast</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Experience blazing-fast performance with our optimized infrastructure. Load times under 100ms guaranteed.
                                </p>
                            </div>

                            <!-- Feature 2 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Bank-Level Security</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Your data is protected with enterprise-grade encryption and security protocols. SOC 2 Type II certified.
                                </p>
                            </div>

                            <!-- Feature 3 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Flexible & Scalable</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Grow without limits. Our platform scales automatically to handle millions of requests seamlessly.
                                </p>
                            </div>

                            <!-- Feature 4 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Advanced Analytics</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Get deep insights with real-time analytics and customizable dashboards. Make data-driven decisions.
                                </p>
                            </div>

                            <!-- Feature 5 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #ec4899, #db2777); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Team Collaboration</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Work together seamlessly with built-in collaboration tools. Real-time sync across all team members.
                                </p>
                            </div>

                            <!-- Feature 6 -->
                            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; transition: all 0.3s;">
                                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">24/7 Support</h3>
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">
                                    Our dedicated support team is always here to help. Average response time under 5 minutes.
                                </p>
                            </div>
                        </div>

                        <!-- Bottom CTA -->
                        <div style="text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; padding: 48px; position: relative; overflow: hidden;">
                            <!-- Background decoration -->
                            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; filter: blur(60px);"></div>
                            <div style="position: absolute; bottom: -50px; left: -50px; width: 200px; height: 200px; background: rgba(139, 92, 246, 0.1); border-radius: 50%; filter: blur(60px);"></div>
                            
                            <div style="position: relative; z-index: 1;">
                                <h3 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 12px 0;">Ready to Get Started?</h3>
                                <p style="font-size: 16px; color: #94a3b8; margin: 0 0 24px 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                                    Join thousands of satisfied customers who have transformed their business with our platform.
                                </p>
                                <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3);">
                                        Start Free Trial
                                        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                        </svg>
                                    </a>
                                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(4px); color: white; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.2);">
                                        Schedule Demo
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `}),e.add("how-it-works",{label:"How It Works (The Process)",category:"Sections",content:`
                <section style="padding: 80px 0; background: #ffffff;">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <!-- Section Header -->
                        <div style="text-align: center; margin-bottom: 64px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                                <svg style="width: 16px; height: 16px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                </svg>
                                <span style="font-size: 13px; font-weight: 600; color: #10b981;">Simple Process</span>
                            </div>
                            <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.2;">
                                How It Works
                            </h2>
                            <p style="font-size: 18px; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.7;">
                                Get started in minutes with our simple 4-step process. No technical expertise required.
                            </p>
                        </div>

                        <!-- Steps Container -->
                        <div style="position: relative;">
                            <!-- Connection Line (Desktop) -->
                            <div style="position: absolute; top: 60px; left: 12.5%; right: 12.5%; height: 2px; background: linear-gradient(to right, #e2e8f0, #3b82f6, #8b5cf6, #10b981, #e2e8f0); z-index: 0;"></div>

                            <!-- Steps Grid -->
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; position: relative; z-index: 1;">
                                <!-- Step 1 -->
                                <div style="text-align: center;">
                                    <div style="position: relative; margin-bottom: 24px;">
                                        <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #bfdbfe; box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.3);">
                                            <svg style="width: 48px; height: 48px; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                            </svg>
                                        </div>
                                        <div style="position: absolute; top: -8px; right: calc(50% - 60px); width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">1</div>
                                    </div>
                                    <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Create Account</h3>
                                    <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                                        Sign up in seconds with your email or social accounts. No credit card required.
                                    </p>
                                </div>

                                <!-- Step 2 -->
                                <div style="text-align: center;">
                                    <div style="position: relative; margin-bottom: 24px;">
                                        <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #c4b5fd; box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.3);">
                                            <svg style="width: 48px; height: 48px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                        </div>
                                        <div style="position: absolute; top: -8px; right: calc(50% - 60px); width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);">2</div>
                                    </div>
                                    <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Configure Settings</h3>
                                    <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                                        Customize your preferences and connect your existing tools in just a few clicks.
                                    </p>
                                </div>

                                <!-- Step 3 -->
                                <div style="text-align: center;">
                                    <div style="position: relative; margin-bottom: 24px;">
                                        <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #fdf4ff, #fae8ff); border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #f0abfc; box-shadow: 0 10px 40px -10px rgba(236, 72, 153, 0.3);">
                                            <svg style="width: 48px; height: 48px; color: #ec4899;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                            </svg>
                                        </div>
                                        <div style="position: absolute; top: -8px; right: calc(50% - 60px); width: 32px; height: 32px; background: linear-gradient(135deg, #ec4899, #db2777); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">3</div>
                                    </div>
                                    <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Import Data</h3>
                                    <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                                        Easily import your existing data or start fresh. We support all major formats.
                                    </p>
                                </div>

                                <!-- Step 4 -->
                                <div style="text-align: center;">
                                    <div style="position: relative; margin-bottom: 24px;">
                                        <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #6ee7b7; box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.3);">
                                            <svg style="width: 48px; height: 48px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                            </svg>
                                        </div>
                                        <div style="position: absolute; top: -8px; right: calc(50% - 60px); width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">4</div>
                                    </div>
                                    <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Start Growing</h3>
                                    <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                                        You're all set! Start using the platform and watch your business grow.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom Info Cards -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px;">
                            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; padding: 24px; display: flex; align-items: start; gap: 16px;">
                                <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                                    <svg style="width: 24px; height: 24px; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Quick Setup</h4>
                                    <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">Get started in under 5 minutes with our guided onboarding.</p>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; padding: 24px; display: flex; align-items: start; gap: 16px;">
                                <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                                    <svg style="width: 24px; height: 24px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">24/7 Support</h4>
                                    <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">Our team is always available to help you succeed.</p>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; padding: 24px; display: flex; align-items: start; gap: 16px;">
                                <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                                    <svg style="width: 24px; height: 24px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">No Risk</h4>
                                    <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">Free trial with no credit card. Cancel anytime.</p>
                                </div>
                            </div>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin-top: 48px;">
                            <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; text-decoration: none; box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.5);">
                                Get Started Now
                                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                </svg>
                            </a>
                            <p style="font-size: 14px; color: #94a3b8; margin-top: 12px;">No credit card required • Free 14-day trial</p>
                        </div>
                    </div>
                </section>
            `}),e.add("footer",{label:"Footer",category:"Sections",content:`
                <footer class="bg-gray-900 text-gray-300 py-12">
                    <div class="container mx-auto px-4">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 class="text-white font-bold text-lg mb-4">Company</h3>
                                <ul class="space-y-2">
                                    <li><a href="#" class="hover:text-white transition">About Us</a></li>
                                    <li><a href="#" class="hover:text-white transition">Careers</a></li>
                                    <li><a href="#" class="hover:text-white transition">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 class="text-white font-bold text-lg mb-4">Products</h3>
                                <ul class="space-y-2">
                                    <li><a href="#" class="hover:text-white transition">Features</a></li>
                                    <li><a href="#" class="hover:text-white transition">Pricing</a></li>
                                    <li><a href="#" class="hover:text-white transition">Templates</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 class="text-white font-bold text-lg mb-4">Resources</h3>
                                <ul class="space-y-2">
                                    <li><a href="#" class="hover:text-white transition">Documentation</a></li>
                                    <li><a href="#" class="hover:text-white transition">Blog</a></li>
                                    <li><a href="#" class="hover:text-white transition">Support</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 class="text-white font-bold text-lg mb-4">Legal</h3>
                                <ul class="space-y-2">
                                    <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
                                    <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p>&copy; 2024 Your Company. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            `}),e.add("footer-dynamic",{label:"Footer (Dynamic)",category:"Sections",content:`
                <footer style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #94a3b8; padding: 64px 0 32px;">
                    <div style="max-width: 80rem; margin: 0 auto; padding: 0 24px;">
                        <!-- Top Section -->
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px;">
                            <!-- Brand Column -->
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                    <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <svg style="width: 24px; height: 24px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                        </svg>
                                    </div>
                                    <span style="font-size: 22px; font-weight: 700; color: white;">{{setting:general.site_name}}</span>
                                </div>
                                <p style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 24px; max-width: 320px;">
                                    {{setting:general.site_description}}
                                </p>
                                <!-- Social Links -->
                                <div style="display: flex; gap: 12px;">
                                    <a href="{{setting:social.facebook}}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                    <a href="{{setting:social.instagram}}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                    </a>
                                    <a href="{{setting:social.twitter}}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                    <a href="{{setting:social.youtube}}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                    <a href="{{setting:social.linkedin}}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; text-decoration: none; transition: all 0.3s;">
                                        <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </a>
                                </div>
                            </div>
                            
                            <!-- Quick Links -->
                            <div>
                                <h4 style="font-size: 14px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">Company</h4>
                                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">About Us</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Careers</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Press</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Blog</a></li>
                                </ul>
                            </div>
                            
                            <!-- Products -->
                            <div>
                                <h4 style="font-size: 14px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">Products</h4>
                                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Features</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Pricing</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Templates</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Integrations</a></li>
                                </ul>
                            </div>
                            
                            <!-- Support -->
                            <div>
                                <h4 style="font-size: 14px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">Support</h4>
                                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Help Center</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Documentation</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">API Reference</a></li>
                                    <li><a href="#" style="color: #94a3b8; text-decoration: none; font-size: 15px; transition: color 0.3s;">Status</a></li>
                                </ul>
                            </div>
                            
                            <!-- Contact -->
                            <div>
                                <h4 style="font-size: 14px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">Contact</h4>
                                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                                    <li style="display: flex; align-items: start; gap: 10px; color: #94a3b8; font-size: 15px;">
                                        <svg style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span>{{setting:site.address}}</span>
                                    </li>
                                    <li style="display: flex; align-items: center; gap: 10px;">
                                        <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                        </svg>
                                        <a href="tel:{{setting:site.phone}}" style="color: #94a3b8; text-decoration: none; font-size: 15px;">{{setting:site.phone}}</a>
                                    </li>
                                    <li style="display: flex; align-items: center; gap: 10px;">
                                        <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        <a href="mailto:{{setting:site.contact_email}}" style="color: #94a3b8; text-decoration: none; font-size: 15px;">{{setting:site.contact_email}}</a>
                                    </li>
                                    <li style="display: flex; align-items: center; gap: 10px;">
                                        <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span style="color: #94a3b8; font-size: 15px;">{{setting:site.working_hours}}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Bottom Section -->
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                            <p style="font-size: 14px; color: #64748b; margin: 0;">
                                {{setting:site.copyright}}
                            </p>
                            <div style="display: flex; align-items: center; gap: 24px;">
                                <a href="#" style="font-size: 14px; color: #64748b; text-decoration: none; transition: color 0.3s;">Privacy Policy</a>
                                <a href="#" style="font-size: 14px; color: #64748b; text-decoration: none; transition: color 0.3s;">Terms of Service</a>
                                <a href="#" style="font-size: 14px; color: #64748b; text-decoration: none; transition: color 0.3s;">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </footer>
            `}),e.add("carousel-component",{label:"Carousel",category:"Components",content:`
                <div data-gjs-type="carousel-component" class="carousel-wrapper" style="width: 100%; padding: 20px 0;">
                    <Carousel slug="test-carousel" />
                </div>
            `,attributes:{class:"fa fa-images"}}),i.DomComponents.addType("carousel-component",{isComponent:r=>r.tagName==="DIV"&&r.classList.contains("carousel-wrapper"),model:{defaults:{tagName:"div",droppable:!1,attributes:{class:"carousel-wrapper"},traits:[{type:"text",name:"slug",label:"Carousel Slug",placeholder:"Enter carousel slug"}]},init(){this.on("change:attributes:slug",this.updateCarouselSlug)},updateCarouselSlug(){const y=`<Carousel slug="${this.getAttributes().slug||"test-carousel"}" />`;this.components(y)}},view:{onRender(){const r=this.model.getAttributes().slug||"test-carousel";this.el.innerHTML=`
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 40px; text-align: center; color: white; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <svg style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.9;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Carousel Component</div>
                            <div style="font-size: 14px; opacity: 0.8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 6px;">
                                &lt;Carousel slug="${r}" /&gt;
                            </div>
                            <div style="font-size: 12px; margin-top: 12px; opacity: 0.7;">
                                This carousel will be rendered dynamically on the frontend
                            </div>
                        </div>
                    `}}}),b(i),()=>{i.destroy()}},[o]),a.useEffect(()=>{if(!n)return;const i=setInterval(()=>{s()},3e4);return()=>clearInterval(i)},[n,s]),a.useEffect(()=>{const i=e=>{(e.ctrlKey||e.metaKey)&&e.key==="s"&&(e.preventDefault(),s())};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[s]);const u=()=>{w.patch(l("pages.update",o.id),{is_published:!o.is_published},{preserveScroll:!0})};return t.jsxs(t.Fragment,{children:[t.jsx(m,{title:`Edit: ${o.title}`}),t.jsxs("div",{className:"h-screen flex flex-col",children:[t.jsxs("div",{className:"bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 flex items-center justify-between shadow-lg",children:[t.jsxs("div",{className:"flex items-center gap-4",children:[t.jsxs(x,{href:l("pages.index"),className:"text-indigo-200 hover:text-white transition flex items-center gap-2",children:[t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),"Back to Pages"]}),t.jsx("span",{className:"text-indigo-400",children:"|"}),t.jsx("span",{className:"font-medium",children:o.title})]}),t.jsx("div",{className:"panel__devices flex items-center gap-2"}),t.jsxs("div",{className:"flex items-center gap-4",children:[g&&t.jsxs("span",{className:"text-indigo-200 text-sm",children:["Last saved: ",g.toLocaleTimeString()]}),t.jsx("button",{onClick:s,disabled:p,className:"bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 border border-white/20",children:p?"Saving...":"Save"}),t.jsx("button",{onClick:u,className:`px-4 py-1.5 rounded-lg text-sm font-medium transition ${o.is_published?"bg-yellow-500 hover:bg-yellow-600 text-white":"bg-green-500 hover:bg-green-600 text-white"}`,children:o.is_published?"Unpublish":"Publish"}),t.jsx(x,{href:l("pages.show",o.id),target:"_blank",className:"bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium transition border border-white/20",children:"Preview"})]})]}),t.jsx("div",{className:"flex-1 overflow-hidden",children:t.jsx("div",{ref:d,className:"h-full"})})]}),t.jsx("style",{children:`
                .gjs-one-bg {
                    background-color: #1f2937;
                }
                .gjs-two-color {
                    color: #9ca3af;
                }
                .gjs-three-bg {
                    background-color: #374151;
                }
                .gjs-four-color,
                .gjs-four-color-h:hover {
                    color: #818cf8;
                }
                .gjs-pn-btn {
                    border-radius: 6px;
                }
                .gjs-pn-btn.gjs-pn-active {
                    background-color: #6366f1;
                    color: white;
                }
                .gjs-block {
                    border-radius: 6px;
                    padding: 10px;
                }
                .gjs-block:hover {
                    box-shadow: 0 0 0 2px #6366f1;
                }
                .gjs-cv-canvas {
                    background-color: #e5e7eb;
                }
            `})]})}export{M as default};
