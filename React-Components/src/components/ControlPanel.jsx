import React, { useContext, useState } from "react";
import { CameraContext } from "./CameraContext";
import {
  Input,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "./ui";
import {
  CalendarIcon,
  MapPinIcon,
  CameraIcon,
  PlayCircleIcon,
  FolderOpenIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";

const ControlPanel = () => {
  const {
    startRecording,
    stopRecording,
    captureImage,
    importImage,
  } = useContext(CameraContext);

  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState(null); // State for "from" date
  const [toDate, setToDate] = useState(null); // State for "to" date

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setIsVisible((prev) => !prev);
  };

  const handleSnap = () => {
    captureImage(); // Capture the image
    stopRecording(); // Stop recording the video

    // Trigger the download automatically
    const canvas = document.getElementById("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "captured-image.png"; // Automatically download the image
    link.click(); // Trigger the download
  };

  const handleImport = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Images",
            accept: { "image/*": [".png", ".jpg", ".jpeg"] },
          },
        ],
        multiple: false,
      });

      const file = await fileHandle.getFile();
      const image = URL.createObjectURL(file);
      importImage(image);
    } catch (error) {
      console.error("Error importing file:", error);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        size="icon"
        variant="outline"
        className="fixed bottom-4 left-4 z-20 p-2 bg-white shadow-lg rounded-full"
        onClick={handleToggle}
      >
        {isOpen ? <XIcon className="h-6 w-6 text-black" /> : <MenuIcon className="h-6 w-6 text-black" />}
        <span className="sr-only">Toggle Control Panel</span>
      </Button>

      {/* Control Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 w-full sm:w-[60%] max-w-lg bg-background  border rounded-lg shadow-lg p-3 space-y-4 z-10">
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" onClick={startRecording}>
              <PlayCircleIcon className="h-4 w-4" />
              <span className="sr-only">Record</span>
            </Button>
            <Button size="icon" variant="outline" onClick={handleSnap}>
              <CameraIcon className="h-4 w-4" />
              <span className="sr-only">Snap</span>
            </Button>
            <Button size="icon" variant="outline" onClick={handleImport}>
              <FolderOpenIcon className="h-4 w-4" />
              <span className="sr-only">Import</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="mag" className="text-sm font-medium">Mag</label>
              <Select>
                <SelectTrigger id="mag">
                  <SelectValue placeholder="Select magnification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10x</SelectItem>
                  <SelectItem value="1000">1000x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <div className="flex">
                <Input id="location" placeholder="Enter location" className="rounded-r-none" />
                <Button size="icon" variant="outline" className="rounded-l-none border-l-0">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="sr-only">Set location</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="from-date" className="text-sm font-medium">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="from-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <label htmlFor="to-date" className="text-sm font-medium">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="to-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;