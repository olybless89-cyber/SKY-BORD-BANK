import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Building2, Landmark } from 'lucide-react';

const slides = [
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/1e7c7e936899120f0e3d60c43b0e99d4-5577b32e-7d4a-45a4-b85a-048468d25a6f.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH4PFkipx42LY5QmKbqHcP4Mk_rgzsCqoOIm-lPe-jkf0Kc1SNuInhvBMUZSPG_lx05Em6Ombu_Hj7jjC6rnSorGyipCzR3kJT9Jmkuw0p164pXHJ0ydD6l33yNPKa1rS6eRQdwVOnHBnN0nPP-yRcADK5_QBtJwkUr87FgSvDi7eXYxs4HKwIRSiJ8Mnrg7vSpNq61vSvwb5-X69qrXieNDyasqOrdLCznr9qysy6rThoSI394zzPJZ_uhWSjkByU4CYy1IiCNTFpuzbF6-RYgIdek-5xCh0qWkM5Ig_SyXUgEZGwn9CgFMAE&x-kcdn-pid=112781&Expires=1789359423&Signature=ywOyJJEaMds7f1YRJYsDzjchkvgcl05O2tao8S6MkgQ6H2Iq1W7EUoXH6957B4tEeTmOtEeDBhXms8KD-IH9nk0d0337HBq~Hx30Y3P6MiAdClDEKHD64ulP4HeOD71~T6rC~lX6jmDk78jpyv2OYdpzcblOvI-Npo4UJTVxnDmWPyE~VcCLMmr5719sTjZuQpbmGD3hLoH7kuIYOXsB6SqpkhS-l2gsGZ9GVyCOLESDB4nA~kIMRHcFhnPhVLuOaZrBJrEs6mw2pWPV6tF7UGRtzilQ0wE0Fiy~pogck3McRkW6qZnIMIjBPn6A~dTvcdc-qxzXEnoqNwxBxnRg6A__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Grand Banking Hall',
    caption: 'Our flagship marble-clad halls bear the NovaCrest name above every entrance — a promise of excellence.',
    tag: 'Banking Halls',
    icon: Landmark,
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/f54226cfe5bb324849fe96b14704bb4d-f55e04dc-c400-4f90-b2d4-cfe43f629301.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAFjjLJn8s9mMIA2ykCaHV7Yz5uT93A3H0hpkX9WaGl5hBk6iGnbKUg32CN-ZGwicfUH6YTug5ztivPQy9pLFAT-4mCk0SxslFQx00lCs9TKMQ5gl4XEBnmtazEs6efLDaUPjkf8Te2RddzoN7XrNF9INCG1TpE4SAL7TtjyJUGVQTDzx-t87Gf5BwL0jiNSFEdxm_fK_7YSVTLK1mNXg9fxuzXk9FXIBAKRiZeeIUJHOxoSbgFFnrpiqTZzapT733K7iU3CIiBWRp5-S1Qc0FdgvkuWfc1kLgiKqmWPcx5HP0RfSUYq5CgFMAE&x-kcdn-pid=112781&Expires=1789359474&Signature=VMjOY1B7qHHWkav-kEpt5ktH2ZZUAxBcaxi2WlioDC34gO1ZMiLThRL18OItdB1cRngUD~tg9lHZh0MrttBX6JzSFiT6j779tILTDsRIV5clG21YL0EGNGuCVRyUDLFwXNJlpgq4valn5LUreT2-XsFccM9K7FKIpFQ697X~QnhOrlB8Qo2pXD12F88YclJ7Flal-OiGx67YTIOKZHnS3~7U0Ur4qOPC4yyj0dUI5XAluxZq9p3~hR5sCYly70A5DHHpdyFdsQNu3BFr8sMlsmoIPp7I4VYxdbDbgNgDpymDCoHZF4tNIti2ieZvLMEu1pPKHckRRyIBAYgrtp5rGQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Banking Lobby',
    caption: 'Our customer service halls display the NovaCrest brand proudly — where every client feels at home.',
    tag: 'Banking Halls',
    icon: Landmark,
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/519c839d9729900b3fa1a7d3673cf921-a3ac2c0f-2a88-4233-a9bc-dda86d27755a.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAEIpPbnyeFWFPjoyhj8FGDt6U2T0GjBaoyg0KgUyr7xCw3N6fMCCqVzzl5Jdm0P1lOcpoH112DrkCA20Voc3gsLXNCG1EAO_1hPIi4lK9uT2KJIYkjLEmnPmtKv5BO7oHGN9K6F9V4RsG6e9Q6D8_wAdIIOUMXJ6jaSlDQMeKg9tsYZPJCLQw62VANw4OS9_Zty0nk_sIdi7pMWSKSHPugYA3MJiTbpq9_CWnleHZaGFRoSLL46pEJbTw3u2hySdPDYoj5mIiAXDwGJjq4i-JX3qQ5tkI3NtRIXHAZRQFychMb_RSK3digFMAE&x-kcdn-pid=112781&Expires=1789359449&Signature=UFuaZcADJj5wsLY6V1fsRPMYYpoOSlXF2BecVjucgVemkSyoicf7ZXArsVAPVYFAdyMgQkIVXz8xeOYbXJEFe-iKFM2aHyTbaNE5G0iUJSQO~EIqmTBZRzNtayn3PlHYCcTx0GR0-OEsge2cWUSbURKt6t6OdnBlqrgtIiHB3TSFVIFSM4XDUl8BB-BZZ8BCBBM8RxGTQnwQI18jhZ0IEhz1KJv7CCWDVBt-jdGRUdvoePkXnGe70i2dOEoTUafU9InhjmDV0Cw7VKImH78WEpBT7Gxc8s5-Sk2jEe1kubh-aB2R1Y7z3QF28XWyXOsEmWZv6V6zT6pDb3TB-WNeQQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Global HQ',
    caption: 'Our modern glass tower bears "NOVACREST BANK" on its facade — a beacon of trust in every city.',
    tag: 'Our Buildings',
    icon: Building2,
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/ad92b0b4a418f2918cda5da292242b80-5d7d8e13-689a-47db-869c-6f3557d16e9f.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAHOimzSz9eudgvZak77jqDFbOsbD1yuk5zR34olvg5V2xZjxcFLoUq_KI48G16OD9FkLvwEsyJbv2BBWb7HmzuwYoxpC2pgV_y2OJ4tyqZj8gYQ1mrxMfFXhgBk13at4ZRMVyP-XkaSPCoL3fwYn1R2RCH_2rBYctlhcXzCRzxX0F1TsQHnmfj7fOF14PpC07gwUccta8TC3pXMhOL_w6D5ou7yIcqdHPJn2PMkvFYe7xoSnEyggwjlEmAabESg8cJCaRyFIiAHb4_2ENCTPH1hwTcK2yVFsVNlSC4c2xfw7mgFocAu3igFMAE&x-kcdn-pid=112781&Expires=1789359532&Signature=uXGssrkGb6l2clETipfXjuwR8RlN1Rhip915ABzx7GtkjJFj2qAZKhDxZUZHoW4Nde4LqNx2IJd7pFTU~FYSpyuK0jtrzbsJsDlRIV5clG21YL0EGNGuCVRyUDLFwXNJlpgq4valn5LUreT2-XsFccM9K7FKIpFQ697X~QnhOrlB8Qo2pXD12F88YclJ7Flal-OiGx67YTIOKZHnS3~7U0Ur4qOPC4yyj0dUI5XAluxZq9p3~hR5sCYly70A5DHHpdyFdsQNu3BFr8sMlsmoIPp7I4VYxdbDbgNgDpymDCoHZF4tNIti2ieZvLMEu1pPKHckRRyIBAYgrtp5rGQ__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Heritage Building',
    caption: 'Where classical architecture meets modern banking — NOVACREST carved above our landmark entrance.',
    tag: 'Our Buildings',
    icon: Building2,
  },
  {
    img: 'https://s15-kling-fdl.klingai.com/bs2/upload-ylab-stunt-sgp/muse/789245962363084811/IMAGE/20260815/748868e43563d61161e341edcb70ef2e-059b6137-249f-408a-b45a-fb08ef61cd05.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAHjwMTv_UK1oZ0uoGC8-6y6XplWBx8s1HYnM4AZIW6rxFLs4WtrfB_-pDG0ZyQywLRVHU94lhawQsvs1d10s60v4WCAeSm4JRy3VKV0B4u5YC-kwdhNj8-ukli99M5-GTwhruqw-v5XyxYrNRg3FdJvzjBonPe5vAevcCQ4BAnQxoZ95x6xtVnDMTlcrJMw_BmhxKCw4-6X60iZekGYjCiDbi8lq0d2n0Gf-Ycpv5dRvRoSyfxirU_pcpSwYh-JFVmDEt6gIiAv54lK4Z6IzbjnEn3BYu7WMj5txpyI9DMbKdUdmQ4vwSgFMAE&x-kcdn-pid=112781&Expires=1789359508&Signature=UJ7UhsvHx2aZi~Oqx8-t1yJTKLMRSOBUdx83W6RkrfzbnGbQ-S0bBRp1luPtK5imAHA7zs7X-QIfQsMSHBDP6Nd8aJTafDeUoEbqpvNiT8kp~T0YxxsCzHjlLxV-qx1KCe0JUibK1oZSKCtMmca0GOKujqNrIiySIUzAS~xEUaFWLXRVAFl6VpCwsZUx5CXTjQ6yTWMBw~ciJ2SuYxTWpeCbDX9Lfi-dQOrsqk1xkQB0~C6I-6NWDDvS-H1jJoOzfNg7xgXjoipwGcTSwm5N749huMWptEKeGTXWa5KgPocNGgYm0FLJnWxVugRyV3urwJZpVxv7LaRcD~sMCOdUyw__&Key-Pair-Id=K1FG4T7LWJK0FU',
    label: 'NovaCrest Tower — Night',
    caption: 'The glowing NOVACREST sign atop our city tower shines 24/7 — because your finances never sleep.',
    tag: 'Our Buildings',
    icon: Building2,
  },
];

export function BankingSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section className="banking-slider-section py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="banking-slider-tag inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-3">
            Our Spaces
          </span>
          <h2 className="banking-slider-heading font-heading text-3xl font-extrabold tracking-tight md:text-4xl text-balance">
            Where Tradition Meets Innovation
          </h2>
          <p className="banking-slider-sub mx-auto mt-3 max-w-2xl text-base text-pretty">
            Step inside NovaCrest — from grand banking halls to iconic headquarters buildings
            — all built to serve you with excellence.
          </p>
        </div>

        {/* Main slider */}
        <div
          className="banking-slider-frame relative overflow-hidden rounded-3xl shadow-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Images */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.04, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.97, x: -40 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full"
            >
              <img
                src={slide.img}
                alt={slide.label}
                className="w-full object-cover banking-slider-img"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 banking-slider-overlay" />

              {/* Caption */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
              >
                <span className="banking-slider-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                  <slide.icon className="h-3.5 w-3.5" />
                  {slide.tag}
                </span>
                <h3 className="banking-slider-caption-title font-heading text-xl md:text-2xl font-bold text-white">
                  {slide.label}
                </h3>
                <p className="banking-slider-caption-body mt-1 max-w-xl text-sm leading-relaxed text-white/80">
                  {slide.caption}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next buttons */}
          <button
            onClick={() => { prev(); setPaused(true); }}
            aria-label="Previous slide"
            className="banking-slider-arrow absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => { next(); setPaused(true); }}
            aria-label="Next slide"
            className="banking-slider-arrow absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] banking-slider-progress-bg">
            {!paused && (
              <motion.div
                key={current}
                className="h-full banking-slider-progress-bar"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
              />
            )}
          </div>
        </div>

        {/* Thumbnail dots + counter */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPaused(true); }}
              aria-label={`Go to slide ${i + 1}`}
              className="relative overflow-hidden rounded-xl transition-all duration-300"
              style={{
                width: i === current ? 72 : 48,
                height: 40,
              }}
            >
              <img
                src={s.img}
                alt={s.label}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: i === current ? 1 : 0.45 }}
              />
              {i === current && (
                <div className="absolute inset-0 rounded-xl banking-slider-thumb-active-ring" />
              )}
            </button>
          ))}

          <span className="banking-slider-counter ml-4 text-sm font-semibold tabular-nums">
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}
