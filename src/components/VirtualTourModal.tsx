import { useState, useEffect } from "react";
import { X, RotateCcw, Maximize, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VirtualTourModalProps {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
  images: string[];
}

const VirtualTourModal = ({ open, onClose, propertyTitle, images }: VirtualTourModalProps) => {
  const [rotation, setRotation] = useState(0);
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.3) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [open]);

  const views = ["Salon", "Cuisine", "Chambre", "Salle de bain", "Terrasse"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {/* 3D Simulation area */}
        <div className="relative h-[500px] bg-foreground/95 overflow-hidden">
          {/* Panoramic simulation using images */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-full h-full relative"
              style={{
                perspective: "800px",
              }}
            >
              <img
                src={images[currentView % images.length]}
                alt="Vue 3D"
                className="w-full h-full object-cover transition-transform duration-100"
                style={{
                  transform: `rotateY(${rotation * 0.2}deg) scale(1.2)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>

          {/* Controls overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              <p className="font-display font-semibold text-sm">{propertyTitle}</p>
              <p className="text-xs opacity-80">Visite virtuelle 3D • {views[currentView]}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {views.map((v, i) => (
                  <button
                    key={v}
                    onClick={() => setCurrentView(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentView === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/40 text-white hover:bg-black/60"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setRotation(0)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* VR Badge */}
          <div className="absolute top-4 right-16 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold">
            <Eye className="h-3.5 w-3.5" /> VR
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualTourModal;
