import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, TrendingUp, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const bgSlides = [
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/1e7c7e936899120f0e3d60c43b0e99d4-5577b32e-7d4a-45a4-b85a-048468d25a6f.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH4PFkipx42LY5QmKbqHcP4Mk_rgzsCqoOIm-lPe-jkf0Kc1SNuInhvBMUZSPG_lx05Em6Ombu_Hj7jjC6rnSorGyipCzR3kJT9Jmkuw0p164pXHJ0ydD6l33yNPKa1rS6eRQdwVOnHBnN0nPP-yRcADK5_QBtJwkUr87FgSvDi7eXYxs4HKwIRSiJ8Mnrg7vSpNq61vSvwb5-X69qrXieNDyasqOrdLCznr9qysy6rThoSI394zzPJZ_uhWSjkByU4CYy1IiCNTFpuzbF6-RYgIdek-5xCh0qWkM5Ig_SyXUgEZGwn9CgFMAE&x-kcdn-pid=112781&Expires=1789359423&Signature=ywOyJJEaMds7f1YRJYsDzjchkvgcl05O2tao8S6MkgQ6H2Iq1W7EUoXH6957B4tEeTmOtEeDBhXms8KD-IH9nk0d0337HBq~Hx30Y3P6MiAdClDEKHD64ulP4HeOD71~T6rC~lX6jmDk78jpyv2OYdpzcblOvI-Npo4UJTVxnDmWPyE~VcCLMmr5719sTjZuQpbmGD3hLoH7kuIYOXsB6SqpkhS-l2gsGZ9GVyCOLESDB4nA~kIMRHcFhnPhVLuOaZrBJrEs6mw2pWPV6tF7UGRtzilQ0wE0Fiy~pogck3McRkW6qZnIMIjBPn6A~dTvcdc-qxzXEnoqNwxBxnRg6A__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Grand Banking Hall',
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/f54226cfe5bb324849fe96b14704bb4d-f55e04dc-c400-4f90-b2d4-cfe43f629301.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAFjjLJn8s9mMIA2ykCaHV7Yz5uT93A3H0hpkX9WaGl5hBk6iGnbKUg32CN-ZGwicfUH6YTug5ztivPQy9pLFAT-4mCk0SxslFQx00lCs9TKMQ5gl4XEBnmtazEs6efLDaUPjkf8Te2RddzoN7XrNF9INCG1TpE4SAL7TtjyJUGVQTDzx-t87Gf5BwL0jiNSFEdxm_fK_7YSVTLK1mNXg9fxuzXk9FXIBAKRiZeeIUJHOxoSbgFFnrpiqTZzapT733K7iU3CIiBWRp5-S1Qc0FdgvkuWfc1kLgiKqmWPcx5HP0RfSUYq5CgFMAE&x-kcdn-pid=112781&Expires=1789359474&Signature=VMjOY1B7qHHWkav-kEpt5ktH2ZZUAxBcaxi2WlioDC34gO1ZMiLThRL18OItdB1cRngUD~tg9lHZh0MrttBX6JzSFiT6j779tILTDsRIV5clG21YL0EGNGuCVRyUDLFwXNJlpgq4valn5LUreT2-XsFccM9K7FKIpFQ697X~QnhOrlB8Qo2pXD12F88YclJ7Flal-OiGx67YTIOKZHnS3~7U0Ur4qOPC4yyj0dUI5XAluxZq9p3~hR5sCYly70A5DHHpdyFdsQNu3BFr8sMlsmoIPp7I4VYxdbDbgNgDpymDCoHZF4tNIti2ieZvLMEu1pPKHckRRyIBAYgrtp5rGQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Banking Lobby',
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/519c839d9729900b3fa1a7d3673cf921-a3ac2c0f-2a88-4233-a9bc-dda86d27755a.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAEIpPbnyeFWFPjoyhj8FGDt6U2T0GjBaoyg0KgUyr7xCw3N6fMCCqVzzl5Jdm0P1lOcpoH112DrkCA20Voc3gsLXNCG1EAO_1hPIi4lK9uT2KJIYkjLEmnPmtKv5BO7oHGN9K6F9V4RsG6e9Q6D8_wAdIIOUMXJ6jaSlDQMeKg9tsYZPJCLQw62VANw4OS9_Zty0nk_sIdi7pMWSKSHPugYA3MJiTbpq9_CWnleHZaGFRoSLL46pEJbTw3u2hySdPDYoj5mIiAXDwGJjq4i-JX3qQ5tkI3NtRIXHAZRQFychMb_RSK3digFMAE&x-kcdn-pid=112781&Expires=1789359449&Signature=UFuaZcADJj5wsLY6V1fsRPMYYpoOSlXF2BecVjucgVemkSyoicf7ZXArsVAPVYFAdyMgQkIVXz8xeOYbXJEFe-iKFM2aHyTbaNE5G0iUJSQO~EIqmTBZRzNtayn3PlHYCcTx0GR0-OEsge2cWUSbURKt6t6OdnBlqrgtIiHB3TSFVIFSM4XDUl8BB-BZZ8BCBBM8RxGTQnwQI18jhZ0IEhz1KJv7CCWDVBt-jdGRUdvoePkXnGe70i2dOEoTUafU9InhjmDV0Cw7VKImH78WEpBT7Gxc8s5-Sk2jEe1kubh-aB2R1Y7z3QF28XWyXOsEmWZv6V6zT6pDb3TB-WNeQQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Global HQ',
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/ad92b0b4a418f2918cda5da292242b80-5d7d8e13-689a-47db-869c-6f3557d16e9f.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAHOimzSz9eudgvZak77jqDFbOsbD1yuk5zR34olvg5V2xZjxcFLoUq_KI48G16OD9FkLvwEsyJbv2BBWb7HmzuwYoxpC2pgV_y2OJ4tyqZj8gYQ1mrxMfFXhgBk13at4ZRMVyP-XkaSPCoL3fwYn1R2RCH_2rBYctlhcXzCRzxX0F1TsQHnmfj7fOF14PpC07gwUccta8TC3pXMhOL_w6D5ou7yIcqdHPJn2PMkvFYe7xoSnEyggwjlEmAabESg8cJCaRyFIiAHb4_2ENCTPH1hwTcK2yVFsVNlSC4c2xfw7mgFocAu3igFMAE&x-kcdn-pid=112781&Expires=1789359532&Signature=uXGssrkGb6l2clETipfXjuwR8RlN1Rhip915ABzx7GtkjJFj2qAZKhDxZUZHoW4Nde4LqNx2IJd7pFTU~FYSpyuK0jtrzbsJsDlRIV5clG21YL0EGNGuCVRyUDLFwXNJlpgq4valn5LUreT2-XsFccM9K7FKIpFQ697X~QnhOrlB8Qo2pXD12F88YclJ7Flal-OiGx67YTIOKZHnS3~7U0Ur4qOPC4yyj0dUI5XAluxZq9p3~hR5sCYly70A5DHHpdyFdsQNu3BFr8sMlsmoIPp7I4VYxdbDbgNgDpymDCoHZF4tNIti2ieZvLMEu1pPKHckRRyIBAYgrtp5rGQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Heritage Building',
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/748868e43563d61161e341edcb70ef2e-059b6137-249f-408a-b45a-fb08ef61cd05.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAHjwMTv_UK1oZ0uoGC8-6y6XplWBx8s1HYnM4AZIW6rxFLs4WtrfB_-pDG0ZyQywLRVHU94lhawQsvs1d10s60v4WCAeSm4JRy3VKV0B4u5YC-kwdhNj8-ukli99M5-GTwhruqw-v5XyxYrNRg3FdJvzjBonPe5vAevcCQ4BAnQxoZ95x6xtVnDMTlcrJMw_BmhxKCw4-6X60iZekGYjCiDbi8lq0d2n0Gf-Ycpv5dRvRoSyfxirU_pcpSwYh-JFVmDEt6gIiAv54lK4Z6IzbjnEn3BYu7WMj5txpyI9DMbKdUdmQ4vwSgFMAE&x-kcdn-pid=112781&Expires=1789359508&Signature=UJ7UhsvHx2aZi~Oqx8-t1yJTKLMRSOBUdx83W6RkrfzbnGbQ-S0bBRp1luPtK5imAHA7zs7X-QIfQsMSHBDP6Nd8aJTafDeUoEbqpvNiT8kp~T0YxxsCzHjlLxV-qx1KCe0JUibK1oZSKCtMmca0GOKujqNrIiySIUzAS~xEUaFWLXRVAFl6VpCwsZUx5CXTjQ6yTWMBw~ciJ2SuYxTWpeCbDX9Lfi-dQOrsqk1xkQB0~C6I-6NWDDvS-H1jJoOzfNg7xgXjoipwGcTSwm5N749huMWptEKeGTXWa5KgPocNGgYm0FLJnWxVugRyV3urwJZpVxv7LaRcD~sMCOdUyw__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Tower — Night',
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = bgSlides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden min-h-screen flex items-center pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Sliding background images ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1] }}
          >
            <img
              src={bgSlides[current].img}
              alt={bgSlides[current].label}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay so text remains readable */}
        <div className="absolute inset-0 hero-bg-overlay" />
        {/* Bottom fade into white landing sections */}
        <div className="absolute bottom-0 left-0 right-0 h-32 hero-bg-fade" />
      </div>

      {/* ── Auto-advance progress bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[3px] bg-white/10">
        {!paused && (
          <motion.div
            key={current}
            className="h-full bg-white/70"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        )}
      </div>

      {/* ── Slide nav arrows ── */}
      <button
        onClick={() => { prev(); setPaused(true); }}
        aria-label="Previous slide"
        className="hero-arrow-btn absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => { next(); setPaused(true); }}
        aria-label="Next slide"
        className="hero-arrow-btn absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Slide dots ── */}
      <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
        {bgSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPaused(true); }}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background: i === current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* ── Foreground: Hero copy ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-20 md:px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-xs font-bold tracking-[0.25em] uppercase text-white/80"
        >
          Simple, Quick, Secured
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-white md:text-6xl lg:text-7xl text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
        >
          Transfer Money Across<br />
          The World{' '}
          <span className="hero-accent-text">In Real Time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-white/70 tracking-wide text-pretty"
        >
          Trusted by millions. Built for everyone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="/register"
            className="hero-cta-primary group inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-bold transition-all duration-200"
          >
            Online Banking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            className="hero-cta-outline inline-flex items-center gap-3 rounded-lg px-7 py-4 text-sm font-semibold transition-all duration-200"
          >
            <span className="hero-cta-play flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/70">
              <svg viewBox="0 0 16 16" fill="white" className="h-3 w-3 ml-0.5">
                <path d="M3 2.5l10 5.5-10 5.5V2.5z" />
              </svg>
            </span>
            Learn More
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { icon: ShieldCheck, label: 'FDIC Insured' },
            { icon: TrendingUp, label: 'Up to 4.50% APY' },
            { icon: CreditCard, label: 'Zero Fees' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <Icon className="h-3.5 w-3.5 text-white/60" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Current slide label */}
        <motion.p
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-xs font-medium tracking-widest uppercase text-white/40"
        >
          {bgSlides[current].label}
        </motion.p>
      </div>
    </section>
  );
}
