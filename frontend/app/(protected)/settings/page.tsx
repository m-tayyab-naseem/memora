import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and appearance preferences.
                </p>
            </div>

            <SettingsForm />
        </div>
    );
}
