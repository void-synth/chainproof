import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useUpdateContent } from "@/hooks/use-content";

interface ShareDialogProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: {
    visibility: string;
    allowed_domains?: string[];
    allowed_emails?: string[];
    expiry_date?: string;
    download_enabled: boolean;
    watermark_enabled: boolean;
  };
}

export default function ShareDialog({
  contentId,
  isOpen,
  onClose,
  currentSettings,
}: ShareDialogProps) {
  const [visibility, setVisibility] = useState(currentSettings?.visibility || "private");
  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    currentSettings?.allowed_domains || []
  );
  const [allowedEmails, setAllowedEmails] = useState<string[]>(
    currentSettings?.allowed_emails || []
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    currentSettings?.expiry_date ? new Date(currentSettings.expiry_date) : undefined
  );
  const [downloadEnabled, setDownloadEnabled] = useState(
    currentSettings?.download_enabled ?? false
  );
  const [watermarkEnabled, setWatermarkEnabled] = useState(
    currentSettings?.watermark_enabled ?? true
  );
  const [newDomain, setNewDomain] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const { mutateAsync: updateContent, isPending } = useUpdateContent();

  const handleSave = async () => {
    try {
      await updateContent({
        id: contentId,
        data: {
          visibility,
          sharing_settings: {
            allowed_domains: allowedDomains,
            allowed_emails: allowedEmails,
            expiry_date: expiryDate?.toISOString(),
            download_enabled: downloadEnabled,
            watermark_enabled: watermarkEnabled,
          },
        },
      });
      onClose();
    } catch (error) {
      console.error("Failed to update sharing settings:", error);
    }
  };

  const addDomain = () => {
    if (newDomain && !allowedDomains.includes(newDomain)) {
      setAllowedDomains([...allowedDomains, newDomain]);
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  };

  const addEmail = () => {
    if (newEmail && !allowedEmails.includes(newEmail)) {
      setAllowedEmails([...allowedEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setAllowedEmails(allowedEmails.filter((e) => e !== email));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
          <DialogDescription>
            Configure sharing and access settings for your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="organization">Organization Only</SelectItem>
                <SelectItem value="restricted">Restricted Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visibility === "restricted" && (
            <>
              <div className="space-y-2">
                <Label>Allowed Domains</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDomain()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addDomain}
                    disabled={!newDomain}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allowedDomains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {domain}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeDomain(domain)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Email Addresses</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEmail()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addEmail}
                    disabled={!newEmail}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allowedEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {email}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeEmail(email)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Access Expiry</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? (
                    format(expiryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Downloads</Label>
                <p className="text-sm text-gray-500">
                  Enable users to download the content
                </p>
              </div>
              <Switch
                checked={downloadEnabled}
                onCheckedChange={setDownloadEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apply Watermark</Label>
                <p className="text-sm text-gray-500">
                  Add a watermark to protect your content
                </p>
              </div>
              <Switch
                checked={watermarkEnabled}
                onCheckedChange={setWatermarkEnabled}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 