import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/Home";

export default function App() {
  return (
    <>
      <HomePage />
      <Toaster position="top-center" richColors />
    </>
  );
}
