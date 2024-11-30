import { useState } from 'react';
import { Input, Button, Calendar, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from './ui'
import { CalendarIcon, MapPinIcon, CameraIcon, PlayCircleIcon, FolderOpenIcon, MenuIcon, XIcon } from 'lucide-react';
import { format } from "date-fns";

const ControlPanel = ()=> {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [isVisible, setIsVisible] = useState(true);  // State to toggle visibility
  const [isOpen, setIsOpen] = useState(false); // State to toggle button (hamburger to X)

  const handleToggle = () => {
    setIsOpen(prev => !prev);  // Toggle hamburger-X state
    setIsVisible(prev => !prev); // Toggle control panel visibility
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button 
        size="icon" 
        variant="outline" 
        className="fixed bottom-4 left-4 z-20 p-2 bg-white shadow-lg rounded-full"
        onClick={handleToggle}  // Toggle visibility and button state
      >
        {/* Conditionally render hamburger or X icon */}
        {isOpen ? (
          <XIcon className="h-6 w-6 text-black" />
        ) : (
          <MenuIcon className="h-6 w-6 text-black" />
        )}
        <span className="sr-only">Toggle Control Panel</span>
      </Button>

      {/* Control Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 w-full sm:w-[60%] max-w-lg bg-background border rounded-lg shadow-lg p-3 space-y-4 z-10">
          <div className="flex space-x-2">
            <Button size="icon" variant="outline">
              <PlayCircleIcon className="h-4 w-4" />
              <span className="sr-only">Record</span>
            </Button>
            <Button size="icon" variant="outline">
              <CameraIcon className="h-4 w-4" />
              <span className="sr-only">Snap</span>
            </Button>
            <Button size="icon" variant="outline">
              <FolderOpenIcon className="h-4 w-4" />
              <span className="sr-only">Open</span>
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
}

export default ControlPanel;
