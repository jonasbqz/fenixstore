"use client";

type FloatingWhatsappButtonProps = {
  whatsappNumber: string;
  groupUrl: string;
};

export default function FloatingWhatsappButton({
  whatsappNumber,
  groupUrl,
}: FloatingWhatsappButtonProps) {
  const message = "Hola Fénix Store, vengo desde la web y necesito ayuda o quiero solicitar intermediación.";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5">
      {/* Botón flotante del grupo de WhatsApp oficial */}
      <a
        href={groupUrl}
        target="_blank"
        rel="noreferrer"
        title="Unirse al Grupo Oficial de WhatsApp"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_0_20px_rgba(37,211,102,0.45)] hover:scale-105 transition-transform duration-200 cursor-pointer animate-pulse-gold"
      >
        <svg className="h-6.5 w-6.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.122.992 11.5.992c-5.437 0-9.861 4.371-9.865 9.8.001 2.012.528 3.983 1.529 5.708L2.17 19.86l3.52-.922c1.72 1.05 3.328 1.446 4.957 1.446z" />
        </svg>
      </a>
    </div>
  );
}
