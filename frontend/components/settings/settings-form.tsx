"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Bell, Sliders, PlayCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/hooks/use-toast";

export function SettingsForm() {
    const { theme, setTheme } = useTheme();
    const {
        compactMode: contextCompactMode,
        autoPlay: contextAutoPlay,
        notifications: contextNotifications,
        saveSettings,
        resetToDefaults
    } = useSettings();
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [compactMode, setCompactMode] = useState(contextCompactMode);
    const [autoPlay, setAutoPlay] = useState(contextAutoPlay);
    const [notifications, setNotifications] = useState(contextNotifications);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with context if it changes from elsewhere
    useEffect(() => {
        setCompactMode(contextCompactMode);
        setAutoPlay(contextAutoPlay);
        setNotifications(contextNotifications);
    }, [contextCompactMode, contextAutoPlay, contextNotifications]);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        saveSettings({ compactMode, autoPlay, notifications });
        setIsSaving(false);
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated successfully.",
        });
    };

    const handleReset = () => {
        resetToDefaults();
        toast({
            title: "Reset to Defaults",
            description: "Settings have been restored to their original values.",
        });
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-violet-600" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>
                        Customize how Memora looks on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="theme">Theme Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Select your preferred color theme.
                            </p>
                        </div>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" />
                                        <span>Light</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        <span>Dark</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="h-4 w-4" />
                                        <span>System</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="compact-mode">Compact Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Use a denser UI to show more content at once.
                            </p>
                        </div>
                        <Switch
                            id="compact-mode"
                            checked={compactMode}
                            onCheckedChange={setCompactMode}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-violet-600" />
                        <CardTitle>Preferences</CardTitle>
                    </div>
                    <CardDescription>
                        Manage your personal application preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <PlayCircle className="h-4 w-4" />
                                <Label htmlFor="auto-play">Media Auto-play</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Automatically play videos when hovering in gallery.
                            </p>
                        </div>
                        <Switch
                            id="auto-play"
                            checked={autoPlay}
                            onCheckedChange={setAutoPlay}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Bell className="h-4 w-4" />
                                <Label htmlFor="notifications">Notifications</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enable toast notifications for important actions.
                            </p>
                        </div>
                        <Switch
                            id="notifications"
                            checked={notifications}
                            onCheckedChange={setNotifications}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 font-semibold">
                <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
                <Button
                    className="bg-violet-600 hover:bg-violet-700 min-w-[120px]"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </div>
    );
}
