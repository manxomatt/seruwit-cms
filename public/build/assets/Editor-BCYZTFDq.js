import{r as s,f as v,j as e,H as f,L as x,a as y}from"./app-D4JjWWuD.js";import{_ as k,g,a as b}from"./index-DduPutC4.js";/* empty css            */function M({page:a}){const n=s.useRef(null),[l,h]=s.useState(null),[d,p]=s.useState(!1),[c,u]=s.useState(null),o=s.useCallback(async()=>{if(l){p(!0);try{const t=l.getHtml(),i=l.getCss(),r=l.getProjectData();await v.patch(route("module.pages.save-content",a.id),{html:t,css:i,gjs_data:r}),u(new Date)}catch(t){console.error("Failed to save:",t)}finally{p(!1)}}},[l,a.id]);s.useEffect(()=>{if(!n.current)return;const t=k.init({container:n.current,height:"100%",width:"auto",storageManager:!1,plugins:[g,b],pluginsOpts:{[g]:{blocks:["column1","column2","column3","column3-7","text","link","image","video","map"],flexGrid:!0},[b]:{blocksBasicOpts:!0,navbarOpts:!0,countdownOpts:!0,formsOpts:!0}},canvas:{styles:["https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css","/builder/css/custom-builder.css",'href="//https://fonts.bunny.net',"https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap","https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"],scripts:[],frameStyle:`
                    html, body {
                        background-color: #fff;
                        margin: 0;
                        padding: 0;
                        min-height: 100%;
                        height: auto !important;
                    }
                    * { box-sizing: border-box; }
                    body > * { margin: 0; }
                `},deviceManager:{devices:[{name:"Desktop",width:""},{name:"Tablet",width:"768px",widthMedia:"992px"},{name:"Mobile",width:"320px",widthMedia:"480px"}]},panels:{defaults:[{id:"panel-devices",el:".panel__devices",buttons:[{id:"device-desktop",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/></svg>',command:"set-device-desktop",active:!0,togglable:!1},{id:"device-tablet",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"/></svg>',command:"set-device-tablet",togglable:!1},{id:"device-mobile",label:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/></svg>',command:"set-device-mobile",togglable:!1}]}]}});t.Commands.add("set-device-desktop",{run:r=>r.setDevice("Desktop")}),t.Commands.add("set-device-tablet",{run:r=>r.setDevice("Tablet")}),t.Commands.add("set-device-mobile",{run:r=>r.setDevice("Mobile")}),a.gjs_data?t.loadProjectData(a.gjs_data):a.html&&(t.setComponents(a.html),a.css&&t.setStyle(a.css));const i=t.BlockManager;return i.add("navbar-section",{label:"Navbar",category:"WelcomeLanding",content:`
<header class="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-4xl font-bold">explore</span>
        <span class="text-2xl font-black tracking-tight text-slate-900 font-display">Sky Track</span>
      </div>
      
      <nav class="hidden md:flex space-x-10">
        <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#features">Fitur</a>
        <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#resources">Sumber Daya</a>
        <a class="text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="#pricing">Harga</a>
      </nav>
      
      <div class="flex items-center gap-4 sm:gap-6">
        <a class="hidden sm:block text-base font-semibold text-slate-600 hover:text-primary transition-colors" href="/login">Masuk</a>
        <a href="https://app.sky-track.net/#register" target="_blank" rel="noopener noreferrer" class="bg-primary hover:bg-teal-800 text-white px-6 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 whitespace-nowrap">
          Daftar Sekarang
        </a>
        <button class="md:hidden p-2 text-slate-600">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Mobile Menu -->
  <div class="md:hidden bg-white border-b border-slate-100 p-4 space-y-4">
    <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#features">Fitur</a>
    <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#resources">Sumber Daya</a>
    <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="#pricing">Harga</a>
    <a class="block text-lg font-semibold text-slate-600 hover:text-primary" href="/login">Masuk</a>
  </div>
</header>
            `}),i.add("stats-section",{label:"Stats Section",category:"WelcomeLanding",content:`
<section class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-12 bg-background-soft rounded-[2.5rem] p-12 border border-slate-100 shadow-sm">
      <div class="text-center">
        <p class="text-3xl sm:text-4xl font-black text-primary font-display">99.9%</p>
        <p class="text-xs sm:text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Uptime Server</p>
      </div>
      <div class="text-center">
        <p class="text-3xl sm:text-4xl font-black text-primary font-display">120+</p>
        <p class="text-xs sm:text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Kota Terjangkau</p>
      </div>
      <div class="text-center">
        <p class="text-3xl sm:text-4xl font-black text-primary font-display">&lt;1 dtk</p>
        <p class="text-xs sm:text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Sinkronisasi Cepat</p>
      </div>
      <div class="text-center">
        <p class="text-3xl sm:text-4xl font-black text-primary font-display">24/7</p>
        <p class="text-xs sm:text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Siap Melayani</p>
      </div>
    </div>
  </div>
</section>
            `}),i.add("features-section",{label:"Features Section",category:"WelcomeLanding",content:`
<section class="py-32 bg-background-light" id="features">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-24">
      <h2 class="text-lg font-black text-accent uppercase tracking-widest mb-4">Fitur Unggulan</h2>
      <p class="text-4xl sm:text-5xl font-black text-slate-900 font-display mb-6">Semua yang Anda butuhkan untuk tetap terhubung</p>
      <p class="max-w-2xl mx-auto text-xl text-slate-500">Alat sederhana dan canggih yang dirancang untuk keluarga, pecinta hewan peliharaan, dan tim yang berkembang.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      <div class="group p-10 rounded-3xl bg-white border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
        <div class="mb-8 inline-block p-4 rounded-2xl transition-all transform group-hover:scale-110 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
          <span class="material-symbols-outlined text-4xl">my_location</span>
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-4 font-display">Tampilan Real-Time</h3>
        <p class="text-slate-500 text-lg leading-relaxed">Pantau pergerakan secara real-time dengan pembaruan setiap detik. Jangan lewatkan setiap momen dari aset berharga Anda.</p>
      </div>
      <div class="group p-10 rounded-3xl bg-white border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-accent/30">
        <div class="mb-8 inline-block p-4 rounded-2xl transition-all transform group-hover:scale-110 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white">
          <span class="material-symbols-outlined text-4xl">notifications_active</span>
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-4 font-display">Notifikasi Cerdas</h3>
        <p class="text-slate-500 text-lg leading-relaxed">Tetap terinformasi dengan notifikasi saat target tercapai atau batas wilayah dilanggar. Keamanan yang ramah pengguna.</p>
      </div>
      <div class="group p-10 rounded-3xl bg-white border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
        <div class="mb-8 inline-block p-4 rounded-2xl transition-all transform group-hover:scale-110 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
          <span class="material-symbols-outlined text-4xl">auto_graph</span>
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-4 font-display">Riwayat Perjalanan</h3>
        <p class="text-slate-500 text-lg leading-relaxed">Lihat kembali perjalanan terbaik Anda dengan ringkasan rute yang indah dan peta aktivitas yang menceritakan kisah Anda.</p>
      </div>
    </div>
  </div>
</section>
            `}),i.add("resources-section",{label:"Resources Section",category:"WelcomeLanding",content:`
<section class="py-24 bg-white" id="resources">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 mb-6">
        <span class="material-symbols-outlined text-lg">library_books</span>
        Sumber Daya
      </div>
      <h2 class="text-4xl sm:text-5xl font-black text-slate-900 mb-6 font-display">
        Semua yang Anda Butuhkan untuk 
        <span class="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Sukses
        </span>
      </h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Akses berbagai sumber daya untuk membantu Anda memaksimalkan penggunaan Sky Track. 
        Dari panduan pemula hingga dokumentasi teknis lengkap.
      </p>
    </div>

    <!-- Resources Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <!-- Resource 1 -->
      <div class="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
        <!-- Icon -->
        <div class="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-2xl text-blue-400">
            menu_book
          </span>
        </div>

        <!-- Content -->
        <h3 class="text-xl font-bold text-slate-900 mb-3 font-display">
          Panduan Pengguna
        </h3>
        <p class="text-slate-600 mb-6 leading-relaxed">
          Pelajari cara menggunakan Sky Track dari dasar hingga fitur lanjutan dengan panduan lengkap kami.
        </p>

        <!-- Link -->
        <a
          href="#"
          class="inline-flex items-center gap-2 font-semibold text-blue-400 hover:gap-3 transition-all duration-300"
        >
          Baca Panduan
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </a>

        <!-- Hover Effect -->
        <div class="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
      </div>

      <!-- Resource 2 -->
      <div class="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
        <!-- Icon -->
        <div class="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-2xl text-green-400">
            play_circle
          </span>
        </div>

        <!-- Content -->
        <h3 class="text-xl font-bold text-slate-900 mb-3 font-display">
          Video Tutorial
        </h3>
        <p class="text-slate-600 mb-6 leading-relaxed">
          Tonton video tutorial step-by-step untuk memaksimalkan penggunaan platform Sky Track.
        </p>

        <!-- Link -->
        <a
          href="#"
          class="inline-flex items-center gap-2 font-semibold text-green-400 hover:gap-3 transition-all duration-300"
        >
          Tonton Video
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </a>

        <!-- Hover Effect -->
        <div class="absolute inset-0 rounded-2xl bg-green-500/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
      </div>

      <!-- Resource 3 -->
      <div class="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
        <!-- Icon -->
        <div class="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-2xl text-purple-400">
            help_center
          </span>
        </div>

        <!-- Content -->
        <h3 class="text-xl font-bold text-slate-900 mb-3 font-display">
          Pusat Bantuan
        </h3>
        <p class="text-slate-600 mb-6 leading-relaxed">
          Temukan jawaban untuk pertanyaan umum dan solusi untuk masalah yang sering dihadapi.
        </p>

        <!-- Link -->
        <a
          href="#"
          class="inline-flex items-center gap-2 font-semibold text-purple-400 hover:gap-3 transition-all duration-300"
        >
          Cari Bantuan
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </a>

        <!-- Hover Effect -->
        <div class="absolute inset-0 rounded-2xl bg-purple-500/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
      </div>

      <!-- Resource 4 -->
      <div class="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
        <!-- Icon -->
        <div class="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-2xl text-red-400">
            support_agent
          </span>
        </div>

        <!-- Content -->
        <h3 class="text-xl font-bold text-slate-900 mb-3 font-display">
          Dukungan Teknis
        </h3>
        <p class="text-slate-600 mb-6 leading-relaxed">
          Tim support kami siap membantu Anda 24/7 untuk menyelesaikan masalah teknis.
        </p>

        <!-- Link -->
        <a
          href="#"
          class="inline-flex items-center gap-2 font-semibold text-red-400 hover:gap-3 transition-all duration-300"
        >
          Hubungi Support
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </a>

        <!-- Hover Effect -->
        <div class="absolute inset-0 rounded-2xl bg-red-500/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="mt-16 text-center">
      <div class="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-blue-500">contact_support</span>
          </div>
          <div class="text-left">
            <p class="font-bold text-slate-900">Butuh bantuan lebih lanjut?</p>
            <p class="text-sm text-slate-600">Tim kami siap membantu Anda</p>
          </div>
        </div>
        <a
          href="#"
          class="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          <span class="material-symbols-outlined">chat</span>
          Hubungi Kami
        </a>
      </div>
    </div>
  </div>
</section>
            `}),i.add("pricing-section",{label:"Pricing Section",category:"WelcomeLanding",content:`
<section class="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" id="pricing">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Main Trial Card -->
    <div class="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-12 md:p-16">
      <!-- Background Glow -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px]"></div>
      
      <div class="relative z-10 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 ring-1 ring-inset ring-cyan-500/30 mb-8">
          <span class="material-symbols-outlined text-lg">verified</span>
          Penawaran Terbatas
        </div>
        
        <!-- Headline -->
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 font-display leading-tight">
          Coba Gratis 
          <span class="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            14 Hari
          </span>
        </h2>
        
        <p class="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Rasakan semua fitur premium tanpa batasan. Tidak perlu kartu kredit, tidak ada komitmen. 
          Batalkan kapan saja.
        </p>
        
        <!-- Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <!-- Feature 1 -->
          <div class="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-white text-xl">devices</span>
            </div>
            <span class="text-white font-semibold text-left">Unlimited Perangkat</span>
          </div>
          
          <!-- Feature 2 -->
          <div class="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-white text-xl">speed</span>
            </div>
            <span class="text-white font-semibold text-left">Tracking Real-time</span>
          </div>
          
          <!-- Feature 3 -->
          <div class="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-white text-xl">history</span>
            </div>
            <span class="text-white font-semibold text-left">Riwayat Lengkap</span>
          </div>
          
          <!-- Feature 4 -->
          <div class="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-white text-xl">support_agent</span>
            </div>
            <span class="text-white font-semibold text-left">Dukungan 24/7</span>
          </div>
        </div>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="https://app.sky-track.net/#register" 
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-5 rounded-full font-black text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <span class="material-symbols-outlined">rocket_launch</span>
            Mulai Trial Gratis
            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
          <a 
            href="#features" 
            class="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <span class="material-symbols-outlined">info</span>
            Pelajari Lebih Lanjut
          </a>
        </div>
        
        <!-- Trust Indicators -->
        <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>Tanpa kartu kredit</span>
          </div>
          <div class="hidden sm:block w-px h-4 bg-slate-600"></div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>Setup dalam 5 menit</span>
          </div>
          <div class="hidden sm:block w-px h-4 bg-slate-600"></div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>Batalkan kapan saja</span>
          </div>
        </div>
        
        <!-- App Store Badges -->
        <div class="mt-12 pt-12 border-t border-white/10">
          <p class="text-slate-400 text-sm font-medium mb-6">Tersedia di</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <!-- Google Play Store -->
            <a 
              href="#" 
              class="group flex items-center gap-3 bg-black/50 hover:bg-black/70 border border-white/20 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" fill="white"/>
              </svg>
              <div class="text-left">
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Dapatkan di</p>
                <p class="text-white font-bold text-lg -mt-1">Google Play</p>
              </div>
            </a>
            
            <!-- Apple App Store -->
            <a 
              href="#" 
              class="group flex items-center gap-3 bg-black/50 hover:bg-black/70 border border-white/20 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div class="text-left">
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Unduh di</p>
                <p class="text-white font-bold text-lg -mt-1">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Stats -->
    <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <p class="text-3xl sm:text-4xl font-black text-white font-display">10,000+</p>
        <p class="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-wider">Pengguna Aktif</p>
      </div>
      <div>
        <p class="text-3xl sm:text-4xl font-black text-white font-display">4.9/5</p>
        <p class="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-wider">Rating Pengguna</p>
      </div>
      <div>
        <p class="text-3xl sm:text-4xl font-black text-white font-display">99.9%</p>
        <p class="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-wider">Uptime Server</p>
      </div>
      <div>
        <p class="text-3xl sm:text-4xl font-black text-white font-display">24/7</p>
        <p class="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-wider">Dukungan Teknis</p>
      </div>
    </div>
  </div>
</section>
            `}),i.add("cta-section",{label:"CTA Section",category:"WelcomeLanding",content:`
<section class="py-32 relative overflow-hidden">
  <div class="absolute inset-0 bg-primary/5"></div>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
    <h2 class="text-5xl font-black text-slate-900 mb-8 font-display">Siap Memulai Perjalanan Anda?</h2>
    <p class="text-2xl text-slate-600 mb-12 leading-relaxed">
      Bergabunglah dengan ribuan keluarga dan bisnis yang menemukan ketenangan pikiran dengan teknologi GPS kami yang canggih dan mudah digunakan.
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-6">
      <a href="https://app.sky-track.net/#register" target="_blank" rel="noopener noreferrer" class="bg-primary text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-all">
        Mulai Sekarang!
      </a>
      <button class="bg-white border-2 border-slate-200 text-slate-700 px-12 py-5 rounded-full font-black text-xl hover:bg-slate-50 transition-all">
        Hubungi Tim Kami
      </button>
    </div>
  </div>
</section>
            `}),i.add("footer-section",{label:"Footer Section",category:"WelcomeLanding",content:`
<footer class="bg-slate-900 text-white pt-24 pb-12 rounded-t-[3rem] mt-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
      <div class="col-span-2 lg:col-span-2">
        <div class="flex items-center gap-2 mb-8">
          <span class="material-symbols-outlined text-primary text-4xl">explore</span>
          <span class="text-3xl font-black tracking-tight font-display">Sky Track</span>
        </div>
        <p class="text-slate-400 text-lg max-w-sm leading-relaxed">
          The world's most vibrant GPS tracking platform. Making precision fun and security simple for everyone.
        </p>
      </div>
      
      <div>
        <h4 class="text-white font-black text-xl mb-6 font-display">Pelajari</h4>
        <ul class="space-y-4 text-base text-slate-400">
          <li><a class="hover:text-primary transition-colors" href="#">Panduan Memulai</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Dokumentasi API</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Pusat Bantuan</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Komunitas</a></li>
        </ul>
      </div>
      
      <div>
        <h4 class="text-white font-black text-xl mb-6 font-display">Kontak</h4>
        <ul class="space-y-4 text-base text-slate-400">
          <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">phone</span>+62 812 3456 7890</li>
          <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">mail</span><a class="hover:text-primary transition-colors" href="mailto:contact@sky-track.net">contact@sky-track.net</a></li>
          <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">schedule</span>Senin - Jumat: 9:00 - 18:00</li>
        </ul>
      </div>
      
      <div>
        <h4 class="text-white font-black text-xl mb-6 font-display">Legal</h4>
        <ul class="space-y-4 text-base text-slate-400">
          <li><a class="hover:text-primary transition-colors" href="#">Kebijakan Privasi</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Syarat & Ketentuan</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Kebijakan Cookie</a></li>
          <li><a class="hover:text-primary transition-colors" href="#">Keamanan</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-slate-800 pt-8 pb-8">
      <p class="text-slate-400 text-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">location_on</span>
        Jl. Techno No. 123, Jakarta Selatan 12345, Indonesia
      </p>
    </div>
    
    <div class="border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
      <p class="text-sm text-slate-500 font-medium">© ${new Date().getFullYear()} Sky Track. All rights reserved.</p>
      <div class="flex gap-8">
        <a class="text-slate-500 hover:text-primary transition-colors transform hover:scale-125" href="#">
          <span class="material-symbols-outlined text-2xl">favorite</span>
        </a>
        <a class="text-slate-500 hover:text-primary transition-colors transform hover:scale-125" href="#">
          <span class="material-symbols-outlined text-2xl">rocket_launch</span>
        </a>
        <a class="text-slate-500 hover:text-primary transition-colors transform hover:scale-125" href="#">
          <span class="material-symbols-outlined text-2xl">language</span>
        </a>
      </div>
    </div>
  </div>
</footer>
            `}),i.add("wl-hero",{label:"WL Hero",category:"WelcomeLanding",content:`
<section class="relative min-h-screen overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Grid Pattern -->
    <div class="absolute inset-0" style="background-image: linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px); background-size: 60px 60px;"></div>
    
    <!-- Floating Orbs -->
    <div class="absolute" style="top: 80px; left: 40px; width: 288px; height: 288px; background: rgba(59,130,246,0.2); border-radius: 50%; filter: blur(100px);"></div>
    <div class="absolute" style="bottom: 80px; right: 40px; width: 384px; height: 384px; background: rgba(34,211,238,0.2); border-radius: 50%; filter: blur(120px);"></div>
    <div class="absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: rgba(99,102,241,0.1); border-radius: 50%; filter: blur(150px);"></div>
    
    <!-- Animated Lines -->
    <div class="absolute" style="top: 0; left: 25%; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.2), transparent);"></div>
    <div class="absolute" style="top: 0; right: 25%; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(34,211,238,0.2), transparent);"></div>
  </div>

  <div class="relative" style="max-width: 80rem; margin: 0 auto; padding: 96px 16px 80px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;">
      <!-- Left Content -->
      <div style="text-align: left; position: relative; z-index: 10;">
        <!-- Badge -->
        <div style="display: inline-flex; align-items: center; gap: 8px; border-radius: 9999px; padding: 8px 16px; font-size: 14px; font-weight: 600; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); margin-bottom: 32px; backdrop-filter: blur(4px);">
          <span style="position: relative; display: flex; height: 8px; width: 8px;">
            <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #4ade80; opacity: 0.75;"></span>
            <span style="position: relative; display: inline-flex; border-radius: 50%; height: 8px; width: 8px; background: #22c55e;"></span>
          </span>
          🇮🇩 Solusi GPS Tracking #1 di Indonesia
        </div>

        <!-- Headline -->
        <h1 style="font-size: 4rem; font-weight: 900; letter-spacing: -0.025em; color: white; margin-bottom: 24px; line-height: 1.1;">
          Pantau Aset Anda 
          <span style="position: relative;">
            <span style="background: linear-gradient(to right, #60a5fa, #22d3ee, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              Kapan Saja
            </span>
            <svg style="position: absolute; bottom: -8px; left: 0; width: 100%;" viewBox="0 0 300 12" fill="none">
              <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient-hero)" stroke-width="3" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradient-hero" x1="0" y1="0" x2="300" y2="0">
                  <stop stop-color="#60A5FA"/>
                  <stop offset="0.5" stop-color="#22D3EE"/>
                  <stop offset="1" stop-color="#2DD4BF"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <br />
          <span style="color: #cbd5e1;">Dimana Saja</span>
        </h1>

        <!-- Description -->
        <p style="font-size: 1.25rem; color: #94a3b8; margin-bottom: 40px; max-width: 576px; line-height: 1.75;">
          Lindungi kendaraan, armada, dan aset berharga Anda dengan teknologi GPS tracking real-time terdepan. 
          <span style="color: white; font-weight: 500;"> Akurat, handal, dan terpercaya.</span>
        </p>

        <!-- CTA Buttons -->
        <div style="display: flex; flex-direction: row; justify-content: flex-start; gap: 16px; margin-bottom: 48px;">
          <a href="https://app.sky-track.net/#register" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(to right, #3b82f6, #06b6d4); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 18px; text-decoration: none; box-shadow: 0 10px 25px rgba(59,130,246,0.25);">
            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Mulai Tracking Sekarang
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a href="https://app.sky-track.net/#demo" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.05); backdrop-filter: blur(4px); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 18px; border: 1px solid rgba(255,255,255,0.1); text-decoration: none;">
            <svg style="width: 20px; height: 20px; color: #60a5fa;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Lihat Demo
          </a>
        </div>

        <!-- Trust Indicators -->
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 24px; font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="display: flex;">
              <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; background: #334155; margin-right: -8px;" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; background: #334155; margin-right: -8px;" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; background: #334155; margin-right: -8px;" src="https://i.pravatar.cc/100?img=3" alt="User" />
              <img style="height: 32px; width: 32px; border-radius: 50%; border: 2px solid #1e293b; background: #334155;" src="https://i.pravatar.cc/100?img=4" alt="User" />
            </div>
            <span style="color: #94a3b8;">
              <span style="color: white; font-weight: 600;">10,000+</span> Pengguna Aktif
            </span>
          </div>
          <div style="width: 1px; height: 24px; background: #334155;"></div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <svg style="width: 16px; height: 16px; color: #facc15;" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span style="color: #94a3b8; margin-left: 4px;">4.9/5 Rating</span>
          </div>
        </div>
        
        <!-- App Store Badges -->
        <div style="margin-top: 32px; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 12px;">
          <span style="color: #64748b; font-size: 14px; font-weight: 500;">Tersedia di:</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <!-- Google Play Store -->
            <a href="#" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 16px; text-decoration: none;">
              <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" fill="white"/>
              </svg>
              <div style="text-align: left;">
                <p style="font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; margin: 0;">Dapatkan di</p>
                <p style="color: white; font-weight: 700; font-size: 14px; line-height: 1.2; margin: 0;">Google Play</p>
              </div>
            </a>
            
            <!-- Apple App Store -->
            <a href="#" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 16px; text-decoration: none;">
              <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div style="text-align: left;">
                <p style="font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; margin: 0;">Unduh di</p>
                <p style="color: white; font-weight: 700; font-size: 14px; line-height: 1.2; margin: 0;">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Right Content - Interactive Map Preview -->
      <div style="position: relative; min-height: 600px; display: flex; align-items: center; justify-content: center;">
        <!-- Glow Effect -->
        <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(59,130,246,0.2), rgba(34,211,238,0.2)); filter: blur(80px); border-radius: 50%;"></div>
        
        <!-- Main Card -->
        <div style="position: relative; width: 100%; max-width: 500px; aspect-ratio: 1;">
          <!-- Map Container -->
          <div style="position: absolute; inset: 0; border-radius: 24px; background: rgba(30,41,59,0.5); backdrop-filter: blur(16px); border: 1px solid rgba(51,65,85,0.5); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <!-- Fake Map Background -->
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom right, #1e293b, #0f172a);">
              <!-- Map Grid -->
              <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px); background-size: 30px 30px;"></div>
              
              <!-- Indonesia Map Silhouette (simplified) -->
              <svg style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.1;" viewBox="0 0 400 300" fill="none">
                <path d="M50 150 Q100 120 150 140 T250 130 T350 150 Q380 160 350 180 T250 190 T150 180 T50 170 Z" fill="currentColor" style="color: #60a5fa;"/>
              </svg>
            </div>

            <!-- Tracking Points -->
            <div style="position: absolute; top: 25%; left: 25%;">
              <div style="position: relative;">
                <div style="width: 16px; height: 16px; background: #22c55e; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
              </div>
              <div style="position: absolute; top: 24px; left: 24px; background: rgba(15,23,42,0.9); backdrop-filter: blur(4px); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: white; border: 1px solid #334155; white-space: nowrap;">
                <div style="font-weight: 600; color: #4ade80;">Truk A - B 1234 XY</div>
                <div style="color: #94a3b8;">Jakarta → Surabaya</div>
              </div>
            </div>

            <div style="position: absolute; top: 50%; right: 25%;">
              <div style="position: relative;">
                <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
              </div>
              <div style="position: absolute; top: 24px; left: -80px; background: rgba(15,23,42,0.9); backdrop-filter: blur(4px); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: white; border: 1px solid #334155; white-space: nowrap;">
                <div style="font-weight: 600; color: #60a5fa;">Motor B - D 5678 AB</div>
                <div style="color: #94a3b8;">Bandung • 45 km/h</div>
              </div>
            </div>

            <div style="position: absolute; bottom: 33%; left: 50%;">
              <div style="position: relative;">
                <div style="width: 16px; height: 16px; background: #06b6d4; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
              </div>
            </div>

            <!-- Route Lines -->
            <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
              <defs>
                <linearGradient id="routeGradientHero" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#22C55E" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.8"/>
                </linearGradient>
              </defs>
              <path d="M100 100 Q200 80 250 200 T350 250" stroke="url(#routeGradientHero)" stroke-width="2" stroke-dasharray="8 4" fill="none"/>
            </svg>

            <!-- Status Bar -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15,23,42,0.8); backdrop-filter: blur(4px); border-top: 1px solid rgba(51,65,85,0.5); padding: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 14px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                    <span style="color: #94a3b8;">Online: <span style="color: white; font-weight: 600;">127</span></span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: #eab308; border-radius: 50%;"></div>
                    <span style="color: #94a3b8;">Idle: <span style="color: white; font-weight: 600;">23</span></span>
                  </div>
                </div>
                <div style="color: #94a3b8;">
                  Update: <span style="color: #22d3ee; font-family: monospace;">Real-time</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating Stats Cards -->
          <div style="position: absolute; top: -16px; right: -16px; background: rgba(30,41,59,0.9); backdrop-filter: blur(16px); border-radius: 16px; padding: 16px; border: 1px solid rgba(51,65,85,0.5); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(to bottom right, #22c55e, #10b981); display: flex; align-items: center; justify-content: center;">
                <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: 700; color: white;">99.9%</div>
                <div style="font-size: 12px; color: #94a3b8;">Uptime Server</div>
              </div>
            </div>
          </div>

          <div style="position: absolute; bottom: -16px; left: -16px; background: rgba(30,41,59,0.9); backdrop-filter: blur(16px); border-radius: 16px; padding: 16px; border: 1px solid rgba(51,65,85,0.5); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(to bottom right, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center;">
                <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: 700; color: white;">&lt;1 dtk</div>
                <div style="font-size: 12px; color: #94a3b8;">Update Interval</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Features Strip -->
    <div style="margin-top: 64px; padding-top: 32px; border-top: 1px solid #1e293b;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 24px; height: 24px; color: #60a5fa;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div style="color: white; font-weight: 600;">Real-time Tracking</div>
            <div style="font-size: 14px; color: #94a3b8;">Lokasi akurat 24/7</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34,211,238,0.1); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 24px; height: 24px; color: #22d3ee;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div style="color: white; font-weight: 600;">Laporan Lengkap</div>
            <div style="font-size: 14px; color: #94a3b8;">Riwayat perjalanan</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34,197,94,0.1); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 24px; height: 24px; color: #4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div style="color: white; font-weight: 600;">Notifikasi Instan</div>
            <div style="font-size: 14px; color: #94a3b8;">Alert via SMS & App</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(168,85,247,0.1); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 24px; height: 24px; color: #c084fc;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div style="color: white; font-weight: 600;">Keamanan Terjamin</div>
            <div style="font-size: 14px; color: #94a3b8;">Enkripsi data end-to-end</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <div style="position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em;">Scroll</span>
    <svg style="width: 20px; height: 20px; color: #64748b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</section>
            `}),h(t),()=>{t.destroy()}},[a]),s.useEffect(()=>{if(!l)return;const t=setInterval(()=>{o()},3e4);return()=>clearInterval(t)},[l,o]),s.useEffect(()=>{const t=i=>{(i.ctrlKey||i.metaKey)&&i.key==="s"&&(i.preventDefault(),o())};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[o]);const m=()=>{y.patch(route("module.pages.update",a.id),{is_published:!a.is_published},{preserveScroll:!0})};return e.jsxs(e.Fragment,{children:[e.jsx(f,{title:`Edit: ${a.title}`}),e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsxs("div",{className:"bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 flex items-center justify-between shadow-lg",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(x,{href:route("module.pages.index"),className:"text-indigo-200 hover:text-white transition flex items-center gap-2",children:[e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),"Back to Pages"]}),e.jsx("span",{className:"text-indigo-400",children:"|"}),e.jsx("span",{className:"font-medium",children:a.title})]}),e.jsx("div",{className:"panel__devices flex items-center gap-2"}),e.jsxs("div",{className:"flex items-center gap-4",children:[c&&e.jsxs("span",{className:"text-indigo-200 text-sm",children:["Last saved: ",c.toLocaleTimeString()]}),e.jsx("button",{onClick:o,disabled:d,className:"bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 border border-white/20",children:d?"Saving...":"Save"}),e.jsx("button",{onClick:m,className:`px-4 py-1.5 rounded-lg text-sm font-medium transition ${a.is_published?"bg-yellow-500 hover:bg-yellow-600 text-white":"bg-green-500 hover:bg-green-600 text-white"}`,children:a.is_published?"Unpublish":"Publish"}),e.jsx(x,{href:route("module.pages.show",a.id),target:"_blank",className:"bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium transition border border-white/20",children:"Preview"})]})]}),e.jsx("div",{className:"flex-1 overflow-hidden",children:e.jsx("div",{ref:n,className:"h-full"})})]}),e.jsx("style",{children:`
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
