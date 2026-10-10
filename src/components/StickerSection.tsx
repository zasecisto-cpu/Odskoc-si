import React from 'react';

export const StickerSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-12 sm:py-16 px-5 sm:px-8 border-b-2 border-[#14294B] text-left">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Left: Uploaded sticker image */}
        <div className="md:col-span-5 flex justify-center md:justify-start">
          <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <picture>
              <source srcSet="/odskoc-si-nalepka.webp" type="image/webp" />
              <img
                src="/odskoc-si-nalepka.png"
                alt="Nálepka Odskoč si na dveřích podniku"
                className="w-full max-w-[360px] rounded-[16px] shadow-xl block"
              />
            </picture>
          </div>
        </div>

        {/* Right: Heading and description */}
        <div className="md:col-span-7 space-y-3 sm:space-y-4">
          <h2 className="font-['Archivo',sans-serif] font-[900] text-[28px] sm:text-[38px] text-[#14294B] leading-[1.05] tracking-[-0.5px]">
            Až uvidíte tuhle nálepku, můžete dovnitř.
          </h2>
          <p className="font-['Archivo',sans-serif] text-[18px] sm:text-[20px] text-slate-700 leading-[1.5]">
            Vstup je zdarma, nemusíte si nic kupovat ani se ptát.
          </p>
        </div>
      </div>
    </section>
  );
};
