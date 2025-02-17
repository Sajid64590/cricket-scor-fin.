
import { useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Camera as CameraIcon } from "lucide-react";

interface CameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function Camera({ onCapture, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [flashlight, setFlashlight] = useState(false);

  const toggleFlashlight = useCallback(async () => {
    try {
      const track = webcamRef.current?.video?.srcObject
        ?.getTracks()
        .find(track => track.kind === 'video');
      
      if (track) {
        // @ts-ignore - torch is not in type definitions but works on mobile
        await track.applyConstraints({
          advanced: [{ torch: !flashlight }]
        });
        setFlashlight(!flashlight);
      }
    } catch (err) {
      console.error('Flashlight not supported:', err);
    }
  }, [flashlight]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <Card className="fixed inset-0 z-50 bg-background">
      <CardContent className="h-full flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFlashlight}
            className="bg-black/20"
          >
            {flashlight ? "🔦" : "⚡️"}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative w-full max-w-md aspect-square">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover rounded-lg"
            videoConstraints={{
              facingMode: { exact: "environment" },
              width: { ideal: 1080 },
              height: { ideal: 1080 },
              aspectRatio: 1
            }}
          />
          {/* Guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-3/4 h-3/4 border-2 border-white/50 rounded">
              {/* Vertical guide */}
              <div className="absolute left-[15%] w-[10%] top-0 bottom-0 border-2 border-white/30" />
              {/* Horizontal guide */}
              <div className="absolute left-[15%] right-0 h-[10%] bottom-[15%] border-2 border-white/30" />
            </div>
          </div>
        </div>

        <Button 
          className="mt-4"
          onClick={capture}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Capture Image
        </Button>
      </CardContent>
    </Card>
  );
}
