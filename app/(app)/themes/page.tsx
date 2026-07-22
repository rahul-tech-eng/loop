import  ThemeList  from "@/components/themes/ThemeList";

export default function ThemesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Themes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Feedback grouped into themes by AI
        </p>
      </div>
      <ThemeList />
    </div>
  );
}