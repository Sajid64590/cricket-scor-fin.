import "regenerator-runtime/runtime";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import type { GridData } from "@shared/schema";

const PREDEFINED_BATSMEN = [
  "MS Dhoni", "RG Sharma", "AB de Villiers", "YK Pathan", 
  "Ch Gayle", "S Dhawan", "SK Raina", "KD Karthik",
  "MK Pandey", "David Warner", "Virat Kohli", "AM Rahane",
  "V Sehwag", "Gautam Gambhir", "RV Uthappa", "PA Patel",
  "BB McCullum"
];

const PREDEFINED_BOWLERS = [
  "Sandeep", "A Mishra", "A Nehra", "DW Steyn",
  "P Kumar", "B Kumar", "PP Chawla", "RV Kumar",
  "DJ Bravo", "SL Malinga", "UT Yadav", "DS Kulkarni",
  "JD Unadkat", "R Ashwin", "Sr Watson", "M Morkel",
  "MM Sharma"
];

interface GridProps {
  data: GridData;
  onChange: (data: GridData) => void;
}

export function Grid({ data, onChange }: GridProps) {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [selectedCell, setSelectedCell] = useState<{ type: 'batsman' | 'bowler', index: number } | null>(null);

  const handleVoiceInput = async (type: 'batsman' | 'bowler', index: number) => {
    try {
      const nameList = type === 'batsman' ? PREDEFINED_BATSMEN : PREDEFINED_BOWLERS;
      const matchedName = nameList.find(name => 
        name.toLowerCase().includes(transcript.toLowerCase())
      );

      if (matchedName) {
        if (type === 'batsman') {
          updateBatsman(index, matchedName);
        } else {
          updateBowler(index, matchedName);
        }
        resetTranscript();
      }
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ language: 'en-IN' });
  };

  const DISMISSAL_DATA = {
    "Sandeep": ["MS Dhoni", "RG Sharma", "AB de Villiers", "YK Pathan", "Ch Gayle", "S Dhawan", "SK Raina"],
    "A Mishra": ["RG Sharma", "KD Karthik", "MK Pandey", "SK Raina", "David Warner", "S Dhawan", "Virat Kohli"],
    "A Nehra": ["AM Rahane", "KD Karthik", "RG Sharma", "V Sehwag", "G Gambhir", "Ch Gayle", "MS Dhoni"],
    "DW Steyn": ["BB McCullum", "AB de Villiers", "AM Rahane", "V Kohli", "RG Sharma"],
    "P Kumar": ["S Dhawan", "SK Raina", "KD Karthik", "Ch Gayle", "V Sehwag", "AB de Villiers", "David Warner", "YK Pathan", "BB McCullum"],
    "B Kumar": ["AB de Villiers", "BB McCullum", "AM Rahane", "RG Sharma", "MK Pandey", "S Dhawan", "David Warner", "KD Karthik", "Ch Gayle"],
    "PP Chawla": ["PA Patel", "David Warner", "AM Rahane", "KD Karthik", "Ch Gayle", "YK Pathan", "Virat Kohli"],
    "RV Kumar": ["BB McCullum", "David Warner", "KD Karthik", "G Gambhir", "RV Uthappa", "AM Rahane", "AB de Villiers", "RG Sharma"],
    "DJ Bravo": ["MK Pandey", "David Warner", "KD Karthik", "S Dhawan", "PA Patel", "SK Raina", "MS Dhoni"],
    "SL Malinga": ["SK Raina", "YK Pathan", "Virat Kohli", "S Dhawan", "AB de Villiers", "PA Patel", "David Warner", "V Sehwag"],
    "UT Yadav": ["PA Patel", "KD Karthik", "AB de Villiers", "G Gambhir", "RV Uthappa", "V Sehwag", "MS Dhoni", "YK Pathan", "Ch Gayle"],
    "DS Kulkarni": ["Virat Kohli", "SK Raina", "BB McCullum", "MK Pandey", "YK Pathan", "KD Karthik", "RG Sharma", "David Warner", "V Sehwag"],
    "JD Unadkat": ["RV Uthappa", "SK Raina", "Virat Kohli", "V Sehwag", "AB de Villiers", "Gautam Gambhir", "BB McCullum", "MK Pandey", "S Dhawan"],
    "R Ashwin": ["RV Uthappa", "SK Raina", "BB McCullum", "AB de Villiers", "AM Rahane", "Gautam Gambhir", "David Warner"],
    "Sr Watson": ["S Dhawan", "YK Pathan", "BB McCullum", "PA Patel", "RV Uthappa", "V Sehwag", "SK Raina"],
    "M Morkel": ["MS Dhoni", "Gautam Gambhir", "SK Raina", "Ch Gayle", "RV Uthappa"],
    "MM Sharma": ["MS Dhoni", "KD Karthik", "RV Uthappa", "PA Patel", "Virat Kohli", "SK Raina", "RG Sharma", "MK Pandey", "V Sehwag", "AM Rahane", "David Warner", "YK Pathan"]
  };

  const checkDismissals = (batsmen: string[], bowlers: string[]): string[][] => {
    const outcomes = Array(5).fill(null).map(() => Array(5).fill(""));
    while (batsmen.length < 5) batsmen.push("");
    while (bowlers.length < 5) bowlers.push("");

    batsmen.forEach((batsman, batsmanIdx) => {
      if (!batsman) return;

      bowlers.forEach((bowler, bowlerIdx) => {
        if (!bowler) return;

        const dismissalList = DISMISSAL_DATA[bowler] || [];
        const isOut = dismissalList.some(dismissed => 
          dismissed.startsWith(batsman) || batsman.startsWith(dismissed)
        );

        outcomes[batsmanIdx][bowlerIdx] = isOut ? "out" : "not out";
      });
    });

    return outcomes;
  };

  const updateBatsman = (index: number, value: string) => {
    const newBatsmen = [...data.batsmen];
    newBatsmen[index] = value;
    const newOutcomes = checkDismissals(newBatsmen, data.bowlers);
    onChange({ ...data, batsmen: newBatsmen, outcomes: newOutcomes });
  };

  const updateBowler = (index: number, value: string) => {
    const newBowlers = [...data.bowlers];
    newBowlers[index] = value;
    const newOutcomes = checkDismissals(data.batsmen, newBowlers);
    onChange({ ...data, bowlers: newBowlers, outcomes: newOutcomes });
  };

  const handleCellClick = (type: 'batsman' | 'bowler', index: number) => {
    setSelectedCell({ type, index });
    startListening();
  };

  return (
    <div className="w-full max-w-[95vw] mx-auto space-y-4">
      {selectedCell && (
        <div className="border rounded-lg bg-white shadow-md p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Button 
              onClick={startListening}
              disabled={listening}
              className="w-full"
            >
              <Mic className="w-4 h-4 mr-2" />
              {listening ? 'Listening...' : 'Start Speaking'}
            </Button>
            {transcript && (
              <Button 
                onClick={() => handleVoiceInput(selectedCell.type, selectedCell.index)}
                className="w-full"
              >
                Use: {transcript}
              </Button>
            )}
          </div>

          {transcript && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const inputWithoutSpaces = transcript.toLowerCase().replace(/\s/g, '');
                  const firstThreeChars = inputWithoutSpaces.slice(0, 3);
                  const list = selectedCell.type === 'batsman' ? PREDEFINED_BATSMEN : PREDEFINED_BOWLERS;
                  const suggestions = list.filter(name => {
                    const nameWithoutSpaces = name.replace(/\s/g, '').toLowerCase();
                    return nameWithoutSpaces.includes(firstThreeChars);
                  });

                  return suggestions.length > 0 
                    ? suggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (selectedCell.type === 'batsman') {
                              updateBatsman(selectedCell.index, suggestion);
                            } else {
                              updateBowler(selectedCell.index, suggestion);
                            }
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))
                    : <span className="text-muted-foreground">No matches</span>;
                })()}
              </div>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full mt-2">Select from List</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(selectedCell.type === 'batsman' ? PREDEFINED_BATSMEN : PREDEFINED_BOWLERS).map((name, j) => (
                <DropdownMenuItem 
                  key={j}
                  onClick={() => {
                    if (selectedCell.type === 'batsman') {
                      updateBatsman(selectedCell.index, name);
                    } else {
                      updateBowler(selectedCell.index, name);
                    }
                  }}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="border rounded-lg bg-white shadow-md">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5 bg-gray-50 text-xs sm:text-sm">Batsman/Bowler</TableHead>
              {data.bowlers.map((bowler, i) => (
                <TableHead key={i} className="w-1/5 p-0.5 sm:p-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-[10px] leading-tight sm:text-xs px-1 py-0.5 h-auto bg-blue-600 text-white hover:bg-blue-700 whitespace-normal min-h-[2rem]"
                    onClick={() => handleCellClick('bowler', i)}
                  >
                    {bowler || `B${i + 1}`}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.batsmen.map((batsman, i) => (
              <TableRow key={i}>
                <TableCell className="bg-gray-50 p-0.5 sm:p-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-[10px] leading-tight sm:text-xs px-0.5 py-0.5 h-auto bg-sky-500 text-white hover:bg-sky-600 whitespace-normal min-h-[2rem]"
                    onClick={() => handleCellClick('batsman', i)}
                  >
                    {batsman || `Bat${i + 1}`}
                  </Button>
                </TableCell>
                {data.outcomes[i]?.map((outcome, j) => (
                  <TableCell 
                    key={j} 
                    className={`text-center font-medium p-4 ${
                      outcome === "out" ? "bg-red-700 text-white" : 
                      outcome === "not out" ? "bg-green-700 text-white" : 
                      "bg-gray-50"
                    }`}
                  >
                    {outcome}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}