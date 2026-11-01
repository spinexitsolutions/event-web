import { getDb } from "@/lib/db";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return <SettingsEditor initial={getDb().settings} />;
}
